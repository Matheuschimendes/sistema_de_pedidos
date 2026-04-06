import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { OrdersRealtimeBoard } from "@/src/components/admin/orders-realtime-board";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { getRestaurantForAdmin } from "@/src/lib/menu-data";
import {
  getAdminOrderMetrics,
  getAdminOrders,
  serializeOrderForFeed,
} from "@/src/lib/orders";

type OrdersActionTone = "dashboard" | "storefront";

type PageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [{ status }, restaurant, orders, metrics] = await Promise.all([
    searchParams,
    getRestaurantForAdmin(restaurantId),
    getAdminOrders(restaurantId),
    getAdminOrderMetrics(restaurantId),
  ]);

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  return (
    <AdminShell
      title="Painel de pedidos"
      description="Quadro em tempo real com atualizacao automatica e alertas instantaneos para novos pedidos."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="orders"
      actions={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <Link
            href="/admin/dashboard"
            className={getOrdersActionButtonClass("dashboard")}
          >
            <span className={getOrdersActionIconClass("dashboard")}>
              <ArrowUpRight className="h-4 w-4" />
            </span>
            Ver dashboard
          </Link>
          <Link
            href={`/${restaurant.slug}`}
            className={getOrdersActionButtonClass("storefront")}
          >
            <span className={getOrdersActionIconClass("storefront")}>
              <ArrowUpRight className="h-4 w-4" />
            </span>
            Ver vitrine
          </Link>
        </div>
      }
    >
      <OrdersRealtimeBoard
        initialOrders={orders.map(serializeOrderForFeed)}
        initialMetrics={metrics}
        initialServerNow={new Date().toISOString()}
        statusMessage={getStatusMessage(status)}
        restaurantDeliveryTime={restaurant.deliveryTime}
      />
    </AdminShell>
  );
}

function getStatusMessage(status?: string) {
  switch (status) {
    case "advanced":
      return "Pedido atualizado para a proxima etapa do fluxo.";
    case "updated":
      return "Status do pedido salvo com sucesso.";
    case "canceled":
      return "Pedido cancelado com sucesso.";
    case "already-canceled":
      return "Esse pedido ja estava cancelado.";
    case "locked":
      return "Esse pedido ja foi encerrado e nao pode mais ser alterado por essa acao.";
    case "missing":
      return "Nao foi possivel localizar o pedido solicitado.";
    case "invalid":
      return "Status invalido enviado para atualizacao.";
    case "unchanged":
      return "O pedido ja estava nesse status.";
    default:
      return null;
  }
}

function getOrdersActionButtonClass(tone: OrdersActionTone) {
  const baseClassName =
    "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition";

  switch (tone) {
    case "dashboard":
      return `${baseClassName} border-sky-700 bg-sky-600 text-white hover:bg-sky-700`;
    case "storefront":
      return `${baseClassName} border-teal-700 bg-teal-600 text-white hover:bg-teal-700`;
  }
}

function getOrdersActionIconClass(tone: OrdersActionTone) {
  const baseClassName =
    "inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white";

  switch (tone) {
    case "dashboard":
    case "storefront":
      return baseClassName;
  }
}
