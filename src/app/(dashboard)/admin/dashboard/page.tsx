import Link from "next/link";
import { ArrowUpRight, BarChart3, ClipboardList, Package } from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { RestaurantWhatsappForm } from "@/src/components/admin/restaurant-whatsapp-form";
import { getAdminRestaurantId, requireAdminSession } from "@/src/lib/admin-auth";
import { getRestaurantForAdmin, getAdminProducts, getAdminCategories } from "@/src/lib/menu-data";
import { getAdminOrderMetrics } from "@/src/lib/orders";
import { formatWhatsappDisplayNumber } from "@/src/lib/order-presentation";
import { updateRestaurantWhatsappAction } from "./actions";

export default async function DashboardPage() {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [restaurant, products, categories, orderMetrics] = await Promise.all([
    getRestaurantForAdmin(restaurantId),
    getAdminProducts(restaurantId),
    getAdminCategories(restaurantId),
    getAdminOrderMetrics(restaurantId),
  ]);

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  const availableProducts = products.filter((product) => Boolean(product.isAvailable)).length;
  const hiddenProducts = products.length - availableProducts;

  return (
    <AdminShell
      title="Dashboard"
      description="Visao geral da operacao."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="dashboard"
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-full border border-sky-700 bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <ClipboardList className="h-4 w-4" />
            Pedidos
          </Link>
          <Link
            href="/admin/sales"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <BarChart3 className="h-4 w-4" />
            Vendas
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            <Package className="h-4 w-4" />
            Produtos
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        <section className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Resumo rapido
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Indicadores principais do dia para acompanhar pedidos, vendas e catalogo.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Pedidos abertos"
              value={`${orderMetrics.open}`}
              detail={`${orderMetrics.pending} aguardando confirmacao`}
            />
            <MetricCard
              label="Concluidos"
              value={`${orderMetrics.completed}`}
              detail={`${orderMetrics.canceled} cancelado(s)`}
            />
            <MetricCard
              label="Produtos"
              value={`${products.length}`}
              detail={`${availableProducts} ativos, ${hiddenProducts} ocultos`}
            />
            <MetricCard
              label="Categorias"
              value={`${categories.length}`}
              detail="categorias cadastradas"
            />
          </div>
        </section>

        <section className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            Atalhos de operacao
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <ShortcutCard
              href="/admin/orders"
              title="Painel de pedidos"
              detail="Acompanhar fluxo e atualizar status."
            />
            <ShortcutCard
              href="/admin/sales"
              title="Relatorio de vendas"
              detail="Consolidado por periodo e desempenho."
            />
            <ShortcutCard
              href="/admin/products/new"
              title="Novo produto"
              detail="Cadastrar item no catalogo."
            />
          </div>
        </section>

        <section className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            Numero da loja no WhatsApp
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Esse numero e usado para iniciar as conversas de pedidos no checkout
            e nos avisos do painel.
          </p>

          <div className="mt-3 rounded-[14px] border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Numero atual
            </p>
            <p className="mt-1 text-base font-semibold text-zinc-900">
              {restaurant.whatsappNumber
                ? formatWhatsappDisplayNumber(restaurant.whatsappNumber)
                : "Nao configurado"}
            </p>
          </div>

          <RestaurantWhatsappForm
            action={updateRestaurantWhatsappAction}
            defaultValue={
              restaurant.whatsappNumber
                ? formatWhatsappDisplayNumber(restaurant.whatsappNumber)
                : ""
            }
          />
        </section>
      </div>
    </AdminShell>
  );
}

function MetricCard({
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

function ShortcutCard({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[14px] border border-zinc-200 bg-white px-4 py-3 transition hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        <ArrowUpRight className="h-4 w-4 text-zinc-400 transition group-hover:text-zinc-700" />
      </div>
      <p className="mt-1 text-sm text-zinc-600">{detail}</p>
    </Link>
  );
}
