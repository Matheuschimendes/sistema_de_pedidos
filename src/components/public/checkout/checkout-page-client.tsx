"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { CheckoutHeader } from "@/src/components/public/checkout/checkout-header";
import { OrderSummary } from "@/src/components/public/checkout/order-summary";
import { DeliveryOptions } from "@/src/components/public/checkout/delivery-options";
import { CustomerForm } from "@/src/components/public/checkout/customer-form";
import { PaymentOptions } from "@/src/components/public/checkout/payment-options";
import { CheckoutFooter } from "@/src/components/public/checkout/checkout-footer";
import { OrderSuccess } from "@/src/components/public/checkout/order-success";
import { Product } from "@/src/types/menu";
import { RestaurantProfile } from "@/src/types/restaurant";
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
import {
  getCartStorageKey,
  getCustomerStorageKey,
} from "@/src/lib/storage-keys";

type CheckoutPageClientProps = {
  slug: string;
  restaurant: RestaurantProfile;
  products: Product[];
};

export function CheckoutPageClient({
  slug,
  restaurant,
  products,
}: CheckoutPageClientProps) {
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
    const cart = getCartFromStorage(getCartStorageKey(slug));
    const items = getCartItemsFromProducts(products, cart);
    let nextCustomer: CustomerData = {
      name: "",
      phone: "",
      address: "",
      notes: "",
    };

    const savedCustomer = window.localStorage.getItem(getCustomerStorageKey(slug));

    if (savedCustomer) {
      try {
        nextCustomer = JSON.parse(savedCustomer);
      } catch {
        nextCustomer = {
          name: "",
          phone: "",
          address: "",
          notes: "",
        };
      }
    }

    startTransition(() => {
      setCheckoutItems(items);
      setCustomer(nextCustomer);
      setHydrated(true);
    });
  }, [products, slug]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      getCustomerStorageKey(slug),
      JSON.stringify(customer),
    );
  }, [customer, hydrated, slug]);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
  }, [checkoutItems]);

  const discount = 0;

  const deliveryFee = useMemo(() => {
    return deliveryType === "delivery" ? restaurant.deliveryFee ?? 0 : 0;
  }, [deliveryType, restaurant.deliveryFee]);

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
*Taxa de entrega:* ${deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2).replace(".", ",")}` : "Grátis"}
*Total:* R$ ${total.toFixed(2).replace(".", ",")}

*Cliente:* ${customer.name}
*Telefone:* ${customer.phone}
*Endereço:* ${customer.address || "Retirada no balcão"}
*Observações:* ${customer.notes || "Nenhuma"}
`;

    setTimeout(() => {
      const whatsappNumber = restaurant.whatsappNumber ?? "5585991223506";
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message,
      )}`;

      window.localStorage.removeItem(getCartStorageKey(slug));
      window.localStorage.removeItem(getCustomerStorageKey(slug));

      window.open(url, "_blank");

      setSuccessOrder(orderNumber);
      setIsSubmitting(false);
    }, 1300);
  };

  if (!hydrated) {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-zinc-50 p-4">
        <div className="rounded-2xl bg-white p-5 text-base text-zinc-500 shadow-sm">
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
      <CheckoutHeader
        slug={slug}
        restaurantName={restaurant.name}
        restaurantLogo={restaurant.logo}
      />

      <div className="flex flex-col gap-4 px-4 pb-32 pt-4">
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
