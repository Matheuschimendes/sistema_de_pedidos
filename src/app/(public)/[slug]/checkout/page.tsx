"use client";

import { useMemo, useState } from "react";
import { checkoutItems, deliveryFeeDefault } from "@/src/data/checkout-mock";
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
} from "@/src/types/checkout";

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

  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
  }, []);

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
    if (!customer.name.trim() || !customer.phone.trim()) {
      alert("Preencha nome e WhatsApp para continuar.");
      return;
    }

    if (deliveryType === "delivery" && !customer.address.trim()) {
      alert("Preencha o endereço de entrega.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderNumber = `#${Math.floor(Math.random() * 9000 + 1000)}`;
      setSuccessOrder(orderNumber);
      setIsSubmitting(false);
    }, 1300);
  };

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
        disabled={isSubmitting}
        onConfirm={handleConfirm}
      />
    </main>
  );
}