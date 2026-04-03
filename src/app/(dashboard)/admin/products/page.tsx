import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  EyeOff,
  LayoutGrid,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  SquarePen,
  Trash2,
} from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { deleteProductAction } from "@/src/app/(dashboard)/admin/products/actions";
import { getAdminProducts, getRestaurantForAdmin } from "@/src/lib/menu-data";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { formatBRL } from "@/src/lib/format";
import { Product } from "@/src/types/menu";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    category?: string;
    q?: string;
    tab?: string;
  }>;
};

type CatalogTabId = "products" | "complements" | "options";

type CategorySummary = {
  name: string;
  count: number;
  availableCount: number;
  featuredCount: number;
};

const catalogTabs: Array<{
  id: CatalogTabId;
  label: string;
  description: string;
}> = [
  {
    id: "products",
    label: "Produtos",
    description: "Catalogo principal em operacao",
  },
  {
    id: "complements",
    label: "Complementos",
    description: "Espaco preparado para proxima etapa",
  },
  {
    id: "options",
    label: "Opcoes",
    description: "Espaco preparado para proxima etapa",
  },
];

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [{ status, category, q, tab }, restaurant, products] = await Promise.all([
    searchParams,
    getRestaurantForAdmin(restaurantId),
    getAdminProducts(restaurantId),
  ]);

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  const activeTab = getActiveTab(tab);
  const statusMessage = getStatusMessage(status);
  const searchQuery = q?.trim() ?? "";

  const categorySummaries = Array.from(
    products
      .reduce((map, product) => {
        const current = map.get(product.category) ?? {
          name: product.category,
          count: 0,
          availableCount: 0,
          featuredCount: 0,
        };

        current.count += 1;

        if (product.isAvailable) {
          current.availableCount += 1;
        }

        if (product.featured) {
          current.featuredCount += 1;
        }

        map.set(product.category, current);
        return map;
      }, new Map<string, CategorySummary>())
      .values(),
  ).sort(
    (left, right) =>
      right.count - left.count || left.name.localeCompare(right.name, "pt-BR"),
  );

  const selectedCategory =
    activeTab === "products" && categorySummaries.some((item) => item.name === category)
      ? category ?? null
      : null;

  const productsByTab =
    activeTab === "products"
      ? selectedCategory
        ? products.filter((product) => product.category === selectedCategory)
        : products
      : [];

  const filteredProducts =
    searchQuery.length > 0
      ? productsByTab.filter((product) =>
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
            .includes(searchQuery.toLocaleLowerCase("pt-BR")),
        )
      : productsByTab;

  const availableCount = filteredProducts.filter((product) => product.isAvailable).length;
  const featuredCount = filteredProducts.filter((product) => product.featured).length;
  const averagePrice =
    filteredProducts.length > 0
      ? filteredProducts.reduce((sum, product) => sum + product.price, 0) /
        filteredProducts.length
      : 0;
  const leadingCategory = categorySummaries[0];

  return (
    <AdminShell
      title="Catalogo"
      description="Organize categorias, revise disponibilidade e mantenha o cardapio com cara de operacao viva."
      restaurantName={restaurant.name}
      userName={session.name}
      currentSection="products"
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={`/${restaurant.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-950/8 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-950/14"
          >
            Ver vitrine
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0d1726_0%,#172840_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(13,23,38,0.16)] transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
        </div>
      }
    >
      {statusMessage ? (
        <div className="mb-5 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {statusMessage}
        </div>
      ) : null}

      <section className="rounded-[32px] border border-zinc-950/6 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-5 border-b border-zinc-950/6 px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {catalogTabs.map((catalogTab) => {
                const isActive = activeTab === catalogTab.id;

                return (
                  <Link
                    key={catalogTab.id}
                    href={buildProductsHref({
                      tab: catalogTab.id,
                      category: catalogTab.id === "products" ? selectedCategory : null,
                      q: catalogTab.id === "products" ? searchQuery : "",
                    })}
                    className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--brand-ink)]"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
                    }`}
                  >
                    {catalogTab.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form
                action="/admin/products"
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5"
              >
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Pesquisar no catalogo"
                  className="w-full min-w-0 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400 lg:w-64"
                />
                <input type="hidden" name="tab" value={activeTab} />
                {selectedCategory ? (
                  <input type="hidden" name="category" value={selectedCategory} />
                ) : null}
              </form>

              <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-500">
                <SlidersHorizontal className="h-4 w-4" />
                Edicao em massa em breve
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-zinc-500">
              {catalogTabs.find((catalogTab) => catalogTab.id === activeTab)?.description}
            </div>

            <div className="flex flex-wrap gap-2">
              <HeaderChip
                icon={Package}
                label={`${products.length} itens totais`}
              />
              <HeaderChip
                icon={Sparkles}
                label={`${availableCount} ativos no recorte`}
              />
              <HeaderChip
                icon={LayoutGrid}
                label={`${categorySummaries.length} categorias`}
              />
            </div>
          </div>
        </div>

        {activeTab !== "products" ? (
          <div className="px-5 py-8 md:px-6">
            <div className="rounded-[28px] border border-dashed border-zinc-300 bg-zinc-50 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 md:text-[11px]">
                Em construcao
              </p>
              <h3 className="mt-4 text-[1.6rem] font-semibold tracking-tight text-zinc-950">
                {activeTab === "complements"
                  ? "Complementos entram na proxima etapa"
                  : "Opcoes entram na proxima etapa"}
              </h3>
              <p className="mt-3 max-w-2xl text-[15px] leading-8 text-zinc-500">
                A base de produtos principais ja esta pronta. Quando voce quiser,
                eu posso seguir nessa mesma linguagem visual e montar tambem os
                fluxos de complementos e opcoes.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="border-b border-zinc-950/6 px-5 py-5 xl:border-b-0 xl:border-r xl:px-0 xl:py-0">
              <div className="flex items-center justify-between xl:px-6 xl:pt-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 md:text-[11px]">
                    Categorias
                  </p>
                  <h3 className="mt-3 text-[1.25rem] font-semibold tracking-tight text-zinc-950">
                    Navegacao do catalogo
                  </h3>
                </div>

                <Link
                  href="/admin/products/new"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 flex gap-3 overflow-x-auto pb-2 xl:hidden">
                <CategoryPill
                  href={buildProductsHref({
                    tab: activeTab,
                    category: null,
                    q: searchQuery,
                  })}
                  label="Todos"
                  active={selectedCategory == null}
                  secondary={`${products.length} itens`}
                />
                {categorySummaries.map((item) => (
                  <CategoryPill
                    key={item.name}
                    href={buildProductsHref({
                      tab: activeTab,
                      category: item.name,
                      q: searchQuery,
                    })}
                    label={item.name}
                    active={selectedCategory === item.name}
                    secondary={`${item.count} itens`}
                  />
                ))}
              </div>

              <div className="mt-6 hidden xl:block">
                <CategoryRow
                  href={buildProductsHref({
                    tab: activeTab,
                    category: null,
                    q: searchQuery,
                  })}
                  label="Todos os produtos"
                  detail={`${products.length} itens no catalogo`}
                  meta={`${products.filter((product) => product.isAvailable).length} ativos`}
                  active={selectedCategory == null}
                  showMuted={products.length === 0}
                />

                {categorySummaries.map((item) => (
                  <CategoryRow
                    key={item.name}
                    href={buildProductsHref({
                      tab: activeTab,
                      category: item.name,
                      q: searchQuery,
                    })}
                    label={item.name}
                    detail={`${item.count} itens nesta categoria`}
                    meta={`${item.availableCount} ativos`}
                    active={selectedCategory === item.name}
                    showMuted={item.availableCount === 0}
                  />
                ))}
              </div>

              <div className="mt-6 rounded-[24px] bg-zinc-50 p-4 xl:mx-6 xl:mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Radar rapido
                </p>
                <div className="mt-3 space-y-2 text-sm text-zinc-500">
                  <div>
                    Categoria lider:
                    {" "}
                    <span className="font-semibold text-zinc-900">
                      {leadingCategory?.name ?? "Sem leitura"}
                    </span>
                  </div>
                  <div>
                    Destaques ativos:
                    {" "}
                    <span className="font-semibold text-zinc-900">
                      {products.filter((product) => product.featured).length}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0 px-5 py-5 md:px-6 md:py-6">
              <div className="flex flex-col gap-4 border-b border-zinc-950/6 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 md:text-[11px]">
                    {selectedCategory ? "Categoria selecionada" : "Visao geral"}
                  </p>
                  <h3 className="mt-3 text-[1.9rem] font-semibold tracking-tight text-zinc-950">
                    {selectedCategory ?? "Todos os produtos"}
                  </h3>
                  <p className="mt-3 text-[15px] leading-8 text-zinc-500">
                    {selectedCategory
                      ? "Uma leitura focada da categoria escolhida, com status, destaque e acesso direto para edicao."
                      : "Uma visao completa do catalogo com categorias, status de disponibilidade e organizacao da vitrine."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricMini
                    label="Itens visiveis"
                    value={`${availableCount}`}
                  />
                  <MetricMini
                    label="Destaques"
                    value={`${featuredCount}`}
                  />
                  <MetricMini
                    label="Preco medio"
                    value={formatBRL(averagePrice)}
                  />
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="mt-6 rounded-[28px] border border-dashed border-zinc-300 bg-zinc-50 p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 md:text-[11px]">
                    Sem resultado
                  </p>
                  <h4 className="mt-3 text-[1.3rem] font-semibold tracking-tight text-zinc-950">
                    {products.length === 0
                      ? "Seu catalogo ainda nao tem produtos"
                      : "Nenhum item encontrado neste recorte"}
                  </h4>
                  <p className="mt-3 max-w-2xl text-[15px] leading-8 text-zinc-500">
                    {products.length === 0
                      ? "Comece criando o primeiro produto para preencher o catalogo e liberar a vitrine publica."
                      : "Tente ajustar a busca ou trocar a categoria selecionada para ampliar a leitura do catalogo."}
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 2xl:grid-cols-2">
                  {filteredProducts.map((product) => (
                    <ProductCatalogCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

function getActiveTab(tab?: string): CatalogTabId {
  if (tab === "complements") return "complements";
  if (tab === "options") return "options";
  return "products";
}

function buildProductsHref({
  tab,
  category,
  q,
}: {
  tab: CatalogTabId;
  category: string | null;
  q: string;
}) {
  const params = new URLSearchParams();

  if (tab !== "products") {
    params.set("tab", tab);
  }

  if (tab === "products" && category) {
    params.set("category", category);
  }

  if (tab === "products" && q) {
    params.set("q", q);
  }

  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

function HeaderChip({
  icon: Icon,
  label,
}: {
  icon: typeof Package;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-semibold text-zinc-600">
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

function CategoryPill({
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
      className={`min-w-fit rounded-[22px] border px-4 py-3 transition ${
        active
          ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent-ink)]"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
      }`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-1 text-xs opacity-75">{secondary}</div>
    </Link>
  );
}

function CategoryRow({
  href,
  label,
  detail,
  meta,
  active,
  showMuted,
}: {
  href: string;
  label: string;
  detail: string;
  meta: string;
  active: boolean;
  showMuted: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-start justify-between gap-4 border-l-2 px-6 py-4 transition ${
        active
          ? "border-[var(--brand-closer)] bg-zinc-50"
          : "border-transparent hover:bg-zinc-50"
      }`}
    >
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-zinc-900">{label}</div>
        <div className="mt-1 text-sm text-zinc-500">{detail}</div>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
        {showMuted ? <EyeOff className="h-4 w-4" /> : null}
        {meta}
      </div>
    </Link>
  );
}

function MetricMini({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-[1.05rem] font-semibold text-zinc-950">
        {value}
      </div>
    </div>
  );
}

function ProductCatalogCard({
  product,
}: {
  product: Product;
}) {
  const isAvailable = Boolean(product.isAvailable);
  const isFeatured = Boolean(product.featured);
  const hasLocalImage = Boolean(product.image?.startsWith("/"));

  return (
    <article className="rounded-[28px] border border-zinc-950/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,243,238,0.9)_100%)] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-[22px] bg-zinc-100 sm:w-28">
          {hasLocalImage ? (
            <Image
              src={product.image!}
              alt={product.name}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f0ece4_0%,#e4edf8_100%)] text-[1.7rem] font-semibold text-zinc-500">
              {getProductFallback(product.name)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {product.category}
                </span>
                {isFeatured ? (
                  <span className="rounded-full bg-[var(--brand-accent-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent-ink)]">
                    Destaque
                  </span>
                ) : null}
                {product.badge ? (
                  <span className="rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink)]">
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 text-[1.18rem] font-semibold tracking-tight text-zinc-950">
                {product.name}
              </h3>
              <p className="mt-2 text-sm leading-7 text-zinc-500">
                {product.description}
              </p>

              {product.additionalInfo ? (
                <p className="mt-1 text-sm leading-7 text-zinc-500">
                  {product.additionalInfo}
                </p>
              ) : null}
            </div>

            <div
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
                isAvailable
                  ? "bg-[var(--brand-status-open)] text-[var(--status-open-ink)]"
                  : "bg-[var(--status-closed-soft)] text-[var(--status-closed-ink)]"
              }`}
            >
              {isAvailable ? "Ativo" : "Oculto"}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-950/6 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900">
                {formatBRL(product.price)}
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-600">
                #{product.id}
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                <SquarePen className="h-4 w-4" />
                Editar
              </Link>

              <form action={deleteProductAction.bind(null, product.id)}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function getStatusMessage(status?: string) {
  if (status === "created") return "Produto criado com sucesso.";
  if (status === "updated") return "Produto atualizado com sucesso.";
  if (status === "deleted") return "Produto excluido com sucesso.";
  if (status === "missing") return "O produto solicitado nao foi encontrado.";
  return null;
}

function getProductFallback(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
