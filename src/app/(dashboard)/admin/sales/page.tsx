import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  CircleDollarSign,
  Coins,
  Sprout,
} from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { getAdminRestaurantId, requireAdminSession } from "@/src/lib/admin-auth";
import { formatBRL } from "@/src/lib/format";
import { getRestaurantForAdmin } from "@/src/lib/menu-data";
import { getAdminOrders } from "@/src/lib/orders";
import { Order } from "@/src/types/order";

type SalesRange = "today" | "7d" | "30d" | "all";
type SalesGranularity = "day" | "week" | "month";

type SummaryRow = {
  key: string;
  label: string;
  ordersCount: number;
  itemsCount: number;
  total: number;
  avgTicket: number;
};

type PageProps = {
  searchParams: Promise<{
    range?: string;
    granularity?: string;
  }>;
};

const RANGE_OPTIONS: Array<{ value: SalesRange; label: string }> = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "Ultimos 7 dias" },
  { value: "30d", label: "Ultimos 30 dias" },
  { value: "all", label: "Todo periodo" },
];

const GRANULARITY_OPTIONS: Array<{ value: SalesGranularity; label: string }> = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export default async function AdminSalesPage({ searchParams }: PageProps) {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [{ range, granularity }, restaurant, orders] = await Promise.all([
    searchParams,
    getRestaurantForAdmin(restaurantId),
    getAdminOrders(restaurantId, { includeCanceled: true }),
  ]);

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  const selectedRange = parseSalesRange(range);
  const selectedGranularity = parseSalesGranularity(granularity);
  const completedOrders = orders.filter((order) => order.status === "completed");
  const ordersInRange = filterOrdersByRange(completedOrders, selectedRange, new Date());
  const groupedRows = groupOrdersByGranularity(ordersInRange, selectedGranularity);

  const totalRevenue = ordersInRange.reduce((sum, order) => sum + order.total, 0);
  const totalItems = ordersInRange.reduce(
    (sum, order) => sum + order.items.reduce((qty, item) => qty + item.quantity, 0),
    0,
  );
  const avgTicket =
    ordersInRange.length > 0 ? totalRevenue / ordersInRange.length : 0;

  return (
    <AdminShell
      title="Relatorios"
      description="Visao consolidada das vendas por periodo."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="sales"
    >
      <section className="overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
        <div className="grid min-h-[760px] xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="relative border-b border-zinc-200 bg-zinc-50/50 xl:border-b-0 xl:border-r">
            <button
              type="button"
              className="absolute -right-5 top-6 hidden h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.12)] xl:inline-flex"
              aria-label="Recolher painel lateral"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="px-6 py-6">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                Relatorios
              </h2>

              <div className="mt-9 space-y-8">
                <ReportMenuGroup
                  title="Visao geral"
                  items={[{ label: "Resumo", active: true }]}
                />
                <ReportMenuGroup
                  title="Lucratividade"
                  items={[
                    { label: "Receitas / despesas" },
                    { label: "Por produto vendido" },
                  ]}
                />
                <ReportMenuGroup
                  title="Vendas"
                  items={[
                    { label: "Meios de pagamentos" },
                    { label: "Comissao por vendedor" },
                    { label: "Por produto" },
                    { label: "Horario de pico" },
                  ]}
                />
                <ReportMenuGroup
                  title="Clientes"
                  items={[{ label: "Ranking de vendas" }]}
                />
                <ReportMenuGroup
                  title="Contas a pagar"
                  items={[{ label: "A vencer" }, { label: "Pagas" }]}
                />
              </div>
            </div>
          </aside>

          <section className="px-5 py-6 md:px-8">
            <h3 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Resumo
            </h3>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ReportPillDropdown
                icon={<CalendarDays className="h-5 w-5" />}
                label={`Periodo: ${getRangeLabel(selectedRange)}`}
                options={RANGE_OPTIONS.map((option) => ({
                  label: option.label,
                  href: buildSalesHref({
                    range: option.value,
                    granularity: selectedGranularity,
                  }),
                  active: selectedRange === option.value,
                }))}
              />

              <ReportPillDropdown
                icon={<CircleDollarSign className="h-5 w-5" />}
                label={getGranularityLabel(selectedGranularity)}
                options={GRANULARITY_OPTIONS.map((option) => ({
                  label: option.label,
                  href: buildSalesHref({
                    range: selectedRange,
                    granularity: option.value,
                  }),
                  active: selectedGranularity === option.value,
                }))}
              />
            </div>

            {ordersInRange.length === 0 ? (
              <div className="flex min-h-[560px] items-center justify-center px-4 py-10">
                <div className="text-center">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-zinc-300 bg-zinc-50 text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Sprout className="h-8 w-8" />
                      <Coins className="h-8 w-8" />
                    </div>
                  </div>
                  <h4 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">
                    Sem relatorios
                  </h4>
                  <p className="mt-3 text-base text-zinc-600">
                    Nenhuma transacao registrada nesse periodo.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryCard
                    label="Transacoes"
                    value={`${ordersInRange.length}`}
                    detail="Pedidos concluidos no periodo"
                  />
                  <SummaryCard
                    label="Receita total"
                    value={formatBRL(totalRevenue)}
                    detail={`${totalItems} item(ns) vendidos`}
                  />
                  <SummaryCard
                    label="Ticket medio"
                    value={formatBRL(avgTicket)}
                    detail="Media por pedido concluido"
                  />
                </div>

                <div className="overflow-hidden rounded-[14px] border border-zinc-200">
                  <table className="min-w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                      <tr>
                        <th className="px-4 py-2 text-left">Periodo</th>
                        <th className="px-4 py-2 text-right">Pedidos</th>
                        <th className="px-4 py-2 text-right">Itens</th>
                        <th className="px-4 py-2 text-right">Ticket medio</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {groupedRows.map((row) => (
                        <tr key={row.key}>
                          <td className="px-4 py-3 font-medium text-zinc-900">{row.label}</td>
                          <td className="px-4 py-3 text-right text-zinc-700">{row.ordersCount}</td>
                          <td className="px-4 py-3 text-right text-zinc-700">{row.itemsCount}</td>
                          <td className="px-4 py-3 text-right text-zinc-700">
                            {formatBRL(row.avgTicket)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-zinc-900">
                            {formatBRL(row.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </AdminShell>
  );
}

function ReportMenuGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; active?: boolean }>;
}) {
  return (
    <div>
      <h4 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h4>
      <div className="mt-2 space-y-0.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={`text-sm leading-[1.35] ${
              item.active ? "font-semibold text-sky-600" : "text-zinc-700"
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportPillDropdown({
  icon,
  label,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  options: Array<{ label: string; href: string; active?: boolean }>;
}) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-800">
        <span className="text-zinc-600">{icon}</span>
        <span>{label}</span>
        <ChevronDown className="h-5 w-5 text-zinc-500 transition group-open:rotate-180" />
      </summary>

      <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[220px] overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-[0_18px_34px_rgba(15,23,42,0.16)]">
        {options.map((option) => (
          <Link
            key={option.label}
            href={option.href}
            className={`block px-4 py-2.5 text-sm transition ${
              option.active
                ? "bg-sky-50 font-semibold text-sky-700"
                : "text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[14px] border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-sm text-zinc-600">{detail}</p>
    </div>
  );
}

function parseSalesRange(value: string | undefined): SalesRange {
  if (value === "today" || value === "7d" || value === "30d" || value === "all") {
    return value;
  }
  return "7d";
}

function parseSalesGranularity(value: string | undefined): SalesGranularity {
  if (value === "day" || value === "week" || value === "month") {
    return value;
  }
  return "day";
}

function getRangeLabel(value: SalesRange) {
  return RANGE_OPTIONS.find((option) => option.value === value)?.label ?? "Ultimos 7 dias";
}

function getGranularityLabel(value: SalesGranularity) {
  return GRANULARITY_OPTIONS.find((option) => option.value === value)?.label ?? "Dia";
}

function buildSalesHref(params: {
  range?: SalesRange;
  granularity?: SalesGranularity;
}) {
  const query = new URLSearchParams();

  if (params.range) {
    query.set("range", params.range);
  }
  if (params.granularity) {
    query.set("granularity", params.granularity);
  }

  const queryString = query.toString();
  return queryString.length > 0 ? `/admin/sales?${queryString}` : "/admin/sales";
}

function filterOrdersByRange(orders: Order[], range: SalesRange, now: Date) {
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

function groupOrdersByGranularity(
  orders: Order[],
  granularity: SalesGranularity,
): SummaryRow[] {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      ordersCount: number;
      itemsCount: number;
      total: number;
    }
  >();

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const groupInfo = getGroupInfo(date, granularity);
    const current = groups.get(groupInfo.key) ?? {
      key: groupInfo.key,
      label: groupInfo.label,
      ordersCount: 0,
      itemsCount: 0,
      total: 0,
    };

    current.ordersCount += 1;
    current.itemsCount += order.items.reduce((sum, item) => sum + item.quantity, 0);
    current.total += order.total;
    groups.set(groupInfo.key, current);
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      avgTicket: group.ordersCount > 0 ? group.total / group.ordersCount : 0,
    }))
    .sort((a, b) => (a.key < b.key ? 1 : -1));
}

function getGroupInfo(date: Date, granularity: SalesGranularity) {
  if (granularity === "day") {
    const dayKey = toDateKey(date);
    return {
      key: dayKey,
      label: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date),
    };
  }

  if (granularity === "month") {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const key = `${date.getFullYear()}-${month}`;
    return {
      key,
      label: new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(date),
    };
  }

  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    key: toDateKey(weekStart),
    label: `${new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(weekStart)} - ${new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(weekEnd)}`,
  };
}

function getWeekStart(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const day = value.getDay();
  const mondayDistance = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + mondayDistance);
  return value;
}

function toDateKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
