import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  LayoutDashboard,
  Plus,
  Search,
  SquarePen,
} from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { getAdminProducts, getRestaurantForAdmin } from "@/src/lib/menu-data";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { formatBRL } from "@/src/lib/format";
import { Product } from "@/src/types/menu";

type PageProps = {
  searchParams: Promise<{
    tab?: string;
    focus?: string;
    q?: string;
  }>;
};

type DashboardTabId = "summary" | "publishing" | "curation";

type DashboardFocusId =
  | "overview"
  | "categories"
  | "pricing"
  | "live"
  | "paused"
  | "storefront"
  | "featured"
  | "mix"
  | "spotlight";

type DashboardTab = {
  id: DashboardTabId;
  label: string;
  description: string;
};

type DashboardFocusOption = {
  id: DashboardFocusId;
  label: string;
  detail: string;
  metric: string;
};

type CategoryInsight = {
  category: string;
  count: number;
  availableCount: number;
  featuredCount: number;
  share: number;
  availableRatio: number;
  averagePrice: number;
};

type FocusState = {
  eyebrow: string;
  title: string;
  description: string;
  highlightValue: string;
  highlightLabel: string;
  highlightDetail: string;
  progress: number;
  statCards: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  productsTitle: string;
  productsDescription: string;
  products: Product[];
  emptyTitle: string;
  emptyDetail: string;
};

