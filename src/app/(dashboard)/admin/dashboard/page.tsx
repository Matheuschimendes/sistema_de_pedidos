import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  SquarePen,
  TimerReset,
} from "lucide-react";
import { updateRestaurantWhatsappAction } from "@/src/app/(dashboard)/admin/dashboard/actions";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { RestaurantWhatsappForm } from "@/src/components/admin/restaurant-whatsapp-form";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { formatBRL } from "@/src/lib/format";
import { getRestaurantBusinessStatus } from "@/src/lib/get-restaurant-business-status";
import {
  buildAdminCategorySummaries,
  getAdminCategories,
  getAdminProducts,
  getRestaurantForAdmin,
} from "@/src/lib/menu-data";
import { formatWhatsappDisplayNumber } from "@/src/lib/order-presentation";
import { getAdminOrderMetrics } from "@/src/lib/orders";
import { AdminCategorySummary, Product } from "@/src/types/menu";

type DashboardActionTone =
  | "categories"
  | "create"
  | "edit"
  | "manage"
  | "orders"
  | "storefront";

type DashboardTone = "amber" | "emerald" | "rose" | "sky" | "slate" | "zinc";

type AttentionItem = {
  action: string;
  detail: string;
  href: string;
  icon: LucideIcon;
  tone: DashboardTone;
  title: string;
};

