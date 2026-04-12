import Link from "next/link";
import { Clock3, EyeOff, Filter, Plus, Search } from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { OrderDecisionControls } from "@/src/components/admin/order-decision-controls";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { formatBRL } from "@/src/lib/format";
import { getRestaurantForAdmin } from "@/src/lib/menu-data";
import {
  getAdminOrders,
  getDeliveryTypeLabel,
  getOrderStatusMeta,
  getPaymentMethodLabel,
} from "@/src/lib/orders";
import { Order, OrderItem, OrderStatus } from "@/src/types/order";

type OrdersRange = "today" | "7d" | "30d" | "all";
type OrdersView = "history" | "open" | "pending" | "quotes";
type OrdersStage = "all" | OrderStatus;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    range?: string;
    totals?: string;
    view?: string;
    stage?: string;
    status?: string;
  }>;
};

const RANGE_OPTIONS: Array<{ value: OrdersRange; label: string }> = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "Ultimos 7 dias" },
  { value: "30d", label: "Ultimos 30 dias" },
  { value: "all", label: "Todo periodo" },
];

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [{ q, range, totals, view, stage, status }, restaurant, orders] = await Promise.all([
    searchParams,
    getRestaurantForAdmin(restaurantId),
    getAdminOrders(restaurantId, { includeCanceled: true }),
  ]);

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  const selectedRange = parseOrdersRange(range);
  const selectedView = parseOrdersView(view);
  const selectedStage = parseOrdersStage(stage, selectedView);
  const stageOptions = getStageOptionsForView(selectedView);
  const searchQuery = q?.trim() ?? "";
  const shouldHideTotals = totals === "hidden";
  const statusMessage = getStatusMessage(status);

  const ordersByView = filterOrdersByView(orders, selectedView);
  const ordersInRange = filterOrdersByRange(ordersByView, selectedRange, new Date());
  const ordersByStage = filterOrdersByStage(ordersInRange, selectedStage);
  const searchedOrders = filterOrdersBySearch(ordersByStage, searchQuery);
  const filteredOrders = sortOrdersForDisplay(
    searchedOrders,
    selectedView,
    selectedStage,
  );

  return (
    <AdminShell
      title="Pedidos"
      description="Painel de pedidos em lista com historico, filtros e acompanhamento."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="orders"
    >
      <div className="space-y-4">
        {statusMessage ? (
          <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {statusMessage}
          </div>
        ) : null}

        <section className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-center gap-2">
                <Link
                  href={buildOrdersHref({
                    view: "open",
                    stage: normalizeStageForView(selectedStage, "open"),
                    range: selectedRange,
                    totals: shouldHideTotals ? "hidden" : undefined,
                    q: searchQuery,
                  })}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  <Plus className="h-4 w-4" />
                  Nova venda - F3
                </Link>
                <Link
                  href={buildOrdersHref({
                    view: "open",
                    stage: normalizeStageForView(selectedStage, "open"),
                    range: selectedRange,
                    totals: shouldHideTotals ? "hidden" : undefined,
                  })}
                  className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                >
                  Novo pedido
                </Link>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-400"
                >
                  Novo orçamento
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border-b border-zinc-200">
              <div className="flex min-w-max items-end gap-6 text-[1.03rem] text-zinc-700">
                {renderViewTab({
                  currentView: selectedView,
                  targetView: "open",
                  stage: selectedStage,
                  label: "Pedido em aberto",
                  range: selectedRange,
                  totals: shouldHideTotals ? "hidden" : undefined,
                  q: searchQuery,
                })}
                {renderViewTab({
                  currentView: selectedView,
                  targetView: "pending",
                  stage: selectedStage,
                  label: "Pedido a aceitar",
                  range: selectedRange,
                  totals: shouldHideTotals ? "hidden" : undefined,
                  q: searchQuery,
                })}
                {renderViewTab({
                  currentView: selectedView,
                  targetView: "quotes",
                  stage: selectedStage,
                  label: "Orcamentos",
                  range: selectedRange,
                  totals: shouldHideTotals ? "hidden" : undefined,
                  q: searchQuery,
                })}
                {renderViewTab({
                  currentView: selectedView,
                  targetView: "history",
                  stage: selectedStage,
                  label: "Historico",
                  range: selectedRange,
                  totals: shouldHideTotals ? "hidden" : undefined,
                  q: searchQuery,
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <form
                action="/admin/orders"
                className="flex w-full items-center gap-2 rounded-[14px] border border-zinc-200 bg-zinc-50 px-3 py-2.5 lg:max-w-[420px]"
              >
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Buscar por numero, cliente ou item"
                  className="w-full min-w-0 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                />
                <input type="hidden" name="view" value={selectedView} />
                <input type="hidden" name="range" value={selectedRange} />
                <input type="hidden" name="stage" value={selectedStage} />
                {shouldHideTotals ? <input type="hidden" name="totals" value="hidden" /> : null}
              </form>

              <div className="flex flex-col gap-2 text-sm text-zinc-700">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    Filtros
                  </div>
                  <span className="text-zinc-300">|</span>
                  <div className="flex flex-wrap gap-1.5">
                    {RANGE_OPTIONS.map((option) => (
                      <Link
                        key={option.value}
                        href={buildOrdersHref({
                          q: searchQuery,
                          view: selectedView,
                          stage: selectedStage,
                          range: option.value,
                          totals: shouldHideTotals ? "hidden" : undefined,
                        })}
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          selectedRange === option.value
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        {option.label}
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-zinc-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 text-sm text-zinc-500">
            <span>{filteredOrders.length} pedido(s) no resultado</span>
            <Link
              href={buildOrdersHref({
                q: searchQuery,
                view: selectedView,
                stage: selectedStage,
                range: selectedRange,
                totals: shouldHideTotals ? undefined : "hidden",
              })}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50"
            >
              <EyeOff className="h-4 w-4" />
              {shouldHideTotals ? "Mostrar total" : "Ocultar total"}
            </Link>
          </div>

          <div className="border-b border-zinc-200 bg-zinc-50/70 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {getStageMenuTitle(selectedView)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {stageOptions.map((option) => (
                <Link
                  key={option.value}
                  href={buildOrdersHref({
                    q: searchQuery,
                    view: selectedView,
                    stage: option.value,
                    range: selectedRange,
                    totals: shouldHideTotals ? "hidden" : undefined,
                  })}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedStage === option.value
                      ? "border-sky-600 bg-sky-600 text-white shadow-[0_8px_18px_rgba(2,132,199,0.18)]"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center px-4 py-8">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-zinc-300 bg-zinc-50 text-zinc-400">
                  <Clock3 className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-800">
                  Sem transações registradas
                </h3>
                <p className="mt-2 text-base text-zinc-500">
                  Seus pedidos aparecerao aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1260px] divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Acao</th>
                    <th className="px-3 py-2 text-left">Numero</th>
                    <th className="px-3 py-2 text-left">Resumo</th>
                    <th className="px-3 py-2 text-left">Tipo</th>
                    <th className="px-3 py-2 text-left">Data</th>
                    <th className="px-3 py-2 text-left">Hora</th>
                    <th className="px-3 py-2 text-left">Origem</th>
                    <th className="px-3 py-2 text-right">Itens</th>
                    <th className="px-3 py-2 text-left">Cliente</th>
                    <th className="px-3 py-2 text-left">Observacao</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {filteredOrders.map((order) => {
                    const orderStatus = getOrderStatusMeta(order.status, order.deliveryType);
                    const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                      <tr key={order.id} className="align-top">
                        <td className="px-3 py-3">
                          <div className="min-w-[260px] space-y-2">
                            <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                              {orderStatus.label}
                            </span>
                            <OrderDecisionControls
                              orderId={order.id}
                              status={order.status}
                              deliveryType={order.deliveryType}
                            />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-zinc-900">
                          {order.orderNumber}
                        </td>
                        <td className="max-w-[280px] px-3 py-3 text-zinc-700">
                          <span className="line-clamp-1">{getOrderItemsSummary(order.items)}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-zinc-700">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-zinc-700">
                          {formatOrderDate(order.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-zinc-700">
                          {formatOrderTime(order.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-zinc-700">
                          {getDeliveryTypeLabel(order.deliveryType)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-zinc-800">
                          {itemsCount}
                        </td>
                        <td className="max-w-[220px] truncate px-3 py-3 text-zinc-700">
                          {order.customerName}
                        </td>
                        <td className="max-w-[260px] px-3 py-3 text-zinc-500">
                          <span className="line-clamp-1">{order.customerNotes?.trim() || "--"}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-zinc-900">
                          {shouldHideTotals ? "••••" : formatBRL(order.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function renderViewTab(params: {
  currentView: OrdersView;
  targetView: OrdersView;
  stage: OrdersStage;
  label: string;
  range: OrdersRange;
  totals?: "hidden";
  q?: string;
}) {
  const active = params.currentView === params.targetView;

  if (active) {
    return (
      <span className="border-b-2 border-sky-500 pb-2 font-semibold text-zinc-950">
        {params.label}
      </span>
    );
  }

  const stageForTargetView = normalizeStageForView(
    params.stage,
    params.targetView,
  );

  return (
    <Link
      href={buildOrdersHref({
        view: params.targetView,
        stage: stageForTargetView,
        range: params.range,
        totals: params.totals,
        q: params.q,
      })}
      className="pb-2 transition hover:text-zinc-900"
    >
      {params.label}
    </Link>
  );
}

function parseOrdersRange(value: string | undefined): OrdersRange {
  if (value === "today" || value === "7d" || value === "30d" || value === "all") {
    return value;
  }

  return "7d";
}

function parseOrdersView(value: string | undefined): OrdersView {
  if (value === "history" || value === "open" || value === "pending" || value === "quotes") {
    return value;
  }

  return "open";
}

function parseOrdersStage(
  value: string | undefined,
  view: OrdersView,
): OrdersStage {
  const allowedStages = getStageOptionsForView(view).map((option) => option.value);

  if (value && allowedStages.includes(value as OrdersStage)) {
    return value as OrdersStage;
  }

  return getDefaultStageForView(view);
}

function getDefaultStageForView(view: OrdersView): OrdersStage {
  return view === "pending" ? "pending" : "all";
}

function normalizeStageForView(stage: OrdersStage, view: OrdersView): OrdersStage {
  const allowedStages = getStageOptionsForView(view).map((option) => option.value);

  if (allowedStages.includes(stage)) {
    return stage;
  }

  return getDefaultStageForView(view);
}

function getStageOptionsForView(view: OrdersView): Array<{
  value: OrdersStage;
  label: string;
}> {
  if (view === "open") {
    return [
      { value: "all", label: "Todos" },
      { value: "pending", label: "Pendente" },
      { value: "confirmed", label: "Confirmado" },
      { value: "preparing", label: "Em preparo" },
      { value: "ready", label: "Pronto / rota" },
    ];
  }

  if (view === "history") {
    return [
      { value: "all", label: "Todos" },
      { value: "completed", label: "Concluido" },
      { value: "canceled", label: "Cancelado" },
    ];
  }

  if (view === "pending") {
    return [{ value: "pending", label: "Pendente" }];
  }

  return [{ value: "all", label: "Todos" }];
}

function getStageMenuTitle(view: OrdersView) {
  switch (view) {
    case "open":
      return "Menu de etapas - pedidos em aberto";
    case "pending":
      return "Menu de etapas - pedidos para decidir";
    case "history":
      return "Menu de etapas - historico";
    case "quotes":
    default:
      return "Menu de etapas";
  }
}

function filterOrdersByView(orders: Order[], view: OrdersView) {
  switch (view) {
    case "history":
      return orders.filter(
        (order) => order.status === "completed" || order.status === "canceled",
      );
    case "open":
      return orders.filter((order) =>
        ["pending", "confirmed", "preparing", "ready"].includes(order.status),
      );
    case "pending":
      return orders.filter((order) => order.status === "pending");
    case "quotes":
      return [];
  }
}

function filterOrdersByStage(orders: Order[], stage: OrdersStage) {
  if (stage === "all") {
    return orders;
  }

  return orders.filter((order) => order.status === stage);
}

function sortOrdersForDisplay(
  orders: Order[],
  view: OrdersView,
  stage: OrdersStage,
) {
  if (stage !== "all") {
    return orders;
  }

  const openOrderRank: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
    canceled: 5,
  };

  const historyOrderRank: Record<OrderStatus, number> = {
    completed: 0,
    canceled: 1,
    pending: 2,
    confirmed: 3,
    preparing: 4,
    ready: 5,
  };

  const rankMap = view === "history" ? historyOrderRank : openOrderRank;

  return [...orders].sort((left, right) => {
    const rankDifference = rankMap[left.status] - rankMap[right.status];

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}

function filterOrdersByRange(orders: Order[], range: OrdersRange, now: Date) {
  if (range === "all") {
    return orders;
  }

  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  if (range === "7d") {
    startDate.setDate(startDate.getDate() - 6);
  } else if (range === "30d") {
    startDate.setDate(startDate.getDate() - 29);
  }

  return orders.filter((order) => order.createdAt >= startDate);
}

function filterOrdersBySearch(orders: Order[], query: string) {
  if (query.length === 0) {
    return orders;
  }

  const normalizedQuery = query.toLocaleLowerCase("pt-BR");
  return orders.filter((order) => {
    const haystack = [
      order.orderNumber,
      order.customerName,
      order.customerNotes ?? "",
      ...order.items.map((item) => item.name),
    ]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    return haystack.includes(normalizedQuery);
  });
}

function getOrderItemsSummary(items: OrderItem[]) {
  if (items.length === 0) {
    return "Sem itens";
  }

  const [firstItem, ...others] = items;
  if (others.length === 0) {
    return `${firstItem.quantity}x ${firstItem.name}`;
  }

  return `${firstItem.quantity}x ${firstItem.name} + ${others.length} item(ns)`;
}

function formatOrderDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatOrderTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function buildOrdersHref(params: {
  view?: OrdersView;
  stage?: OrdersStage;
  range?: OrdersRange;
  totals?: "hidden";
  q?: string;
}) {
  const query = new URLSearchParams();

  if (params.view) {
    query.set("view", params.view);
  }
  if (params.stage) {
    query.set("stage", params.stage);
  }
  if (params.range) {
    query.set("range", params.range);
  }
  if (params.totals) {
    query.set("totals", params.totals);
  }
  if (params.q && params.q.trim().length > 0) {
    query.set("q", params.q.trim());
  }

  const queryString = query.toString();
  return queryString.length > 0 ? `/admin/orders?${queryString}` : "/admin/orders";
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
