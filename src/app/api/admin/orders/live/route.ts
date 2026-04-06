import { NextResponse } from "next/server";
import { getAdminRestaurantId, getAdminSession } from "@/src/lib/admin-auth";
import {
  getAdminOrderMetrics,
  getAdminOrders,
  serializeOrderForFeed,
} from "@/src/lib/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        message: "Nao autenticado.",
      },
      { status: 401 },
    );
  }

  const restaurantId = await getAdminRestaurantId(session);
  const [orders, metrics] = await Promise.all([
    getAdminOrders(restaurantId),
    getAdminOrderMetrics(restaurantId),
  ]);

  return NextResponse.json({
    orders: orders.map(serializeOrderForFeed),
    metrics,
    serverNow: new Date().toISOString(),
  });
}
