import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus, Search, Sparkles, SquarePen } from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { CategoryForm } from "@/src/components/admin/category-form";
import { createCategoryAction } from "@/src/app/(dashboard)/admin/products/actions";
import {
  buildAdminCategorySummaries,
  getAdminCategories,
  getAdminProducts,
  getRestaurantForAdmin,
} from "@/src/lib/menu-data";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { formatBRL } from "@/src/lib/format";
import { AdminCategorySummary, Product } from "@/src/types/menu";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    category?: string;
    q?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [{ status, category, q }, restaurant, products, registeredCategories] =
    await Promise.all([
      searchParams,
      getRestaurantForAdmin(restaurantId),
      getAdminProducts(restaurantId),
      getAdminCategories(restaurantId),
    ]);

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  const statusMessage = getStatusMessage(status);
  const searchQuery = q?.trim() ?? "";

  const sortedCategorySummaries = buildAdminCategorySummaries(
    products,
    registeredCategories.map((categoryItem) => categoryItem.name),
  );

  const selectedCategory = sortedCategorySummaries.some((item) => item.name === category)
    ? (category ?? "")
    : "";
  const selectedCategorySummary = sortedCategorySummaries.find(
    (item) => item.name === selectedCategory,
  );

  const baseProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;
  const filteredProducts = filterProducts(baseProducts, searchQuery);
  const sortedProducts = [...filteredProducts].sort(
    (left, right) =>
      Number(Boolean(right.isAvailable)) - Number(Boolean(left.isAvailable)) ||
      Number(Boolean(right.featured)) - Number(Boolean(left.featured)) ||
      right.price - left.price ||
      left.name.localeCompare(right.name, "pt-BR"),
  );

  const availableCount = products.filter((product) => Boolean(product.isAvailable)).length;
  const featuredCount = products.filter((product) => Boolean(product.featured)).length;
  const averagePrice =
    products.length > 0
      ? products.reduce((sum, product) => sum + product.price, 0) / products.length
      : 0;

  return (
    <AdminShell
      title="Catalogo"
      description="Organize produtos, acompanhe categorias e mantenha o cardapio pronto para publicar."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="products"
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Ver dashboard
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Ver categorias
          </Link>
          <Link
            href={`/${restaurant.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Ver vitrine
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
        </div>
      }
    >
      {statusMessage ? (
        <div className="mb-6 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[30px] border border-zinc-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] md:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">
            Catalogo principal
          </p>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-zinc-950 md:text-[2.1rem]">
                {selectedCategory
                  ? `Categoria: ${selectedCategory}`
                  : "Todos os produtos do menu"}
              </h2>
              <p className="mt-3 text-[15px] leading-8 text-zinc-500">
                {selectedCategorySummary
                  ? `${selectedCategorySummary.count} itens nesta categoria, com ${selectedCategorySummary.availableCount} publicados e ${selectedCategorySummary.featuredCount} em destaque.`
                  : "Revise rapidamente o que esta publicado, o que merece destaque e quais grupos concentram mais produtos."}
              </p>
            </div>

            <div className="rounded-[22px] border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
              {products.length} itens cadastrados
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <MetricCard
              label="Itens totais"
              value={`${products.length}`}
              detail="base completa do menu"
            />
            <MetricCard
              label="Publicados"
              value={`${availableCount}`}
              detail="visiveis ao cliente"
            />
            <MetricCard
              label="Destaques"
              value={`${featuredCount}`}
              detail="com mais evidencia"
            />
            <MetricCard
              label="Ticket medio"
              value={formatBRL(averagePrice)}
              detail="media do catalogo"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <CategoryFilterChip
              href={buildProductsHref({ category: "", q: searchQuery })}
              label="Todas"
              count={products.length}
              active={!selectedCategory}
            />

            {sortedCategorySummaries.map((item) => (
              <CategoryFilterChip
                key={item.name}
                href={buildProductsHref({
                  category: item.name,
                  q: searchQuery,
                })}
                label={item.name}
                count={item.count}
                active={selectedCategory === item.name}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Nova categoria
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              Cadastre categorias antes mesmo de criar os produtos, para deixar
              o menu organizado desde o primeiro item.
            </p>

            <CategoryForm
              action={createCategoryAction}
              redirectTo="/admin/products"
            />
          </section>

          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Categorias do sistema
            </p>

            <div className="mt-4 space-y-3">
              {sortedCategorySummaries.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
                  Cadastre produtos para montar a leitura de categorias.
                </div>
              ) : (
                sortedCategorySummaries
                  .slice(0, 6)
                  .map((categoryItem) => (
                    <CategorySummaryRow
                      key={categoryItem.name}
                      category={categoryItem}
                    />
                  ))
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Proximos modulos
            </p>

            <div className="mt-4 space-y-3">
              <RoadmapCard
                title="Complementos"
                detail="Estrutura pronta para acompanhar adicionais e extras do cardapio."
              />
              <RoadmapCard
                title="Opcoes"
                detail="Base pensada para suportar escolhas por tamanho, sabores e variacoes."
              />
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-6 rounded-[30px] border border-zinc-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Produtos
            </p>
            <h3 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-zinc-950">
              {selectedCategory
                ? `Itens de ${selectedCategory}`
                : "Itens para acompanhar"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-zinc-500">
              Busca simples por nome, categoria, badge ou descricao.
            </p>
          </div>

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
              className="w-full min-w-0 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400 lg:w-72"
            />
            {selectedCategory ? (
              <input type="hidden" name="category" value={selectedCategory} />
            ) : null}
          </form>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="px-5 py-6 md:px-6">
            <div className="rounded-[20px] border border-dashed border-zinc-300 bg-zinc-50 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Sem resultado
              </p>
              <h4 className="mt-3 text-[1.2rem] font-semibold tracking-tight text-zinc-950">
                {products.length === 0
                  ? "Seu catalogo ainda nao tem itens"
                  : "Nenhum produto encontrado nesta busca"}
              </h4>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                {products.length === 0
                  ? "Cadastre os primeiros produtos para começar a operar o menu por aqui."
                  : "Ajuste a busca ou troque a categoria para ampliar a leitura do catalogo."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 px-5 py-5 md:px-6 md:py-6 xl:grid-cols-2">
            {sortedProducts.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}

function getStatusMessage(status?: string) {
  if (status === "category-created") {
    return "Categoria cadastrada com sucesso.";
  }

  if (status === "created") {
    return "Produto cadastrado com sucesso.";
  }

  if (status === "updated") {
    return "Produto atualizado com sucesso.";
  }

  if (status === "deleted") {
    return "Produto removido do catalogo.";
  }

  if (status === "missing") {
    return "O produto solicitado nao foi encontrado.";
  }

  return null;
}

function buildProductsHref({
  category,
  q,
}: {
  category: string;
  q: string;
}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (q) {
    params.set("q", q);
  }

  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
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
    <div className="rounded-[22px] border border-zinc-200 bg-zinc-50 px-4 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-[1.3rem] font-semibold tracking-tight text-zinc-950">
        {value}
      </div>
      <div className="mt-1 text-sm text-zinc-500">{detail}</div>
    </div>
  );
}

function CategoryFilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
        active
          ? "border-violet-200 bg-violet-50 text-violet-700"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
          active ? "bg-white text-violet-700" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function CategorySummaryRow({
  category,
}: {
  category: AdminCategorySummary;
}) {
  const publishedRatio =
    category.count > 0
      ? Math.round((category.availableCount / category.count) * 100)
      : 0;

  return (
    <div className="rounded-[20px] border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">
            {category.name}
          </div>
          <div className="mt-1 text-sm text-zinc-500">
            {category.count} itens e {category.featuredCount} destaque(s)
          </div>
        </div>

        <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-zinc-700">
          {publishedRatio}%
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full bg-white">
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,#8b5cf6_0%,#a78bfa_100%)]"
          style={{ width: `${publishedRatio}%` }}
        />
      </div>
    </div>
  );
}

function RoadmapCard({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[20px] border border-zinc-200 bg-zinc-50 p-4">
      <div className="inline-flex rounded-2xl bg-violet-100 p-2 text-violet-600">
        <Sparkles className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{detail}</p>
    </div>
  );
}

function CatalogProductCard({
  product,
}: {
  product: Product;
}) {
  const isAvailable = Boolean(product.isAvailable);
  const hasLocalImage = Boolean(product.image?.startsWith("/"));

  return (
    <article className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-[82px] w-full shrink-0 overflow-hidden rounded-[18px] bg-zinc-100 sm:w-[82px]">
          {hasLocalImage ? (
            <Image
              src={product.image!}
              alt={product.name}
              fill
              sizes="82px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f0ece4_0%,#ece8ff_100%)] text-[1rem] font-semibold text-zinc-500">
              {getProductFallback(product.name)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
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

              <h4 className="mt-2 text-[1rem] font-semibold tracking-tight text-zinc-950">
                {product.name}
              </h4>
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

          <div className="mt-3 flex flex-col gap-3 border-t border-zinc-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[1.05rem] font-semibold text-emerald-700">
                {formatBRL(product.price)}
              </span>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600">
                #{product.id}
              </span>
            </div>

            <Link
              href={`/admin/products/${product.id}/edit`}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100"
            >
              <SquarePen className="h-4 w-4" />
              Editar
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
