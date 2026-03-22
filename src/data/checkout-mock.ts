import { CheckoutItem } from "@/src/types/checkout";

export const checkoutItems: CheckoutItem[] = [
  { id: 1, name: "X-Burguer Artesanal", quantity: 2, price: 32 },
  { id: 2, name: "Batata Frita", quantity: 1, price: 18 },
  { id: 3, name: "Coca-Cola Lata", quantity: 1, price: 7.5 },
];

export const deliveryFeeDefault = 5;