type DashboardSignalItem = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: DashboardTone;
  value: string;
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [{ q }, restaurant, products, registeredCategories, orderMetrics] =
    await Promise.all([
      searchParams,
      getRestaurantForAdmin(restaurantId),
      getAdminProducts(restaurantId),
      getAdminCategories(restaurantId),
      getAdminOrderMetrics(restaurantId),
    ]);

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  const searchQuery = q?.trim() ?? "";
  const filteredProducts = filterProducts(products, searchQuery);

  const availableProducts = products.filter((product) =>
    Boolean(product.isAvailable),
  );
  const unavailableProducts = products.filter((product) => !product.isAvailable);
  const featuredProducts = products.filter((product) => Boolean(product.featured));

  const categorySummaries = buildAdminCategorySummaries(
    products,
    registeredCategories.map((category) => category.name),
  );
  const categoriesWithProducts = categorySummaries.filter(
    (category) => category.count > 0,
  );
  const emptyCategories = categorySummaries.filter((category) => category.count === 0);
  const formattedRestaurantWhatsappNumber = restaurant.whatsappNumber
    ? formatWhatsappDisplayNumber(restaurant.whatsappNumber)
    : null;
  const businessStatus = getRestaurantBusinessStatus(restaurant);

  const averagePrice =
    products.length > 0
      ? products.reduce((sum, product) => sum + product.price, 0) /
        products.length
      : 0;

  const menuCoverage =
    products.length > 0
      ? Math.round((availableProducts.length / products.length) * 100)
      : 0;
  const categoryCoverage =
    categorySummaries.length > 0
      ? Math.round((categoriesWithProducts.length / categorySummaries.length) * 100)
      : 0;
  const featuredCoverage =
    availableProducts.length > 0
      ? Math.round((featuredProducts.length / availableProducts.length) * 100)
      : 0;
  const attentionItems = buildAttentionItems({
    emptyCategoriesCount: emptyCategories.length,
    hasWhatsapp: Boolean(restaurant.whatsappNumber),
    hiddenProductsCount: unavailableProducts.length,
    pendingOrdersCount: orderMetrics.pending,
    totalFeaturedProducts: featuredProducts.length,
    totalProducts: products.length,
  });

  const sortedProducts = [...filteredProducts].sort(
    (left, right) =>
      Number(Boolean(right.isAvailable)) - Number(Boolean(left.isAvailable)) ||
      Number(Boolean(right.featured)) - Number(Boolean(left.featured)) ||
      right.price - left.price ||
      left.name.localeCompare(right.name, "pt-BR"),
  );

  const radarProducts = sortedProducts.slice(0, 8);
  const topCategoryCount = categoriesWithProducts[0]?.count ?? 0;
  const heroSignals: DashboardSignalItem[] = [
    {
      detail:
        orderMetrics.pending > 0
          ? "pedidos aguardando resposta da equipe"
          : "sem fila imediata de confirmacao",
      icon: ClipboardList,
      label: "Pendentes",
      tone: "amber",
      value: `${orderMetrics.pending}`,
    },
    {
      detail: `${categorySummaries.length} categoria(s) registradas no sistema`,
      icon: BarChart3,
      label: "Categorias",
      tone: "sky",
      value: `${categoriesWithProducts.length}`,
    },
    {
      detail: formattedRestaurantWhatsappNumber
        ? "checkout pronto para abrir a conversa"
        : "configure o numero principal da empresa",
      icon: MessageCircle,
      label: "Contato",
      tone: formattedRestaurantWhatsappNumber ? "emerald" : "rose",
      value: formattedRestaurantWhatsappNumber ? "OK" : "Pendente",
    },
  ];
  const menuHighlights: DashboardSignalItem[] = [
    {
      detail: `${menuCoverage}% do cardapio esta publicado agora`,
      icon: Package,
      label: "Ativos",
      tone: "emerald",
      value: `${availableProducts.length}`,
    },
    {
      detail:
        unavailableProducts.length > 0
          ? "vale revisar a disponibilidade da vitrine"
          : "nenhum item fora do ar neste momento",
      icon: Package,
      label: "Ocultos",
      tone: "rose",
      value: `${unavailableProducts.length}`,
    },
    {
      detail:
        emptyCategories.length > 0
          ? `${emptyCategories.length} categoria(s) ainda vazias`
          : "todas as categorias ja possuem itens",
      icon: BarChart3,
      label: "Categorias ocupadas",
      tone: "sky",
      value: `${categoriesWithProducts.length}`,
    },
  ];
  const menuReadinessLabel =
    menuCoverage >= 80
      ? "Menu forte"
      : menuCoverage >= 50
        ? "Menu em evolucao"
        : "Menu pedindo reforco";
  const radarSummaryLabel = searchQuery
    ? `${filteredProducts.length} resultado(s)`
    : `${radarProducts.length} item(ns) no radar`;

  return (
    <AdminShell
      title="Cockpit da operacao"
      description="Resumo rapido do menu e dos pedidos."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="dashboard"
      actions={
        <div className="flex flex-wrap gap-2 xl:flex-nowrap">
          <Link
            href="/admin/orders"
            className={getDashboardToolbarButtonClass("orders")}
          >
            <span className={getDashboardToolbarIconClass("orders")}>
              <ClipboardList className="h-4 w-4" />
            </span>
            Pedidos
          </Link>
          <Link
            href="/admin/products/new"
            className={getDashboardToolbarButtonClass("create")}
          >
            <span className={getDashboardToolbarIconClass("create")}>
              <Plus className="h-4 w-4" />
            </span>
            Novo produto
          </Link>
          <Link
            href="/admin/categories"
            className={getDashboardToolbarButtonClass("categories")}
          >
            <span className={getDashboardToolbarIconClass("categories")}>
              <ArrowUpRight className="h-4 w-4" />
            </span>
            Categorias
          </Link>
          <Link
            href="/admin/products"
            className={getDashboardToolbarButtonClass("manage")}
          >
            <span className={getDashboardToolbarIconClass("manage")}>
              <ArrowUpRight className="h-4 w-4" />
            </span>
            Catalogo
          </Link>
          <Link
            href={`/${restaurant.slug}`}
            className={getDashboardToolbarButtonClass("storefront")}
          >
            <span className={getDashboardToolbarIconClass("storefront")}>
              <ArrowUpRight className="h-4 w-4" />
            </span>
            Ver vitrine
          </Link>
        </div>
      }
    >
      <div className="space-y-3.5">
        <section className="relative overflow-hidden rounded-[26px] border border-slate-900/10 bg-[linear-gradient(145deg,#081226_0%,#19263d_45%,#9a3412_100%)] text-white shadow-[0_24px_56px_rgba(15,23,42,0.16)]">
          <div className="pointer-events-none absolute -left-16 -top-20 h-40 w-40 rounded-full bg-white/12 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />

          <div className="relative z-10 grid gap-3.5 p-4 md:p-5 xl:grid-cols-[minmax(0,1.05fr)_312px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
                  Cockpit ativo
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                  {businessStatus.label}
                </span>
              </div>

              <h2 className="mt-4 text-[1.35rem] font-semibold leading-tight tracking-tight sm:text-[1.55rem] 2xl:text-[1.75rem]">
                {restaurant.name}
              </h2>
              <p className="mt-2 max-w-3xl text-[13px] leading-6 text-slate-200">
                {businessStatus.detail}
              </p>

              <div className="mt-4 grid gap-2.5 md:grid-cols-3">
                <HeroMetricCard
                  detail={`${orderMetrics.pending} pedido(s) aguardando confirmacao`}
                  icon={ClipboardList}
                  label="Pedidos abertos"
                  tone="sky"
                  value={`${orderMetrics.open}`}
                />
                <HeroMetricCard
                  detail={`${availableProducts.length} item(ns) ja publicados`}
                  icon={Package}
                  label="Menu online"
                  tone="emerald"
                  value={`${menuCoverage}%`}
                />
                <HeroMetricCard
                  detail={`${products.length} item(ns) compoem o catalogo`}
                  icon={TimerReset}
                  label="Ticket medio"
                  tone="zinc"
                  value={formatBRL(averagePrice)}
                />
              </div>
            </div>

            <section className="rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.16)_0%,rgba(15,23,42,0.38)_100%)] p-3.5 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                    Pulse da operacao
                  </p>
                  <h3 className="mt-2 text-[0.98rem] font-semibold tracking-tight text-white">
                    Sinais do turno
                  </h3>
                </div>

                <div className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {attentionItems.length} foco(s)
                </div>
              </div>

              <div className="mt-3.5 grid gap-2.5">
                {heroSignals.map((item) => (
                  <DashboardSignalCard
                    key={item.label}
                    item={item}
                    surface="dark"
                  />
                ))}
              </div>

              <div className="mt-3.5 space-y-2">
                <MiniSummaryRow
                  label="WhatsApp"
                  value={formattedRestaurantWhatsappNumber ?? "Pendente"}
                />
                <MiniSummaryRow
                  label="Categorias"
                  value={`${categoriesWithProducts.length}/${categorySummaries.length}`}
                />
                <MiniSummaryRow
                  label="Pendentes"
                  value={`${orderMetrics.pending}`}
                />
                <MiniSummaryRow
                  label="Destaques"
                  value={`${featuredProducts.length}`}
                />
              </div>
            </section>
          </div>
        </section>

        <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_296px] 2xl:grid-cols-[minmax(0,1fr)_312px]">
          <div className="space-y-3.5">
            <section className="rounded-[24px] border border-amber-200/70 bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_100%)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Mapa do menu
                  </p>
                  <h3 className="mt-2 text-[1.08rem] font-semibold tracking-tight text-zinc-950">
                    Blocos de oferta
                  </h3>
                  <p className="mt-2 max-w-3xl text-[13px] leading-6 text-zinc-600">
                    Leia cobertura, ocupacao de categorias e forca comercial do
                    cardapio em poucos segundos.
                  </p>
                </div>

                <div className="inline-flex items-center rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-[0_10px_22px_rgba(245,158,11,0.12)]">
                  {menuReadinessLabel}
                </div>
              </div>

              <div className="mt-3.5 grid gap-2.5 md:grid-cols-3">
                {menuHighlights.map((item) => (
                  <DashboardSignalCard
                    key={item.label}
                    item={item}
                    surface="light"
                  />
                ))}
              </div>

              <div className="mt-3.5 grid gap-3.5 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="space-y-2.5">
                  <PerformanceStrip
                    icon={Package}
                    label="Menu online"
                    progress={menuCoverage}
                    tone="emerald"
                    value={`${menuCoverage}%`}
                  />
                  <PerformanceStrip
                    icon={BarChart3}
                    label="Categorias usadas"
                    progress={categoryCoverage}
                    tone="amber"
                    value={`${categoryCoverage}%`}
                  />
                  <PerformanceStrip
                    icon={Sparkles}
                    label="Em destaque"
                    progress={featuredCoverage}
                    tone="sky"
                    value={`${featuredCoverage}%`}
                  />
                </div>

                <div className="rounded-[20px] border border-amber-200/70 bg-white/75 p-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                        Categorias
                      </p>
                      <h4 className="mt-1.5 text-[0.94rem] font-semibold tracking-tight text-zinc-950">
                        Categorias fortes
                      </h4>
                    </div>

                    <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      {categoriesWithProducts.length > 0
                        ? `Top ${Math.min(categoriesWithProducts.length, 4)}`
                        : "Sem categorias"}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
                    {categoriesWithProducts.length === 0 ? (
                      <div className="rounded-[18px] border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500 lg:col-span-2">
                        Cadastre produtos para exibir a leitura de categorias
                        aqui.
                      </div>
                    ) : (
                      categoriesWithProducts
                        .slice(0, 4)
                        .map((category) => (
                          <CategoryMomentumRow
                            key={category.name}
                            category={category}
                            topCategoryCount={topCategoryCount}
                          />
                        ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-slate-900/12 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
              <div className="border-b border-white/10 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200/80">
                      Radar do catalogo
                    </p>
                    <h3 className="mt-2 text-[1.08rem] font-semibold tracking-tight text-white">
                      Produtos no foco
                    </h3>
                    <p className="mt-2 max-w-3xl text-[13px] leading-6 text-slate-300">
                      Busque por nome, categoria ou badge para revisar a
                      vitrine sem sair do cockpit.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
                    <div className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white">
                      {radarSummaryLabel}
                    </div>

                    <Link
                      href="/admin/products"
                      className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-teal-400/30 bg-teal-400/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-400/25"
                    >
                      Catalogo completo
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>

                    <form
                      action="/admin/dashboard"
                      className="flex w-full items-center gap-2 rounded-[18px] border border-white/12 bg-white/8 px-4 py-2.5 lg:w-[280px]"
                    >
                      <Search className="h-4 w-4 text-slate-300" />
                      <input
                        type="search"
                        name="q"
                        defaultValue={searchQuery}
                        placeholder="Buscar produto, categoria ou badge"
                        className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                      />
                    </form>
                  </div>
                </div>
              </div>

              {radarProducts.length === 0 ? (
                <div className="px-4 py-4 sm:px-5 sm:py-5">
                  <div className="rounded-[20px] border border-white/12 bg-white/6 p-[18px]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                      Sem resultado
                    </p>
                    <h4 className="mt-3 text-[1.15rem] font-semibold tracking-tight text-white">
                      {products.length === 0
                        ? "Seu cardapio ainda nao tem itens"
                        : "Nenhum produto encontrado nesta busca"}
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {products.length === 0
                        ? "Crie os primeiros produtos para comecar a montar a operacao pelo dashboard."
                        : "Troque os termos da busca para ampliar o radar do catalogo."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16)_0%,rgba(15,23,42,0)_30%)] px-4 py-4 sm:px-5 sm:py-5">
                  <div className="grid gap-2.5 xl:grid-cols-2 2xl:grid-cols-2">
                    {radarProducts.map((product) => (
                      <DashboardProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-3.5">
            <section className="rounded-[24px] border border-amber-200/70 bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_100%)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Prioridades
                  </p>
                  <h3 className="mt-2 text-[0.98rem] font-semibold tracking-tight text-zinc-950">
                    Acoes do momento
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-zinc-600">
                    Ajustes que destravam operacao, leitura do menu e conversao.
                  </p>
                </div>

                <div className="rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold text-amber-900">
                  {attentionItems.length}
                </div>
              </div>

              {attentionItems.length === 0 ? (
                <div className="mt-3.5 rounded-[20px] border border-emerald-200 bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_100%)] p-4 shadow-[0_12px_24px_rgba(16,185,129,0.08)]">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-900">
                        Painel sem alertas criticos
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-emerald-800/90">
                        Tudo certo por enquanto.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 space-y-2.5">
                  {attentionItems.map((item) => (
                    <AttentionCard key={item.title} item={item} />
                  ))}
                </div>
              )}
            </section>

            <section
              id="restaurant-whatsapp-section"
              className="relative overflow-hidden rounded-[24px] border border-teal-200 bg-[linear-gradient(180deg,#ecfeff_0%,#ffffff_100%)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.07)]"
            >
              <div className="pointer-events-none absolute -right-8 top-0 h-28 w-28 rounded-full bg-teal-200/40 blur-3xl" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-700">
                    Canal de pedidos
                  </p>
                  <h3 className="mt-2 text-[0.98rem] font-semibold tracking-tight text-zinc-950">
                    WhatsApp da empresa
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-zinc-600">
                    Atualize aqui o numero usado pelo checkout para abrir a
                    conversa com a loja sem atrito.
                  </p>
                </div>

                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-white text-teal-700 shadow-[0_12px_24px_rgba(20,184,166,0.12)]">
                  <MessageCircle className="h-5 w-5" />
                </div>
              </div>

              <div className="relative z-10 mt-3.5 rounded-[20px] border border-teal-300/30 bg-[linear-gradient(135deg,#0f766e_0%,#0f172a_100%)] px-4 py-3.5 shadow-[0_16px_32px_rgba(15,23,42,0.12)]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-100/70">
                  Numero atual
                </div>
                <div className="mt-2 break-words text-[1.02rem] font-semibold text-white">
                  {formattedRestaurantWhatsappNumber ?? "Nao configurado"}
                </div>
              </div>

              <div className="relative z-10">
                <RestaurantWhatsappForm
                  action={updateRestaurantWhatsappAction}
                  defaultValue={formattedRestaurantWhatsappNumber ?? ""}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}

function filterProducts(products: Product[], searchQuery: string) {
  if (searchQuery.length === 0) {
    return products;
  }

  const normalizedQuery = searchQuery.toLocaleLowerCase("pt-BR");

  return products.filter((product) =>
    [
      product.name,
      product.description,
      product.category,
      product.additionalInfo,
      product.badge,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("pt-BR")
      .includes(normalizedQuery),
  );
}

function buildAttentionItems(params: {
  emptyCategoriesCount: number;
  hasWhatsapp: boolean;
  hiddenProductsCount: number;
  pendingOrdersCount: number;
  totalFeaturedProducts: number;
  totalProducts: number;
}): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (params.pendingOrdersCount > 0) {
    items.push({
      action: "Abrir pedidos",
      detail: `${params.pendingOrdersCount} pedido(s) estao aguardando confirmacao da equipe neste momento.`,
      href: "/admin/orders",
      icon: ClipboardList,
      tone: "amber",
      title: "Pedidos esperando resposta",
    });
  }

  if (params.hiddenProductsCount > 0) {
    items.push({
      action: "Revisar produtos",
      detail: `${params.hiddenProductsCount} item(ns) continuam fora da vitrine e podem estar travando venda.`,
      href: "/admin/products",
      icon: Package,
      tone: "rose",
      title: "Itens ocultos no catalogo",
    });
  }

  if (params.emptyCategoriesCount > 0) {
    items.push({
      action: "Organizar categorias",
      detail: `${params.emptyCategoriesCount} categoria(s) estao vazias e enfraquecem a leitura do menu.`,
      href: "/admin/categories",
      icon: BarChart3,
      tone: "sky",
      title: "Categorias sem produto",
    });
  }

  if (!params.hasWhatsapp) {
    items.push({
      action: "Configurar contato",
      detail:
        "O checkout precisa de um WhatsApp valido para abrir a conversa com a loja sem atrito.",
      href: "/admin/dashboard#restaurant-whatsapp-section",
      icon: MessageCircle,
      tone: "amber",
      title: "WhatsApp ainda nao configurado",
    });
  }

  if (params.totalProducts > 0 && params.totalFeaturedProducts === 0) {
    items.push({
      action: "Escolher destaques",
      detail:
        "Nenhum produto esta marcado como destaque, e isso reduz a forca comercial do painel publico.",
      href: "/admin/products",
      icon: Sparkles,
      tone: "emerald",
      title: "Sem produtos em destaque",
    });
  }

  return items.slice(0, 4);
}

function HeroMetricCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: DashboardTone;
  value: string;
}) {
  return (
    <div
      className={`${getHeroMetricCardClass(
        tone,
      )} rounded-[20px] border p-3 shadow-[0_12px_24px_rgba(15,23,42,0.14)] backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
            {label}
          </div>
          <div className="mt-1 text-[1.02rem] font-semibold tracking-tight text-white">
            {value}
          </div>
          <div className="mt-1.5 text-[11px] leading-5 text-slate-200/90">
            {detail}
          </div>
        </div>

        <div className={getHeroIconClass(tone)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function DashboardSignalCard({
  item,
  surface,
}: {
  item: DashboardSignalItem;
  surface: "dark" | "light";
}) {
  const onDarkSurface = surface === "dark";
  const Icon = item.icon;

  return (
    <div className={getDashboardSignalCardClass(item.tone, onDarkSurface)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
              onDarkSurface ? "text-white/55" : "text-zinc-400"
            }`}
          >
            {item.label}
          </div>
          <div
            className={`mt-1 text-[1.02rem] font-semibold tracking-tight ${
              onDarkSurface ? "text-white" : "text-zinc-950"
            }`}
          >
            {item.value}
          </div>
          <div
            className={`mt-1 text-[11px] leading-5 ${
              onDarkSurface ? "text-slate-300" : "text-zinc-500"
            }`}
          >
            {item.detail}
          </div>
        </div>

        <div className={getDashboardSignalIconClass(item.tone, onDarkSurface)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function MiniSummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[13px] text-slate-300">{label}</div>
      <div className="text-[13px] font-semibold text-white">{value}</div>
    </div>
  );
}

function PerformanceStrip({
  icon: Icon,
  label,
  progress,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  progress: number;
  tone: DashboardTone;
  value: string;
}) {
  return (
    <div className={getPerformanceCardClass(tone)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={getPerformanceIconClass(tone)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-zinc-950">{label}</div>
          </div>
        </div>

        <div className="text-[13px] font-semibold text-zinc-950">{value}</div>
      </div>

      <div className={`mt-2.5 h-2.5 rounded-full ${getProgressTrackClass(tone)}`}>
        <div
          className={`h-2.5 rounded-full ${getProgressFillClass(tone, false)}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

function CategoryMomentumRow({
  category,
  topCategoryCount,
}: {
  category: AdminCategorySummary;
  topCategoryCount: number;
}) {
  const publishedRatio =
    category.count > 0
      ? Math.round((category.availableCount / category.count) * 100)
      : 0;
  const loadWidth =
    topCategoryCount > 0 ? Math.round((category.count / topCategoryCount) * 100) : 0;

  return (
    <div className="rounded-[18px] border border-amber-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fff7eb_100%)] p-3.5 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-zinc-950">
            {category.name}
          </div>
          <div className="mt-1 text-[13px] text-zinc-500">{category.count} itens</div>
        </div>

        <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          {publishedRatio}% online
        </div>
      </div>

      <div className="mt-2.5 h-2.5 rounded-full bg-white">
        <div
          className="h-2.5 rounded-full bg-[linear-gradient(90deg,#f59e0b_0%,#f97316_100%)]"
          style={{ width: `${Math.max(loadWidth, category.count > 0 ? 12 : 0)}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-zinc-500">
        <span>{category.availableCount} ativo(s)</span>
        <span>{category.featuredCount} destaque(s)</span>
      </div>
    </div>
  );
}

function AttentionCard({ item }: { item: AttentionItem }) {
  const Icon = item.icon;

  return (
    <article className={getAttentionCardClass(item.tone)}>
      <div className="flex items-start gap-3">
        <div className={getAttentionIconClass(item.tone)}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-[13px] font-semibold text-zinc-950">{item.title}</h4>
          <p className="mt-1 text-[13px] leading-6 text-zinc-700/90">
            {item.detail}
          </p>
        </div>
      </div>

      <Link
        href={item.href}
        className={getAttentionActionClass(item.tone)}
      >
        {item.action}
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function DashboardProductCard({
  product,
}: {
  product: Product;
}) {
  const isAvailable = Boolean(product.isAvailable);
  const isFeatured = Boolean(product.featured);
  const hasLocalImage = Boolean(product.image?.startsWith("/"));

  return (
    <article className={getDashboardProductCardClass(isAvailable, isFeatured)}>
      <div
        className={`mb-2.5 h-1.5 rounded-full ${getDashboardProductAccentClass(
          isAvailable,
          isFeatured,
        )}`}
      />

      <div className="flex items-start gap-3.5">
        <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[15px] bg-zinc-100">
          {hasLocalImage ? (
            <Image
              src={product.image!}
              alt={product.name}
              fill
              sizes="68px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f0ece4_0%,#e0f2fe_100%)] text-sm font-semibold text-zinc-500">
              {getProductFallback(product.name)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  {product.category}
                </span>
                {product.badge ? (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                    {product.badge}
                  </span>
                ) : null}
                {isFeatured ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                    Destaque
                  </span>
                ) : null}
              </div>

              <h4 className="mt-1.5 text-[0.9rem] font-semibold tracking-tight text-zinc-950">
                {product.name}
              </h4>
              <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-zinc-500">
                {product.description}
              </p>
            </div>

            <div
              className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${
                isAvailable
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {isAvailable ? "Ativo" : "Oculto"}
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/80 pt-3">
            <span className="text-[0.92rem] font-semibold text-emerald-700">
              {formatBRL(product.price)}
            </span>

            <Link
              href={`/admin/products/${product.id}/edit`}
              className={getDashboardActionButtonClass("edit")}
            >
              <span className={getDashboardActionIconClass("edit")}>
                <SquarePen className="h-4 w-4" />
              </span>
              Editar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function getDashboardActionButtonClass(tone: DashboardActionTone) {
  const baseClassName =
    "inline-flex w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-[13px] font-semibold shadow-[0_12px_22px_rgba(15,23,42,0.08)] transition sm:w-auto";

  switch (tone) {
    case "create":
      return `${baseClassName} border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700`;
    case "categories":
      return `${baseClassName} border-amber-300 bg-[linear-gradient(180deg,#fef3c7_0%,#fde68a_100%)] text-amber-950 hover:border-amber-400 hover:bg-[linear-gradient(180deg,#fde68a_0%,#fcd34d_100%)]`;
    case "orders":
      return `${baseClassName} border-sky-700 bg-sky-600 text-white hover:bg-sky-700`;
    case "manage":
      return `${baseClassName} border-slate-900 bg-slate-900 text-white hover:bg-slate-950`;
    case "storefront":
      return `${baseClassName} border-teal-700 bg-teal-600 text-white hover:bg-teal-700`;
    case "edit":
      return `${baseClassName} border-orange-700 bg-orange-500 text-white hover:bg-orange-600`;
  }
}

function getDashboardActionIconClass(tone: DashboardActionTone) {
  const baseClassName =
    "inline-flex h-[26px] w-[26px] items-center justify-center rounded-full";

  switch (tone) {
    case "categories":
      return `${baseClassName} bg-white/60 text-amber-900`;
    case "create":
    case "edit":
    case "manage":
    case "orders":
    case "storefront":
      return `${baseClassName} bg-white/20 text-white`;
  }
}

function getDashboardToolbarButtonClass(tone: DashboardActionTone) {
  const baseClassName =
    "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[15px] border px-3 py-2 text-[13px] font-semibold shadow-[0_8px_16px_rgba(15,23,42,0.06)] transition whitespace-nowrap";

  switch (tone) {
    case "create":
      return `${baseClassName} border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700`;
    case "categories":
      return `${baseClassName} border-amber-300 bg-[linear-gradient(180deg,#fef3c7_0%,#fde68a_100%)] text-amber-950 hover:border-amber-400 hover:bg-[linear-gradient(180deg,#fde68a_0%,#fcd34d_100%)]`;
    case "orders":
      return `${baseClassName} border-sky-700 bg-sky-600 text-white hover:bg-sky-700`;
    case "manage":
      return `${baseClassName} border-slate-900 bg-slate-900 text-white hover:bg-slate-950`;
    case "storefront":
      return `${baseClassName} border-teal-700 bg-teal-600 text-white hover:bg-teal-700`;
    case "edit":
      return `${baseClassName} border-orange-700 bg-orange-500 text-white hover:bg-orange-600`;
  }
}

function getDashboardToolbarIconClass(tone: DashboardActionTone) {
  const baseClassName =
    "inline-flex h-[22px] w-[22px] items-center justify-center rounded-full";

  switch (tone) {
    case "categories":
      return `${baseClassName} bg-white/60 text-amber-900`;
    case "create":
    case "edit":
    case "manage":
    case "orders":
    case "storefront":
      return `${baseClassName} bg-white/20 text-white`;
  }
}

function getHeroIconClass(tone: DashboardTone) {
  const baseClassName =
    "inline-flex h-9 w-9 items-center justify-center rounded-full";

  switch (tone) {
    case "emerald":
      return `${baseClassName} bg-emerald-400/15 text-emerald-100`;
    case "amber":
      return `${baseClassName} bg-amber-300/15 text-amber-50`;
    case "sky":
      return `${baseClassName} bg-sky-300/15 text-sky-50`;
    case "rose":
      return `${baseClassName} bg-rose-300/15 text-rose-50`;
    case "slate":
    case "zinc":
      return `${baseClassName} bg-white/10 text-white`;
  }
}

function getHeroMetricCardClass(tone: DashboardTone) {
  switch (tone) {
    case "emerald":
      return "border-emerald-300/18 bg-emerald-400/10";
    case "amber":
      return "border-amber-300/18 bg-amber-400/10";
    case "sky":
      return "border-sky-300/18 bg-sky-400/10";
    case "rose":
      return "border-rose-300/18 bg-rose-400/10";
    case "slate":
    case "zinc":
      return "border-white/12 bg-white/10";
  }
}

function getDashboardSignalCardClass(
  tone: DashboardTone,
  onDarkSurface: boolean,
) {
  const baseClassName =
    "rounded-[18px] border p-3 shadow-[0_12px_22px_rgba(15,23,42,0.05)]";

  if (onDarkSurface) {
    switch (tone) {
      case "emerald":
        return `${baseClassName} border-emerald-300/18 bg-emerald-400/10`;
      case "amber":
        return `${baseClassName} border-amber-300/18 bg-amber-400/10`;
      case "sky":
        return `${baseClassName} border-sky-300/18 bg-sky-400/10`;
      case "rose":
        return `${baseClassName} border-rose-300/18 bg-rose-400/10`;
      case "slate":
      case "zinc":
        return `${baseClassName} border-white/10 bg-white/7`;
    }
  }

  switch (tone) {
    case "emerald":
      return `${baseClassName} border-emerald-200 bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_100%)]`;
    case "amber":
      return `${baseClassName} border-amber-200 bg-[linear-gradient(180deg,#fff8eb_0%,#ffffff_100%)]`;
    case "sky":
      return `${baseClassName} border-sky-200 bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_100%)]`;
    case "rose":
      return `${baseClassName} border-rose-200 bg-[linear-gradient(180deg,#fff6f7_0%,#ffffff_100%)]`;
    case "slate":
    case "zinc":
      return `${baseClassName} border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]`;
  }
}

function getDashboardSignalIconClass(
  tone: DashboardTone,
  onDarkSurface: boolean,
) {
  const baseClassName =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl";

  if (onDarkSurface) {
    switch (tone) {
      case "emerald":
        return `${baseClassName} bg-emerald-300/15 text-emerald-100`;
      case "amber":
        return `${baseClassName} bg-amber-300/15 text-amber-100`;
      case "sky":
        return `${baseClassName} bg-sky-300/15 text-sky-100`;
      case "rose":
        return `${baseClassName} bg-rose-300/15 text-rose-100`;
      case "slate":
      case "zinc":
        return `${baseClassName} bg-white/10 text-white`;
    }
  }

  switch (tone) {
    case "emerald":
      return `${baseClassName} bg-emerald-100 text-emerald-700`;
    case "amber":
      return `${baseClassName} bg-amber-100 text-amber-800`;
    case "sky":
      return `${baseClassName} bg-sky-100 text-sky-700`;
    case "rose":
      return `${baseClassName} bg-rose-100 text-rose-700`;
    case "slate":
    case "zinc":
      return `${baseClassName} bg-zinc-100 text-zinc-700`;
  }
}

function getProgressFillClass(tone: DashboardTone, onDarkSurface: boolean) {
  switch (tone) {
    case "emerald":
      return onDarkSurface
        ? "bg-[linear-gradient(90deg,#34d399_0%,#10b981_100%)]"
        : "bg-[linear-gradient(90deg,#10b981_0%,#059669_100%)]";
    case "amber":
      return onDarkSurface
        ? "bg-[linear-gradient(90deg,#fbbf24_0%,#f59e0b_100%)]"
        : "bg-[linear-gradient(90deg,#f59e0b_0%,#f97316_100%)]";
    case "sky":
      return onDarkSurface
        ? "bg-[linear-gradient(90deg,#38bdf8_0%,#0ea5e9_100%)]"
        : "bg-[linear-gradient(90deg,#0ea5e9_0%,#0284c7_100%)]";
    case "rose":
      return onDarkSurface
        ? "bg-[linear-gradient(90deg,#fb7185_0%,#f43f5e_100%)]"
        : "bg-[linear-gradient(90deg,#f43f5e_0%,#e11d48_100%)]";
    case "slate":
    case "zinc":
      return onDarkSurface
        ? "bg-[linear-gradient(90deg,#e2e8f0_0%,#94a3b8_100%)]"
        : "bg-[linear-gradient(90deg,#64748b_0%,#334155_100%)]";
  }
}

function getPerformanceCardClass(tone: DashboardTone) {
  const baseClassName =
    "rounded-[18px] border p-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)]";

  switch (tone) {
    case "emerald":
      return `${baseClassName} border-emerald-200 bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_100%)]`;
    case "amber":
      return `${baseClassName} border-amber-200 bg-[linear-gradient(180deg,#fff8eb_0%,#ffffff_100%)]`;
    case "sky":
      return `${baseClassName} border-sky-200 bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_100%)]`;
    case "rose":
      return `${baseClassName} border-rose-200 bg-[linear-gradient(180deg,#fff6f7_0%,#ffffff_100%)]`;
    case "slate":
    case "zinc":
      return `${baseClassName} border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]`;
  }
}

function getProgressTrackClass(tone: DashboardTone) {
  switch (tone) {
    case "emerald":
      return "bg-emerald-100";
    case "amber":
      return "bg-amber-100";
    case "sky":
      return "bg-sky-100";
    case "rose":
      return "bg-rose-100";
    case "slate":
    case "zinc":
      return "bg-zinc-100";
  }
}

function getPerformanceIconClass(tone: DashboardTone) {
  const baseClassName =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl";

  switch (tone) {
    case "emerald":
      return `${baseClassName} bg-emerald-100 text-emerald-700`;
    case "amber":
      return `${baseClassName} bg-amber-100 text-amber-800`;
    case "sky":
      return `${baseClassName} bg-sky-100 text-sky-700`;
    case "rose":
      return `${baseClassName} bg-rose-100 text-rose-700`;
    case "slate":
    case "zinc":
      return `${baseClassName} bg-slate-100 text-slate-700`;
  }
}

function getAttentionCardClass(tone: DashboardTone) {
  const baseClassName =
    "rounded-[20px] border p-3.5 shadow-[0_12px_24px_rgba(15,23,42,0.04)]";

  switch (tone) {
    case "amber":
      return `${baseClassName} border-amber-200 bg-[linear-gradient(180deg,#fff8eb_0%,#ffffff_100%)]`;
    case "emerald":
      return `${baseClassName} border-emerald-200 bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_100%)]`;
    case "sky":
      return `${baseClassName} border-sky-200 bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_100%)]`;
    case "rose":
      return `${baseClassName} border-rose-200 bg-[linear-gradient(180deg,#fff6f7_0%,#ffffff_100%)]`;
    case "slate":
    case "zinc":
      return `${baseClassName} border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]`;
  }
}

function getAttentionIconClass(tone: DashboardTone) {
  const baseClassName =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl";

  switch (tone) {
    case "amber":
      return `${baseClassName} bg-amber-100 text-amber-700`;
    case "emerald":
      return `${baseClassName} bg-emerald-100 text-emerald-700`;
    case "sky":
      return `${baseClassName} bg-sky-100 text-sky-700`;
    case "rose":
      return `${baseClassName} bg-rose-100 text-rose-700`;
    case "slate":
    case "zinc":
      return `${baseClassName} bg-zinc-100 text-zinc-700`;
  }
}

function getAttentionActionClass(tone: DashboardTone) {
  const baseClassName =
    "mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition";

  switch (tone) {
    case "amber":
      return `${baseClassName} border-amber-200 bg-white text-amber-900 hover:bg-amber-50`;
    case "emerald":
      return `${baseClassName} border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50`;
    case "sky":
      return `${baseClassName} border-sky-200 bg-white text-sky-800 hover:bg-sky-50`;
    case "rose":
      return `${baseClassName} border-rose-200 bg-white text-rose-800 hover:bg-rose-50`;
    case "slate":
    case "zinc":
      return `${baseClassName} border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50`;
  }
}

function getDashboardProductCardClass(
  isAvailable: boolean,
  isFeatured: boolean,
) {
  const baseClassName =
    "group rounded-[20px] border p-3 shadow-[0_14px_28px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(15,23,42,0.14)]";

  if (!isAvailable) {
    return `${baseClassName} border-rose-200 bg-[linear-gradient(180deg,#fff7f7_0%,#ffffff_100%)]`;
  }

  if (isFeatured) {
    return `${baseClassName} border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdf4_100%)]`;
  }

  return `${baseClassName} border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]`;
}

function getDashboardProductAccentClass(
  isAvailable: boolean,
  isFeatured: boolean,
) {
  if (!isAvailable) {
    return "bg-[linear-gradient(90deg,#fb7185_0%,#e11d48_100%)]";
  }

  if (isFeatured) {
    return "bg-[linear-gradient(90deg,#f59e0b_0%,#10b981_100%)]";
  }

  return "bg-[linear-gradient(90deg,#0ea5e9_0%,#10b981_100%)]";
}

function getProductFallback(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
