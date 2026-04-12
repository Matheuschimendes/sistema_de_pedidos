"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import {
  buildOrderStatusNotificationMessage,
  formatOrderNumber,
  getNextOrderStatus,
  isOrderLocked,
  normalizePhoneNumber,
} from "@/src/lib/orders";
import { prisma } from "@/src/lib/prisma";
import { OrderStatus } from "@/src/types/order";

const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "canceled",
]);

type OrderActionResult =
  | {
      ok: true;
      message: string;
      status: OrderStatus;
      orderNumber: string;
      notification: {
        whatsappUrl: string | null;
        message: string;
      };
    }
  | {
      ok: false;
      message: string;
    };

function revalidateOrderPaths() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/sales");
}

async function getAdminOrderContext(orderId: string) {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);

  return prisma.order.findFirst({
    where: {
      id: orderId,
      restaurantId,
    },
    select: {
      id: true,
      status: true,
      deliveryType: true,
      customerName: true,
      customerPhone: true,
      restaurant: {
        select: {
          name: true,
          whatsappNumber: true,
        },
      },
    },
  });
}

function buildOrderNotificationResult(params: {
  message: string;
  order: NonNullable<Awaited<ReturnType<typeof getAdminOrderContext>>>;
  nextStatus: OrderStatus;
}): OrderActionResult {
  const restaurantWhatsappNumber = normalizePhoneNumber(
    params.order.restaurant.whatsappNumber ?? "",
  );

  if (!restaurantWhatsappNumber) {
    return {
      ok: false,
      message:
        "Configure o WhatsApp da loja no Dashboard para enviar atualizacoes de status ao cliente.",
    };
  }

  const customerPhone = normalizePhoneNumber(params.order.customerPhone);

  if (!customerPhone) {
    return {
      ok: false,
      message:
        "Este pedido nao possui um WhatsApp valido do cliente para envio da atualizacao.",
    };
  }

  const notificationMessage = buildOrderStatusNotificationMessage({
    restaurantName: params.order.restaurant.name,
    restaurantWhatsappNumber,
    orderId: params.order.id,
    customerName: params.order.customerName,
    status: params.nextStatus,
    deliveryType: params.order.deliveryType,
  });

  return {
    ok: true,
    message: params.message,
    status: params.nextStatus,
    orderNumber: formatOrderNumber(params.order.id),
    notification: {
      whatsappUrl: customerPhone
        ? `https://wa.me/${customerPhone}?text=${encodeURIComponent(
            notificationMessage,
          )}`
        : null,
      message: notificationMessage,
    },
  };
}

async function commitOrderStatusChange(
  orderId: string,
  nextStatus: OrderStatus,
  successMessage: string,
): Promise<OrderActionResult> {
  const order = await getAdminOrderContext(orderId);

  if (!order) {
    return {
      ok: false,
      message: "Nao foi possivel localizar o pedido solicitado.",
    };
  }

  if (order.status === nextStatus) {
    return {
      ok: false,
      message: "O pedido ja esta nesse status.",
    };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
    },
  });

  revalidateOrderPaths();

  return buildOrderNotificationResult({
    message: successMessage,
    order,
    nextStatus,
  });
}

export async function advanceOrderStatusAction(
  orderId: string,
): Promise<OrderActionResult> {
  const order = await getAdminOrderContext(orderId);

  if (!order) {
    return {
      ok: false,
      message: "Nao foi possivel localizar o pedido solicitado.",
    };
  }

  if (isOrderLocked(order.status)) {
    return {
      ok: false,
      message: "Esse pedido ja foi encerrado e nao pode mais avancar.",
    };
  }

  const nextStatus = getNextOrderStatus(order.status);

  if (!nextStatus) {
    return {
      ok: false,
      message: "Nao existe uma proxima etapa para esse pedido.",
    };
  }

  return commitOrderStatusChange(
    orderId,
    nextStatus,
    "Pedido atualizado para a proxima etapa e mensagem preparada para o cliente.",
  );
}

export async function acceptPendingOrderAction(
  orderId: string,
): Promise<OrderActionResult> {
  const order = await getAdminOrderContext(orderId);

  if (!order) {
    return {
      ok: false,
      message: "Nao foi possivel localizar o pedido solicitado.",
    };
  }

  if (order.status !== "pending") {
    return {
      ok: false,
      message:
        "Somente pedidos aguardando confirmacao podem ser aceitos por esta acao.",
    };
  }

  return commitOrderStatusChange(
    orderId,
    "confirmed",
    "Pedido aceito e mensagem preparada para o cliente.",
  );
}

export async function cancelOrderAction(
  orderId: string,
): Promise<OrderActionResult> {
  const order = await getAdminOrderContext(orderId);

  if (!order) {
    return {
      ok: false,
      message: "Nao foi possivel localizar o pedido solicitado.",
    };
  }

  if (order.status === "canceled") {
    return {
      ok: false,
      message: "Esse pedido ja estava cancelado.",
    };
  }

  if (order.status === "completed") {
    return {
      ok: false,
      message: "Esse pedido ja foi concluido e nao pode ser cancelado.",
    };
  }

  const cancellationMessage =
    order.status === "pending"
      ? "Pedido nao aceito e aviso preparado para o cliente."
      : "Pedido cancelado e aviso preparado para o cliente.";

  return commitOrderStatusChange(
    orderId,
    "canceled",
    cancellationMessage,
  );
}

export async function rejectPendingOrderAction(
  orderId: string,
): Promise<OrderActionResult> {
  const order = await getAdminOrderContext(orderId);

  if (!order) {
    return {
      ok: false,
      message: "Nao foi possivel localizar o pedido solicitado.",
    };
  }

  if (order.status !== "pending") {
    return {
      ok: false,
      message:
        "Somente pedidos aguardando confirmacao podem ser recusados por esta acao.",
    };
  }

  return commitOrderStatusChange(
    orderId,
    "canceled",
    "Pedido nao aceito e aviso preparado para o cliente.",
  );
}

export async function updateOrderStatusAction(
  orderId: string,
  nextStatus: string,
): Promise<OrderActionResult> {
  const parsedStatus = orderStatusSchema.safeParse(nextStatus);

  if (!parsedStatus.success) {
    return {
      ok: false,
      message: "Status invalido enviado para atualizacao.",
    };
  }

  return commitOrderStatusChange(
    orderId,
    parsedStatus.data,
    "Status do pedido salvo e mensagem preparada para o cliente.",
  );
}
