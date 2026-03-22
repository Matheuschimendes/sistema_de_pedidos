export type DeliveryType = "delivery" | "pickup";

export type PaymentMethod = "pix" | "credit" | "debit" | "cash";

export type CheckoutItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

export type CustomerData = {
  name: string;
  phone: string;
  address: string;
  notes: string;
};
