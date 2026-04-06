import { DeliveryType, PaymentMethod } from "@/src/types/checkout";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "canceled";

export type OrderItem = {
  id: string;
  productId?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNotes?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
};

export type OrderFeedItem = Omit<Order, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type OrderMetrics = {
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  active: number;
  open: number;
  completed: number;
  canceled: number;
};
