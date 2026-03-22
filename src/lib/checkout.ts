import { CheckoutItem, DeliveryType } from "@/src/types/checkout";

type CalculateCheckoutParams = {
  items: CheckoutItem[];
  deliveryType: DeliveryType;
  deliveryFeeDefault: number;
  discount?: number;
};

export function calculateCheckout({
  items,
  deliveryType,
  deliveryFeeDefault,
  discount = 0,
}: CalculateCheckoutParams) {
  const subtotal = items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const deliveryFee = deliveryType === "delivery" ? deliveryFeeDefault : 0;

  const total = subtotal + deliveryFee - discount;

  return {
    subtotal,
    deliveryFee,
    discount,
    total,
  };
}