const dashboardTabs: DashboardTab[] = [
  {
    id: "summary",
    label: "Resumo",
    description: "Leitura executiva do cardapio",
  },
  {
    id: "publishing",
    label: "Publicacao",
    description: "O que esta ativo na vitrine publica",
  },
  {
    id: "curation",
    label: "Curadoria",
    description: "Mix, destaque e produtos com mais visibilidade",
  },
];

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [{ tab, focus, q }, restaurant, products] = await Promise.all([
    searchParams,
    getRestaurantForAdmin(restaurantId),
    getAdminProducts(restaurantId),
  ]);

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  const activeTab = getActiveTab(tab);
  const searchQuery = q?.trim() ?? "";

  const availableProducts = products.filter((product) =>
    Boolean(product.isAvailable),
  );
  const unavailableProducts = products.filter((product) => !product.isAvailable);
  const featuredProducts = products.filter((product) => Boolean(product.featured));
  const featuredAvailableProducts = availableProducts.filter((product) =>
    Boolean(product.featured),
  );

  const availableCount = availableProducts.length;
  const unavailableCount = unavailableProducts.length;
  const featuredCount = featuredProducts.length;
  const categoryCount = new Set(products.map((product) => product.category)).size;
  const availableCategoryCount = new Set(
    availableProducts.map((product) => product.category),
  ).size;
  const averagePrice =
    products.length > 0
      ? products.reduce((sum, product) => sum + product.price, 0) / products.length
      : 0;
  const minPrice =
    products.length > 0
      ? Math.min(...products.map((product) => product.price))
      : 0;
  const maxPrice =
    products.length > 0
      ? Math.max(...products.map((product) => product.price))
      : 0;
  const publishedRatio =
    products.length > 0 ? Math.round((availableCount / products.length) * 100) : 0;
  const unavailableRatio =
    products.length > 0
      ? Math.round((unavailableCount / products.length) * 100)
      : 0;
  const featuredRatio =
    products.length > 0 ? Math.round((featuredCount / products.length) * 100) : 0;
  const averageItemsPerCategory =
    categoryCount > 0 ? products.length / categoryCount : 0;
  const averageItemsLabel =
    categoryCount > 0 ? averageItemsPerCategory.toFixed(1).replace(".", ",") : "0";
  const pricePocket =
    products.length > 0
      ? `${formatBRL(minPrice)} ate ${formatBRL(maxPrice)}`
      : "Sem faixa definida";

  const categoryInsights = Array.from(
    products
      .reduce((map, product) => {
        const current = map.get(product.category) ?? {
          category: product.category,
          count: 0,
          availableCount: 0,
          featuredCount: 0,
          totalPrice: 0,
        };

        current.count += 1;
        current.totalPrice += product.price;

        if (product.isAvailable) {
          current.availableCount += 1;
        }

        if (product.featured) {
          current.featuredCount += 1;
        }

        map.set(product.category, current);
        return map;
      }, new Map<string, { category: string; count: number; availableCount: number; featuredCount: number; totalPrice: number }>())
      .values(),
  )
    .map((item) => ({
      category: item.category,
      count: item.count,
      availableCount: item.availableCount,
      featuredCount: item.featuredCount,
      share: Math.round((item.count / Math.max(products.length, 1)) * 100),
      availableRatio: Math.round(
        (item.availableCount / Math.max(item.count, 1)) * 100,
      ),
      averagePrice: item.count > 0 ? item.totalPrice / item.count : 0,
    }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        right.availableCount - left.availableCount ||
        left.category.localeCompare(right.category, "pt-BR"),
    );

  const topCategory = categoryInsights[0];
  const topAvailableCategory = [...categoryInsights].sort(
    (left, right) =>
      right.availableCount - left.availableCount ||
      left.category.localeCompare(right.category, "pt-BR"),
  )[0];

  const sortedProducts = [...products].sort(
    (left, right) =>
      Number(Boolean(right.isAvailable)) - Number(Boolean(left.isAvailable)) ||
      Number(Boolean(right.featured)) - Number(Boolean(left.featured)) ||
      right.price - left.price ||
      left.name.localeCompare(right.name, "pt-BR"),
  );
  const sortedAvailableProducts = [...availableProducts].sort(
    (left, right) =>
      Number(Boolean(right.featured)) - Number(Boolean(left.featured)) ||
      right.price - left.price ||
      left.name.localeCompare(right.name, "pt-BR"),
  );
  const sortedUnavailableProducts = [...unavailableProducts].sort(
    (left, right) =>
      Number(Boolean(right.featured)) - Number(Boolean(left.featured)) ||
      right.price - left.price ||
      left.name.localeCompare(right.name, "pt-BR"),
  );
  const sortedFeaturedProducts = [...featuredProducts].sort(
    (left, right) =>
      Number(Boolean(right.isAvailable)) - Number(Boolean(left.isAvailable)) ||
      right.price - left.price ||
      left.name.localeCompare(right.name, "pt-BR"),
  );
  const sortedByPriceProducts = [...products].sort(
    (left, right) =>
      right.price - left.price || left.name.localeCompare(right.name, "pt-BR"),
  );

  const focusOptionsByTab: Record<DashboardTabId, DashboardFocusOption[]> = {
    summary: [
      {
        id: "overview",
        label: "Panorama",
        detail: "Leitura geral do cardapio",
        metric: `${products.length} itens`,
      },
      {
        id: "categories",
        label: "Categorias",
        detail: "Onde o mix se concentra",
        metric: `${categoryCount} ativas`,
      },
      {
        id: "pricing",
        label: "Precos",
        detail: "Faixa e media praticada",
        metric: formatBRL(averagePrice),
      },
    ],
    publishing: [
      {
        id: "live",
        label: "Ativos",
        detail: "Itens publicados agora",
        metric: `${availableCount} itens`,
      },
      {
        id: "paused",
        label: "Pausados",
        detail: "Itens fora da vitrine",
        metric: `${unavailableCount} itens`,
      },
      {
        id: "storefront",
        label: "Vitrine",
        detail: "Cobertura da publicacao",
        metric: `${publishedRatio}%`,
      },
    ],
    curation: [
      {
        id: "featured",
        label: "Destaques",
        detail: "Itens com mais peso visual",
        metric: `${featuredCount} itens`,
      },
      {
        id: "mix",
        label: "Mix forte",
        detail: topCategory
          ? `${topCategory.category} lidera hoje`
          : "Sem leitura de categoria",
        metric: topCategory ? `${topCategory.share}%` : "0%",
      },
      {
        id: "spotlight",
        label: "Spotlight",
        detail: "Prontos para puxar venda",
        metric: `${featuredAvailableProducts.length} itens`,
      },
    ],
  };

  const focusOptions = focusOptionsByTab[activeTab];
  const activeFocus = getActiveFocus(focus, focusOptions);

  const focusState = getFocusState({
    activeFocus,
    products,
    sortedProducts,
    sortedAvailableProducts,
    sortedUnavailableProducts,
    sortedFeaturedProducts,
    sortedByPriceProducts,
    featuredAvailableProducts,
    availableCount,
    unavailableCount,
    categoryCount,
    availableCategoryCount,
    featuredCount,
    averagePrice,
    minPrice,
    maxPrice,
    pricePocket,
    publishedRatio,
    unavailableRatio,
    featuredRatio,
    averageItemsLabel,
    topCategory,
    topAvailableCategory,
  });

  const filteredFocusProducts = filterProducts(focusState.products, searchQuery);
  const reviewCountLabel = restaurant.reviewCount
    ? `${restaurant.reviewCount} avaliacoes registradas`
    : "Sem volume registrado";

  return (
    <AdminShell
      title="Dashboard do cardapio"
      description="Leia o menu como operacao, acompanhe a vitrine e aja rapido nos pontos que mexem com venda."
      restaurantName={restaurant.name}
      userName={session.name}
      currentSection="dashboard"
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Gerenciar produtos
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/${restaurant.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Ver vitrine
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      }
    >
      <section className="overflow-hidden rounded-[16px] border border-zinc-200 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.035)]">
        <div className="border-b border-zinc-200 px-5 py-4 md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-6">
              {dashboardTabs.map((dashboardTab) => {
                const isActive = dashboardTab.id === activeTab;

                return (
                  <Link
                    key={dashboardTab.id}
                    href={buildDashboardHref({
                      tab: dashboardTab.id,
                      focus:
                        dashboardTab.id === activeTab ? activeFocus : null,
                      q: dashboardTab.id === activeTab ? searchQuery : "",
                    })}
                    className={`border-b-2 pb-3 text-sm font-semibold uppercase tracking-[0.08em] transition ${
                      isActive
                        ? "border-violet-500 text-violet-600"
                        : "border-transparent text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    {dashboardTab.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form
                action="/admin/dashboard"
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5"
              >
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Pesquisar no dashboard"
                  className="w-full min-w-0 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400 lg:w-60"
                />
                <input type="hidden" name="tab" value={activeTab} />
                <input type="hidden" name="focus" value={activeFocus} />
              </form>

              <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-500">
                <LayoutDashboard className="h-4 w-4" />
                {dashboardTabs.find((dashboardTab) => dashboardTab.id === activeTab)
                  ?.description}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-zinc-200 xl:border-b-0 xl:border-r">
            <div className="border-b border-zinc-200 px-5 py-5 md:px-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Focos
              </p>
              <h3 className="mt-3 text-[1.15rem] font-semibold tracking-tight text-zinc-950">
                Leituras do dashboard
              </h3>
            </div>

            <div className="flex gap-3 overflow-x-auto px-5 py-4 xl:hidden">
              {focusOptions.map((item) => (
                <FocusPill
                  key={item.id}
                  href={buildDashboardHref({
                    tab: activeTab,
                    focus: item.id,
                    q: searchQuery,
                  })}
                  label={item.label}
                  secondary={item.metric}
                  active={activeFocus === item.id}
                />
              ))}
            </div>

            <div className="hidden xl:block">
              {focusOptions.map((item) => (
                <FocusRow
                  key={item.id}
                  href={buildDashboardHref({
                    tab: activeTab,
                    focus: item.id,
                    q: searchQuery,
                  })}
                  label={item.label}
                  detail={item.detail}
                  meta={item.metric}
                  active={activeFocus === item.id}
                />
              ))}
            </div>

            <div className="border-t border-zinc-200 px-5 py-5 md:px-6">
              <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Operacao
                </p>
                <div className="mt-3 space-y-2 text-sm text-zinc-500">
                  <div>
                    Restaurante:
                    {" "}
                    <span className="font-semibold text-zinc-900">
                      {restaurant.name}
                    </span>
                  </div>
                  <div>
                    Entrega:
                    {" "}
                    <span className="font-semibold text-zinc-900">
                      {restaurant.deliveryTime ?? "Nao definido"}
                    </span>
                  </div>
                  <div>
                    Avaliacao:
                    {" "}
                    <span className="font-semibold text-zinc-900">
                      {restaurant.rating
                        ? `${restaurant.rating.toFixed(1)} de media`
                        : "Sem nota"}
                    </span>
                  </div>
                  <div>
                    Reviews:
                    {" "}
                    <span className="font-semibold text-zinc-900">
                      {reviewCountLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="border-b border-zinc-200 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                    {focusState.eyebrow}
                  </p>
                  <h3 className="mt-3 text-[1.6rem] font-semibold tracking-tight text-zinc-950 md:text-[1.8rem]">
                    {focusState.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-8 text-zinc-500">
                    {focusState.description}
                  </p>
                </div>

                <div className="rounded-[12px] border border-violet-200 bg-violet-50 px-5 py-4 xl:min-w-[260px]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">
                    Indicador
                  </div>
                  <div className="mt-3 text-[2rem] font-semibold tracking-tight text-zinc-950">
                    {focusState.highlightValue}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-700">
                    {focusState.highlightLabel}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-500">
                    {focusState.highlightDetail}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 border-b border-zinc-200 md:grid-cols-3">
              {focusState.statCards.map((card, index) => (
                <div
                  key={card.label}
                  className={`px-5 py-4 md:px-6 ${
                    index < focusState.statCards.length - 1
                      ? "border-b border-zinc-200 md:border-b-0 md:border-r"
                      : ""
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                    {card.label}
                  </p>
                  <div className="mt-2 text-[1.1rem] font-semibold tracking-tight text-zinc-950">
                    {card.value}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{card.detail}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="min-w-0">
                <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-5 md:px-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                      Produtos em foco
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <h4 className="text-[1.28rem] font-semibold tracking-tight text-zinc-950">
                        {focusState.productsTitle}
                      </h4>
                      <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        {filteredFocusProducts.length} itens
                      </span>
                    </div>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                      {focusState.productsDescription}
                    </p>
                  </div>

                  <Link
                    href="/admin/products"
                    className="inline-flex w-fit shrink-0 items-center gap-2 self-start rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    Abrir catalogo
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                {filteredFocusProducts.length === 0 ? (
                  <div className="px-5 py-6 md:px-6">
                    <div className="rounded-[12px] border border-dashed border-zinc-300 bg-zinc-50 p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                        Sem resultado
                      </p>
                      <h5 className="mt-3 text-[1.15rem] font-semibold tracking-tight text-zinc-950">
                        {focusState.emptyTitle}
                      </h5>
                      <p className="mt-3 text-sm leading-7 text-zinc-500">
                        {searchQuery.length > 0
                          ? "Ajuste a busca para ampliar a leitura deste foco."
                          : focusState.emptyDetail}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 px-5 py-5 md:px-6">
                    {filteredFocusProducts.map((product) => (
                      <DashboardProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>

              <aside className="border-t border-zinc-200 xl:border-t-0 xl:border-l">
                <div className="px-5 py-5 md:px-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                    Categorias fortes
                  </p>

                  <div className="mt-4 space-y-3">
                    {categoryInsights.length === 0 ? (
                      <div className="rounded-[12px] border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
                        Cadastre produtos para construir a leitura do painel.
                      </div>
                    ) : (
                      categoryInsights.slice(0, 4).map((insight) => (
                        <CategoryMeter key={insight.category} insight={insight} />
                      ))
                    )}
                  </div>

                  <div className="mt-5 rounded-[12px] border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                      Resumo rapido
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-zinc-500">
                      <div>
                        Itens totais:
                        {" "}
                        <span className="font-semibold text-zinc-900">
                          {products.length}
                        </span>
                      </div>
                      <div>
                        Ativos:
                        {" "}
                        <span className="font-semibold text-zinc-900">
                          {availableCount}
                        </span>
                      </div>
                      <div>
                        Faixa:
                        {" "}
                        <span className="font-semibold text-zinc-900">
                          {pricePocket}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function getActiveTab(tab?: string): DashboardTabId {
  if (tab === "publishing") return "publishing";
  if (tab === "curation") return "curation";
  return "summary";
}

function getActiveFocus(
  focus: string | undefined,
  focusOptions: DashboardFocusOption[],
): DashboardFocusId {
  return (
    focusOptions.find((item) => item.id === focus)?.id ?? focusOptions[0]?.id ?? "overview"
  );
}

function buildDashboardHref({
  tab,
  focus,
  q,
}: {
  tab: DashboardTabId;
  focus: DashboardFocusId | null;
  q: string;
}) {
  const params = new URLSearchParams();

  if (tab !== "summary") {
    params.set("tab", tab);
  }

  if (focus) {
    params.set("focus", focus);
  }

  if (q) {
    params.set("q", q);
  }

  const query = params.toString();
  return query ? `/admin/dashboard?${query}` : "/admin/dashboard";
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

function getFocusState({
  activeFocus,
  products,
  sortedProducts,
  sortedAvailableProducts,
  sortedUnavailableProducts,
  sortedFeaturedProducts,
  sortedByPriceProducts,
  featuredAvailableProducts,
  availableCount,
  unavailableCount,
  categoryCount,
  availableCategoryCount,
  featuredCount,
  averagePrice,
  minPrice,
  maxPrice,
  pricePocket,
  publishedRatio,
  unavailableRatio,
  featuredRatio,
  averageItemsLabel,
  topCategory,
  topAvailableCategory,
}: {
  activeFocus: DashboardFocusId;
  products: Product[];
  sortedProducts: Product[];
  sortedAvailableProducts: Product[];
  sortedUnavailableProducts: Product[];
  sortedFeaturedProducts: Product[];
  sortedByPriceProducts: Product[];
  featuredAvailableProducts: Product[];
  availableCount: number;
  unavailableCount: number;
  categoryCount: number;
  availableCategoryCount: number;
  featuredCount: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  pricePocket: string;
  publishedRatio: number;
  unavailableRatio: number;
  featuredRatio: number;
  averageItemsLabel: string;
  topCategory?: CategoryInsight;
  topAvailableCategory?: CategoryInsight;
}): FocusState {
  switch (activeFocus) {
    case "categories":
      return {
        eyebrow: "Resumo de categorias",
        title: topCategory
          ? `Categoria lider: ${topCategory.category}`
          : "Categorias do cardapio",
        description:
          "Entenda onde o menu ganha volume, como a disponibilidade se distribui e qual grupo merece mais atencao agora.",
        highlightValue: topCategory ? `${topCategory.share}%` : `${categoryCount}`,
        highlightLabel: topCategory
          ? "do cardapio concentrado na categoria lider"
          : "categorias ativas no cardapio",
        highlightDetail: topCategory
          ? `${topCategory.count} itens, ${topCategory.availableRatio}% publicados e ticket medio de ${formatBRL(topCategory.averagePrice)}.`
          : "Cadastre produtos para formar a primeira leitura de categorias.",
        progress: topCategory?.share ?? 0,
        statCards: [
          {
            label: "Categorias",
            value: `${categoryCount}`,
            detail: "grupos ativos hoje",
          },
          {
            label: "Media por grupo",
            value: averageItemsLabel,
            detail: "itens por categoria",
          },
          {
            label: "Mais forte",
            value: topCategory ? topCategory.category : "Sem leitura",
            detail: "categoria lider atual",
          },
        ],
        productsTitle: "Itens da categoria com mais peso",
        productsDescription:
          "Use esta amostra para decidir se o grupo lider esta equilibrado, bem publicado e com curadoria suficiente.",
        products: topCategory
          ? sortedProducts
              .filter((product) => product.category === topCategory.category)
              .slice(0, 6)
          : sortedProducts.slice(0, 6),
        emptyTitle: "Ainda nao ha leitura de categoria",
        emptyDetail:
          "Assim que houver produtos no catalogo, o painel passa a destacar a categoria com mais forca.",
      };

    case "pricing":
      return {
        eyebrow: "Resumo de precos",
        title: "Faixa e percepcao de preco",
        description:
          "Veja rapidamente o posicionamento do menu, o ticket medio atual e os itens que puxam o topo da precificacao.",
        highlightValue: formatBRL(averagePrice),
        highlightLabel: "ticket medio do cardapio",
        highlightDetail:
          products.length > 0
            ? `Hoje o menu varia de ${formatBRL(minPrice)} ate ${formatBRL(maxPrice)}.`
            : "Cadastre produtos para gerar a primeira faixa de precos.",
        progress:
          maxPrice > 0 ? Math.round((averagePrice / Math.max(maxPrice, 1)) * 100) : 0,
        statCards: [
          {
            label: "Faixa atual",
            value: pricePocket,
            detail: "do menor ao maior valor",
          },
          {
            label: "Item premium",
            value: sortedByPriceProducts[0]
              ? formatBRL(sortedByPriceProducts[0].price)
              : "Sem leitura",
            detail: sortedByPriceProducts[0]?.name ?? "sem item no topo",
          },
          {
            label: "Media",
            value: formatBRL(averagePrice),
            detail: "base completa do menu",
          },
        ],
        productsTitle: "Itens que puxam a faixa de preco",
        productsDescription:
          "Uma leitura rapida dos itens de maior valor para revisar descricoes, destaque e coerencia da oferta.",
        products: sortedByPriceProducts.slice(0, 6),
        emptyTitle: "Nao ha itens para ler a precificacao",
        emptyDetail:
          "Adicione produtos para construir a media e a faixa de precos do cardapio.",
      };

    case "live":
      return {
        eyebrow: "Publicacao ativa",
        title: "Itens publicados na vitrine",
        description:
          "Veja o que esta no ar agora e acompanhe o recorte que o cliente realmente enxerga quando entra no menu.",
        highlightValue: `${availableCount}`,
        highlightLabel: "produtos ativos agora",
        highlightDetail:
          availableCount > 0
            ? `${publishedRatio}% do catalogo esta publicado e distribuido em ${availableCategoryCount} categorias.`
            : "Nenhum item esta ativo no momento.",
        progress: publishedRatio,
        statCards: [
          {
            label: "Cobertura",
            value: `${publishedRatio}%`,
            detail: "indice de publicacao atual",
          },
          {
            label: "Categorias ativas",
            value: `${availableCategoryCount}`,
            detail: "grupos com itens na vitrine",
          },
          {
            label: "Destaques ao vivo",
            value: `${featuredAvailableProducts.length}`,
            detail: "ja visiveis para o cliente",
          },
        ],
        productsTitle: "Produtos ativos para acompanhar",
        productsDescription:
          "Amostra dos itens que sustentam a vitrine publica neste momento, com atalho rapido para edicao fina.",
        products: sortedAvailableProducts.slice(0, 6),
        emptyTitle: "Nenhum item esta publicado agora",
        emptyDetail:
          "Revise a disponibilidade para recolocar o menu no ar e restaurar a vitrine publica.",
      };

    case "paused":
      return {
        eyebrow: "Publicacao pausada",
        title: "Itens fora da vitrine",
        description:
          "Centralize o que saiu do ar para decidir o que deve voltar, o que precisa de ajuste e o que pode seguir pausado.",
        highlightValue: `${unavailableCount}`,
        highlightLabel: "produtos ocultos do menu publico",
        highlightDetail:
          unavailableCount > 0
            ? `${unavailableRatio}% do catalogo esta pausado neste momento.`
            : "Todo o cardapio esta visivel, sem itens ocultos.",
        progress: unavailableRatio,
        statCards: [
          {
            label: "Fora do ar",
            value: `${unavailableRatio}%`,
            detail: "parte pausada do catalogo",
          },
          {
            label: "Destaques pausados",
            value: `${sortedUnavailableProducts.filter((product) => product.featured).length}`,
            detail: "merecem revisao mais rapida",
          },
          {
            label: "Itens ativos",
            value: `${availableCount}`,
            detail: "seguem sustentando a vitrine",
          },
        ],
        productsTitle: "Produtos pausados que pedem decisao",
        productsDescription:
          "Abra os itens ocultos para decidir se vale reativar, editar ou manter fora do ar.",
        products: sortedUnavailableProducts.slice(0, 6),
        emptyTitle: "Nao ha itens pausados agora",
        emptyDetail:
          "Toda a base esta publicada neste momento, o que ajuda a manter a vitrine cheia e consistente.",
      };

    case "storefront":
      return {
        eyebrow: "Leitura da vitrine",
        title: "Cobertura do cardapio publico",
        description:
          "Acompanhe como o cliente encontra o menu hoje, com foco na presenca dos itens ativos e na distribuicao entre categorias.",
        highlightValue: `${publishedRatio}%`,
        highlightLabel: "do cardapio esta visivel",
        highlightDetail:
          availableCount > 0
            ? `${availableCount} itens no ar, com ${featuredAvailableProducts.length} destaques reforcando a navegacao.`
            : "A vitrine esta vazia neste momento.",
        progress: publishedRatio,
        statCards: [
          {
            label: "Itens ativos",
            value: `${availableCount}`,
            detail: "ja visiveis para o cliente",
          },
          {
            label: "Categoria lider",
            value: topAvailableCategory
              ? topAvailableCategory.category
              : "Sem leitura",
            detail: "grupo com mais itens publicados",
          },
          {
            label: "Destaques",
            value: `${featuredAvailableProducts.length}`,
            detail: "em evidencia na vitrine",
          },
        ],
        productsTitle: "Produtos mais presentes na vitrine",
        productsDescription:
          "Uma leitura do que esta puxando a visualizacao publica agora, ideal para revisar curadoria e organizacao.",
        products: sortedAvailableProducts.slice(0, 6),
        emptyTitle: "A vitrine esta sem produtos",
        emptyDetail:
          "Ative itens do cardapio para voltar a mostrar oferta ao cliente.",
      };

    case "featured":
      return {
        eyebrow: "Curadoria em destaque",
        title: "Itens marcados como destaque",
        description:
          "Concentre aqui os produtos com mais peso visual no menu para revisar se o destaque esta bem distribuido e coerente.",
        highlightValue: `${featuredCount}`,
        highlightLabel: "produtos com destaque ativo",
        highlightDetail:
          featuredCount > 0
            ? `${featuredRatio}% do cardapio recebe mais evidencia na navegacao.`
            : "Nenhum item foi marcado como destaque ainda.",
        progress: featuredRatio,
        statCards: [
          {
            label: "Destaques no ar",
            value: `${featuredAvailableProducts.length}`,
            detail: "visiveis na vitrine",
          },
          {
            label: "Destaques pausados",
            value: `${featuredCount - featuredAvailableProducts.length}`,
            detail: "fora do menu publico",
          },
          {
            label: "Cobertura",
            value: `${featuredRatio}%`,
            detail: "parte curada do menu",
          },
        ],
        productsTitle: "Produtos em destaque para revisar",
        productsDescription:
          "Amostra dos itens com mais peso visual para ajustar oferta, descricao, preco e prioridade comercial.",
        products: sortedFeaturedProducts.slice(0, 6),
        emptyTitle: "Nao ha itens em destaque",
        emptyDetail:
          "Marcar itens como destaque ajuda a guiar o olhar do cliente na navegacao do menu.",
      };

    case "mix":
      return {
        eyebrow: "Curadoria de mix",
        title: topCategory
          ? `Mix liderado por ${topCategory.category}`
          : "Mix do cardapio",
        description:
          "Leia a distribuicao do menu para entender onde o sortimento esta forte, onde falta profundidade e o que vale equilibrar.",
        highlightValue: topCategory ? topCategory.category : `${categoryCount}`,
        highlightLabel: topCategory
          ? `${topCategory.share}% do menu esta nesta categoria`
          : "categorias ativas no cardapio",
        highlightDetail: topCategory
          ? `${topCategory.count} itens no grupo lider, ${topCategory.featuredCount} com destaque e ${topCategory.availableRatio}% publicados.`
          : "Cadastre produtos para construir uma leitura real de mix.",
        progress: topCategory?.share ?? 0,
        statCards: [
          {
            label: "Categorias",
            value: `${categoryCount}`,
            detail: "grupos em operacao",
          },
          {
            label: "Media por grupo",
            value: averageItemsLabel,
            detail: "itens por categoria",
          },
          {
            label: "Mais publicada",
            value: topAvailableCategory
              ? topAvailableCategory.category
              : "Sem leitura",
            detail: "lider entre os itens ativos",
          },
        ],
        productsTitle: "Produtos do mix mais forte",
        productsDescription:
          "Veja os itens da categoria mais forte para ajustar equilibrio, profundidade e distribuicao de destaque.",
        products: topCategory
          ? sortedProducts
              .filter((product) => product.category === topCategory.category)
              .slice(0, 6)
          : sortedProducts.slice(0, 6),
        emptyTitle: "Ainda nao ha leitura de mix",
        emptyDetail:
          "Com mais produtos cadastrados, o painel passa a mostrar onde o cardapio concentra mais forca.",
      };

    case "spotlight":
      return {
        eyebrow: "Spotlight comercial",
        title: "Itens prontos para puxar venda",
        description:
          "Combine visibilidade e atratividade comercial para escolher o que merece subir de prioridade no turno.",
        highlightValue: `${featuredAvailableProducts.length}`,
        highlightLabel: "itens com destaque e visibilidade ativa",
        highlightDetail:
          featuredAvailableProducts.length > 0
            ? "Esses itens ja estao publicados e com maior chance de capturar atencao logo no primeiro contato."
            : "Nenhum item esta ao mesmo tempo publicado e em destaque.",
        progress:
          availableCount > 0
            ? Math.round(
                (featuredAvailableProducts.length / Math.max(availableCount, 1)) * 100,
              )
            : 0,
        statCards: [
          {
            label: "Spotlight",
            value: `${featuredAvailableProducts.length}`,
            detail: "destaques ao vivo",
          },
          {
            label: "Ativos",
            value: `${availableCount}`,
            detail: "itens publicados agora",
          },
          {
            label: "Preco medio",
            value: formatBRL(averagePrice),
            detail: "base completa do menu",
          },
        ],
        productsTitle: "Produtos com mais chance de chamar atencao",
        productsDescription:
          "Selecao de itens que podem puxar venda pela combinacao de visibilidade, disponibilidade e relevancia.",
        products:
          featuredAvailableProducts.length > 0
            ? featuredAvailableProducts.slice(0, 6)
            : sortedAvailableProducts.slice(0, 6),
        emptyTitle: "Nao ha itens prontos para spotlight",
        emptyDetail:
          "Ative itens e marque destaques para reforcar a vitrine comercial do cardapio.",
      };

    case "overview":
    default:
      return {
        eyebrow: "Resumo do cardapio",
        title: "Panorama geral da operacao",
        description:
          "Uma leitura executiva do menu para acompanhar saude da publicacao, organizacao do mix e o que merece atencao imediata.",
        highlightValue: `${products.length}`,
        highlightLabel: "itens no cardapio",
        highlightDetail:
          products.length > 0
            ? `${availableCount} ativos, ${unavailableCount} pausados e ${categoryCount} categorias alimentando a vitrine.`
            : "Comece cadastrando produtos para ativar a leitura do dashboard.",
        progress: publishedRatio,
        statCards: [
          {
            label: "Publicados",
            value: `${availableCount}`,
            detail: "ja visiveis para o cliente",
          },
          {
            label: "Categorias",
            value: `${categoryCount}`,
            detail: `${averageItemsLabel} itens por categoria`,
          },
          {
            label: "Faixa",
            value: pricePocket,
            detail: "menor e maior preco hoje",
          },
        ],
        productsTitle: "Itens que merecem acompanhamento",
        productsDescription:
          "Uma amostra rapida do que esta puxando a visibilidade do menu agora, com acesso direto para ajustes finos.",
        products: sortedProducts.slice(0, 6),
        emptyTitle: "O cardapio ainda nao tem itens",
        emptyDetail:
          "Crie os primeiros produtos para desbloquear a leitura de saude, publicacao e curadoria no painel.",
      };
  }
}

function FocusPill({
  href,
  label,
  secondary,
  active,
}: {
  href: string;
  label: string;
  secondary: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`min-w-fit rounded-lg border px-4 py-3 transition ${
        active
          ? "border-violet-200 bg-violet-50 text-violet-600"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
      }`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-1 text-xs opacity-75">{secondary}</div>
    </Link>
  );
}

function FocusRow({
  href,
  label,
  detail,
  meta,
  active,
}: {
  href: string;
  label: string;
  detail: string;
  meta: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-start justify-between gap-4 border-l-[3px] px-6 py-4 transition ${
        active
          ? "border-violet-500 bg-zinc-50"
          : "border-transparent hover:bg-zinc-50"
      }`}
    >
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-zinc-900">{label}</div>
        <div className="mt-1 text-sm text-zinc-500">{detail}</div>
      </div>

      <div className="text-sm font-semibold text-zinc-500">{meta}</div>
    </Link>
  );
}

function CategoryMeter({
  insight,
}: {
  insight: CategoryInsight;
}) {
  return (
    <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">
            {insight.category}
          </div>
          <div className="mt-1 text-sm text-zinc-500">
            {insight.count} itens e {insight.featuredCount} destaque(s)
          </div>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-zinc-700">
          {insight.share}%
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full bg-white">
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,#8b5cf6_0%,#a78bfa_100%)]"
          style={{ width: `${insight.share}%` }}
        />
      </div>
    </div>
  );
}

function DashboardProductCard({
  product,
}: {
  product: Product;
}) {
  const isAvailable = Boolean(product.isAvailable);
  const hasLocalImage = Boolean(product.image?.startsWith("/"));

  return (
    <article className="rounded-[12px] border border-zinc-200 bg-white px-4 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-[72px] w-full shrink-0 overflow-hidden rounded-[10px] bg-zinc-100 sm:w-[72px]">
          {hasLocalImage ? (
            <Image
              src={product.image!}
              alt={product.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f0ece4_0%,#ece8ff_100%)] text-[1.1rem] font-semibold text-zinc-500">
              {getProductFallback(product.name)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  {product.category}
                </span>
                {product.featured ? (
                  <span className="rounded-md bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">
                    Destaque
                  </span>
                ) : null}
                {product.badge ? (
                  <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <h5 className="mt-2 text-[1rem] font-semibold tracking-tight text-zinc-950">
                {product.name}
              </h5>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {product.description}
              </p>

              {product.additionalInfo ? (
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {product.additionalInfo}
                </p>
              ) : null}
            </div>

            <div
              className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                isAvailable
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {isAvailable ? "Ativo" : "Oculto"}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-zinc-200 pt-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[1.05rem] font-semibold text-emerald-700">
                {formatBRL(product.price)}
              </span>
              <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                #{product.id}
              </span>
            </div>

            <Link
              href={`/admin/products/${product.id}/edit`}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              <SquarePen className="h-4 w-4" />
              Editar item
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function getProductFallback(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
