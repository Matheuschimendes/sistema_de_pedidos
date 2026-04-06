import { prisma } from "@/src/lib/prisma";
import { DeliveryType, PaymentMethod } from "@/src/types/checkout";
import {
  buildOrderStatusNotificationMessage,
  formatOrderNumber,
  getDeliveryTypeLabel,
  getNextOrderStatus,
  getOrderStatusMeta,
  getPaymentMethodLabel,
  getOrderStatusNotificationText,
  isOrderLocked,
  normalizePhoneNumber,
  orderStatusFlow,
  orderStatusOptions,
} from "@/src/lib/order-presentation";
import { Order, OrderFeedItem, OrderItem, OrderMetrics, OrderStatus } from "@/src/types/order";

export {
  buildOrderStatusNotificationMessage,
  formatOrderNumber,
  getDeliveryTypeLabel,
  getNextOrderStatus,
  getOrderStatusMeta,
  getPaymentMethodLabel,
  getOrderStatusNotificationText,
  isOrderLocked,
  normalizePhoneNumber,
  orderStatusFlow,
  orderStatusOptions,
};

type DecimalValue = { toNumber(): number } | number | null | undefined;

type OrderItemRecord = {
  id: string;
  productId: number | null;
  productName: string;
  quantity: number;
  unitPrice: DecimalValue;
  lineTotal: DecimalValue;
};

type OrderRecord = {
  id: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  customerNotes: string | null;
  subtotal: DecimalValue;
  deliveryFee: DecimalValue;
  discount: DecimalValue;
  total: DecimalValue;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemRecord[];
};

function toNumber(value: DecimalValue) {
  if (value == null) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return value.toNumber();
}
function mapOrderItemRecordToOrderItem(item: OrderItemRecord): OrderItem {
  return {
    id: item.id,
    productId: item.productId ?? undefined,
    name: item.productName,
    quantity: item.quantity,
    unitPrice: toNumber(item.unitPrice),
    total: toNumber(item.lineTotal),
  };
}

export function mapOrderRecordToOrder(order: OrderRecord): Order {
  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    status: order.status,
    deliveryType: order.deliveryType,
    paymentMethod: order.paymentMethod,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress ?? undefined,
    customerNotes: order.customerNotes ?? undefined,
    subtotal: toNumber(order.subtotal),
    deliveryFee: toNumber(order.deliveryFee),
    discount: toNumber(order.discount),
    total: toNumber(order.total),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map(mapOrderItemRecordToOrderItem),
  };
}

export function serializeOrderForFeed(order: Order): OrderFeedItem {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function getAdminOrders(
  restaurantId: string,
  options?: {
    includeCanceled?: boolean;
  },
): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      ...(options?.includeCanceled ? {} : { status: { not: "canceled" } }),
    },
    include: {
      items: {
        orderBy: [{ createdAt: "asc" }],
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return orders.map(mapOrderRecordToOrder);
}

export async function getAdminOrderMetrics(
  restaurantId: string,
): Promise<OrderMetrics> {
  const [total, pending, confirmed, preparing, ready, completed, canceled] =
    await Promise.all([
      prisma.order.count({
        where: { restaurantId },
      }),
      prisma.order.count({
        where: { restaurantId, status: "pending" },
      }),
      prisma.order.count({
        where: { restaurantId, status: "confirmed" },
      }),
      prisma.order.count({
        where: { restaurantId, status: "preparing" },
      }),
      prisma.order.count({
        where: { restaurantId, status: "ready" },
      }),
      prisma.order.count({
        where: { restaurantId, status: "completed" },
      }),
      prisma.order.count({
        where: { restaurantId, status: "canceled" },
      }),
    ]);

  return {
    total,
    pending,
    confirmed,
    preparing,
    ready,
    active: confirmed + preparing + ready,
    open: pending + confirmed + preparing + ready,
    completed,
    canceled,
  };
}
