"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { createOrderAction } from "@/src/app/(public)/[slug]/checkout/actions";
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
  const [submitError, setSubmitError] = useState<string | null>(null);
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
  const deliveryFeeToCombine = /combinar/i.test(restaurant.deliveryTime ?? "");

  const deliveryFee = useMemo(() => {
    return deliveryType === "delivery" ? restaurant.deliveryFee ?? 0 : 0;
  }, [deliveryType, restaurant.deliveryFee]);

  const total = useMemo(() => {
    return subtotal + deliveryFee - discount;
  }, [subtotal, deliveryFee, discount]);

  const updateCustomer = (field: keyof CustomerData, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
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
    setSubmitError(null);

    const result = await createOrderAction({
      slug,
      deliveryType,
      paymentMethod,
      customer,
      items: checkoutItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    });

    if (!result.ok) {
      setSubmitError(result.message);
      setIsSubmitting(false);
      return;
    }

    if (result.whatsappUrl) {
      const whatsappWindow = window.open(
        result.whatsappUrl,
        "_blank",
        "noopener,noreferrer",
      );

      if (!whatsappWindow) {
        window.location.href = result.whatsappUrl;
      }
    }

    startTransition(() => {
      window.localStorage.removeItem(getCartStorageKey(slug));
      window.localStorage.removeItem(getCustomerStorageKey(slug));
      setSuccessOrder(result.orderNumber);
      setIsSubmitting(false);
    });
  };

  if (!hydrated) {
    return (
      <main className="page-shell min-h-screen px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[520px] rounded-[32px] border border-[var(--brand-border)]/80 bg-white p-5 text-base text-zinc-500 shadow-[var(--brand-shadow-lg)]">
          Carregando checkout...
        </div>
      </main>
    );
  }

  if (successOrder) {
    return (
      <main className="page-shell min-h-screen px-3 py-3 sm:px-4">
        <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[520px] flex-col overflow-hidden rounded-[32px] border border-[var(--brand-border)]/80 bg-white shadow-[var(--brand-shadow-lg)]">
          <OrderSuccess
            slug={slug}
            orderNumber={successOrder}
            items={checkoutItems}
            total={total}
            deliveryType={deliveryType}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell min-h-screen px-3 py-3 sm:px-4">
      <div className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-[520px] overflow-hidden rounded-[32px] border border-[var(--brand-border)]/80 bg-white shadow-[var(--brand-shadow-lg)]">
        <CheckoutHeader
          slug={slug}
          restaurantName={restaurant.name}
          restaurantLogo={restaurant.logo}
        />

        <div className="flex flex-col gap-4 px-4 pb-36 pt-4">
          <OrderSummary items={checkoutItems} subtotal={subtotal} />

          <DeliveryOptions
            value={deliveryType}
            deliveryFee={restaurant.deliveryFee ?? 0}
            deliveryFeeToCombine={deliveryFeeToCombine}
            onChange={setDeliveryType}
          />

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
          deliveryFeeToCombine={deliveryType === "delivery" && deliveryFeeToCombine}
          discount={discount}
          total={total}
          showDeliveryFee={deliveryType === "delivery"}
          disabled={isSubmitting || checkoutItems.length === 0}
          errorMessage={submitError}
          onConfirm={() => {
            void handleConfirm();
          }}
        />
      </div>
    </main>
  );
}
