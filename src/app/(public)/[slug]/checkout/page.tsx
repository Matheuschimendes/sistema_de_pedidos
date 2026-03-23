"use client";

import { useEffect, useMemo, useState } from "react";
import { menuProducts } from "@/src/data/menu-products";
import { deliveryFeeDefault } from "@/src/data/checkout-mock";
import { CheckoutHeader } from "@/src/components/public/checkout/checkout-header";
import { OrderSummary } from "@/src/components/public/checkout/order-summary";
import { DeliveryOptions } from "@/src/components/public/checkout/delivery-options";
import { CustomerForm } from "@/src/components/public/checkout/customer-form";
import { PaymentOptions } from "@/src/components/public/checkout/payment-options";
import { CheckoutFooter } from "@/src/components/public/checkout/checkout-footer";
import { OrderSuccess } from "@/src/components/public/checkout/order-success";
import {
  CustomerData,
  DeliveryType,
  PaymentMethod,
  CheckoutItem,
} from "@/src/types/checkout";
import {
  getCartFromStorage,
  getCartItemsFromProducts,
} from "@/src/lib/get-cart-items";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  return <CheckoutClient slug={slug} />;
}

function CheckoutClient({ slug }: { slug: string }) {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    const cart = getCartFromStorage("mesa-cart");
    const items = getCartItemsFromProducts(menuProducts, cart);
    setCheckoutItems(items);

    const savedCustomer = window.localStorage.getItem("customer-data");

    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch {
        setCustomer({
          name: "",
          phone: "",
          address: "",
          notes: "",
        });
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("customer-data", JSON.stringify(customer));
  }, [customer, hydrated]);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
  }, [checkoutItems]);

  const discount = 0;

  const deliveryFee = useMemo(() => {
    return deliveryType === "delivery" ? deliveryFeeDefault : 0;
  }, [deliveryType]);

  const total = useMemo(() => {
    return subtotal + deliveryFee - discount;
  }, [subtotal, deliveryFee, discount]);

  const updateCustomer = (field: keyof CustomerData, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    if (checkoutItems.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    if (!customer.name.trim() || !customer.phone.trim()) {
      alert("Preencha nome e WhatsApp para continuar.");
      return;
    }

    if (deliveryType === "delivery" && !customer.address.trim()) {
      alert("Preencha o endereço de entrega.");
      return;
    }

    setIsSubmitting(true);

    const orderNumber = `#${Math.floor(Math.random() * 9000 + 1000)}`;

    const itemsText = checkoutItems
      .map((item) => `${item.quantity}x ${item.name}`)
      .join("\n");

    const message = `
*Novo pedido ${orderNumber}*

*Itens:*
${itemsText}

*Entrega:* ${deliveryType === "delivery" ? "Delivery" : "Retirada"}
*Pagamento:* ${paymentMethod}
*Total:* R$ ${total.toFixed(2).replace(".", ",")}

*Cliente:* ${customer.name}
*Telefone:* ${customer.phone}
*Endereço:* ${customer.address || "Retirada no balcão"}
*Observações:* ${customer.notes || "Nenhuma"}
`;

    setTimeout(() => {
      const whatsappNumber = "5585991223506";

      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;

      window.localStorage.removeItem("mesa-cart");
      window.localStorage.removeItem("customer-data");

      window.open(url, "_blank");

      setSuccessOrder(orderNumber);
      setIsSubmitting(false);
    }, 1300);
  };

  if (!hydrated) {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-zinc-50 p-4">
        <div className="rounded-2xl bg-white p-4 text-sm text-zinc-500 shadow-sm">
          Carregando checkout...
        </div>
      </main>
    );
  }

  if (successOrder) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-zinc-50">
        <OrderSuccess
          slug={slug}
          orderNumber={successOrder}
          items={checkoutItems}
          total={total}
          deliveryType={deliveryType}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-zinc-50">
      <CheckoutHeader slug={slug} />

      <div className="flex flex-col gap-3 px-4 pb-32 pt-3">
        <OrderSummary items={checkoutItems} subtotal={subtotal} />

        <DeliveryOptions value={deliveryType} onChange={setDeliveryType} />

        <CustomerForm
          data={customer}
          deliveryType={deliveryType}
          onChange={updateCustomer}
        />

        <PaymentOptions value={paymentMethod} onChange={setPaymentMethod} />
      </div>

      <CheckoutFooter
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        discount={discount}
        total={total}
        showDeliveryFee={deliveryType === "delivery"}
        disabled={isSubmitting || checkoutItems.length === 0}
        onConfirm={handleConfirm}
      />
    </main>
  );
}