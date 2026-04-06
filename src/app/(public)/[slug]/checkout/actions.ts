"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calculateCheckout } from "@/src/lib/checkout";
import {
  formatOrderNumber,
  getDeliveryTypeLabel,
  getPaymentMethodLabel,
  normalizePhoneNumber,
} from "@/src/lib/orders";
import { prisma } from "@/src/lib/prisma";

const customerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  phone: z.string().trim().min(8, "Informe um WhatsApp valido."),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const checkoutOrderSchema = z.object({
  slug: z.string().trim().min(1),
  deliveryType: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["pix", "credit", "debit", "cash"]),
  customer: customerSchema,
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().positive().max(50),
      }),
    )
    .min(1, "Adicione ao menos um item ao pedido."),
});

type CreateOrderInput = z.infer<typeof checkoutOrderSchema>;

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      whatsappUrl: string | null;
    }
  | {
      ok: false;
      message: string;
    };

type DecimalValue = { toNumber(): number } | number | null | undefined;

function toNumber(value: DecimalValue) {
  if (value == null) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return value.toNumber();
}

function groupRequestedItems(items: CreateOrderInput["items"]) {
  const quantitiesByProduct = new Map<number, number>();

  for (const item of items) {
    quantitiesByProduct.set(
      item.id,
      (quantitiesByProduct.get(item.id) ?? 0) + item.quantity,
    );
  }

  return Array.from(quantitiesByProduct.entries()).map(([id, quantity]) => ({
    id,
    quantity,
  }));
}

function buildWhatsappMessage(params: {
  orderNumber: string;
  items: Array<{
    quantity: number;
    productName: string;
  }>;
  deliveryType: "delivery" | "pickup";
  paymentMethod: "pix" | "credit" | "debit" | "cash";
  deliveryFee: number;
  total: number;
  customer: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  };
}) {
  const itemsText = params.items
    .map((item) => `${item.quantity}x ${item.productName}`)
    .join("\n");

  return `
*Novo pedido ${params.orderNumber}*

*Itens:*
${itemsText}

*Entrega:* ${getDeliveryTypeLabel(params.deliveryType)}
*Pagamento:* ${getPaymentMethodLabel(params.paymentMethod)}
*Taxa de entrega:* ${
    params.deliveryFee > 0
      ? `R$ ${params.deliveryFee.toFixed(2).replace(".", ",")}`
      : "Gratis"
  }
*Total:* R$ ${params.total.toFixed(2).replace(".", ",")}

*Cliente:* ${params.customer.name}
*Telefone:* ${params.customer.phone}
*Endereco:* ${params.customer.address || "Retirada no balcao"}
*Observacoes:* ${params.customer.notes || "Nenhuma"}
`.trim();
}

export async function createOrderAction(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const validatedFields = checkoutOrderSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      ok: false,
      message: "Revise os dados do pedido e tente novamente.",
    };
  }

  const { slug, customer, deliveryType, paymentMethod } = validatedFields.data;
  const requestedItems = groupRequestedItems(validatedFields.data.items);
  const customerPhone =
    normalizePhoneNumber(customer.phone) || customer.phone.trim();

  if (deliveryType === "delivery" && !customer.address?.trim()) {
    return {
      ok: false,
      message: "Preencha o endereco para pedidos com entrega.",
    };
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      whatsappNumber: true,
      deliveryFee: true,
    },
  });

  if (!restaurant) {
    return {
      ok: false,
      message: "Restaurante nao encontrado para esse pedido.",
    };
  }

  const products = await prisma.product.findMany({
    where: {
      restaurantId: restaurant.id,
      isAvailable: true,
      id: {
        in: requestedItems.map((item) => item.id),
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  if (products.length !== requestedItems.length) {
    return {
      ok: false,
      message:
        "Alguns itens do carrinho nao estao mais disponiveis. Atualize o pedido antes de continuar.",
    };
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const checkoutItems = requestedItems.map((item) => {
    const product = productById.get(item.id);

    if (!product) {
      throw new Error("Produto nao encontrado para finalizar o pedido.");
    }

    return {
      id: product.id,
      name: product.name,
      quantity: item.quantity,
      price: toNumber(product.price),
    };
  });

  const totals = calculateCheckout({
    items: checkoutItems,
    deliveryType,
    deliveryFeeDefault: toNumber(restaurant.deliveryFee),
  });

  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      status: "pending",
      deliveryType,
      paymentMethod,
      customerName: customer.name,
      customerPhone,
      customerAddress: deliveryType === "delivery" ? customer.address?.trim() : null,
      customerNotes: customer.notes?.trim() || null,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      total: totals.total,
      items: {
        create: checkoutItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          lineTotal: item.price * item.quantity,
        })),
      },
    },
    include: {
      items: {
        orderBy: [{ createdAt: "asc" }],
      },
    },
  });

  const orderNumber = formatOrderNumber(order.id);
  const whatsappNumber = normalizePhoneNumber(restaurant.whatsappNumber ?? "");
  const whatsappMessage = buildWhatsappMessage({
    orderNumber,
    items: order.items.map((item) => ({
      quantity: item.quantity,
      productName: item.productName,
    })),
    deliveryType: order.deliveryType,
    paymentMethod: order.paymentMethod,
    deliveryFee: toNumber(order.deliveryFee),
    total: toNumber(order.total),
    customer: {
      name: order.customerName,
      phone: customerPhone,
      address: order.customerAddress ?? undefined,
      notes: order.customerNotes ?? undefined,
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath(`/${restaurant.slug}/checkout`);

  return {
    ok: true,
    orderId: order.id,
    orderNumber,
    whatsappUrl: whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          whatsappMessage,
        )}`
      : null,
  };
}
