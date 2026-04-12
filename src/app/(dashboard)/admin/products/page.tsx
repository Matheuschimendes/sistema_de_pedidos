import Image from "next/image";
import Link from "next/link";
import { Columns3, Funnel, Plus, Search, SquarePen } from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { formatBRL } from "@/src/lib/format";
import {
  buildAdminCategorySummaries,
  getAdminCategories,
  getAdminProducts,
  getRestaurantForAdmin,
} from "@/src/lib/menu-data";
import { Product } from "@/src/types/menu";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    category?: string;
    q?: string;
  }>;
};

type ProductsCategoryFilter = "__all__" | "__uncategorized__" | string;

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
  const categorySummaries = buildAdminCategorySummaries(
    products,
    registeredCategories.map((item) => item.name),
  );
  const uncategorizedCount = products.filter(
    (product) => product.category.trim().length === 0,
  ).length;
  const selectedCategory = resolveSelectedCategory(
    category,
    categorySummaries.map((item) => item.name),
    uncategorizedCount,
  );

  const baseProducts =
    selectedCategory === "__all__"
      ? products
      : selectedCategory === "__uncategorized__"
        ? products.filter((product) => product.category.trim().length === 0)
        : products.filter((product) => product.category === selectedCategory);
  const filteredProducts = filterProducts(baseProducts, searchQuery).sort(
    (left, right) =>
      left.name.localeCompare(right.name, "pt-BR") ||
      right.price - left.price ||
      left.id - right.id,
  );

  return (
    <AdminShell
      title={`Produtos (${products.length})`}
      description="Itens, etiquetas e fornecedores."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="products"
    >
      <div className="space-y-4">
        {statusMessage ? (
          <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {statusMessage}
          </div>
        ) : null}

        <section className="rounded-[18px] border border-zinc-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] md:p-5">
          <div className="flex flex-wrap gap-7 border-b border-zinc-200 pb-3">
            <button
              type="button"
              className="border-b-2 border-sky-500 pb-2 text-[1rem] font-semibold text-zinc-950"
            >
              Itens
            </button>
            <button
              type="button"
              className="pb-2 text-[1rem] text-zinc-700 transition hover:text-zinc-950"
            >
              Etiquetas
            </button>
            <button
              type="button"
              className="pb-2 text-[1rem] text-zinc-700 transition hover:text-zinc-950"
            >
              Fornecedores
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <Link
              href="/admin/products/new"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-600"
              aria-label="Cadastrar novo produto"
            >
              <Plus className="h-6 w-6" />
            </Link>

            <form
              action="/admin/products"
              className="flex w-full items-center gap-2 rounded-full border-2 border-zinc-900 bg-white px-5 py-2.5 lg:max-w-[560px]"
            >
              <Search className="h-5 w-5 text-zinc-500" />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Buscar por codigo, EAN/GTIN ou nome"
                className="w-full min-w-0 bg-transparent text-[1.05rem] text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              {selectedCategory !== "__all__" ? (
                <input type="hidden" name="category" value={selectedCategory} />
              ) : null}
            </form>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:bg-zinc-50"
                aria-label="Filtros"
              >
                <Funnel className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:bg-zinc-50"
                aria-label="Visualizacao"
              >
                <Columns3 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
            <aside className="border-b border-zinc-200 pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <nav className="space-y-1.5">
                <CategoryMenuLink
                  href={buildProductsHref({
                    category: "__all__",
                    q: searchQuery,
                  })}
                  label={`Todos (${products.length})`}
                  active={selectedCategory === "__all__"}
                />

                <CategoryMenuLink
                  href={buildProductsHref({
                    category: "__uncategorized__",
                    q: searchQuery,
                  })}
                  label={`Sem categoria (${uncategorizedCount})`}
                  active={selectedCategory === "__uncategorized__"}
                />

                {categorySummaries.map((item) => (
                  <CategoryMenuLink
                    key={item.name}
                    href={buildProductsHref({
                      category: item.name,
                      q: searchQuery,
                    })}
                    label={`${item.name} (${item.count})`}
                    active={selectedCategory === item.name}
                  />
                ))}
              </nav>

              <div className="mt-4 border-t border-zinc-200 pt-4">
                <Link
                  href="/admin/categories"
                  className="text-[1.06rem] font-medium text-zinc-700 transition hover:text-zinc-950"
                >
                  Gerenciar categorias
                </Link>
              </div>
            </aside>

            <section className="overflow-hidden rounded-[12px] border border-zinc-200">
              <div className="overflow-x-auto">
                <table className="min-w-[980px] divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-50 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                    <tr>
                      <th className="w-[90px] px-3 py-2 text-left">Acao</th>
                      <th className="w-[100px] px-3 py-2 text-left">Imagem</th>
                      <th className="px-3 py-2 text-left">Nome</th>
                      <th className="w-[110px] px-3 py-2 text-left">Codigo</th>
                      <th className="px-3 py-2 text-left">Observacoes</th>
                      <th className="w-[150px] px-3 py-2 text-right">Preco de venda</th>
                      <th className="w-[130px] px-3 py-2 text-right">Estoque atual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-3 py-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:bg-zinc-50"
                            aria-label={`Editar ${product.name}`}
                          >
                            <SquarePen className="h-4 w-4" />
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <ProductThumb product={product} />
                        </td>
                        <td className="px-3 py-3">
                          <p className="line-clamp-1 font-medium text-zinc-900">
                            {product.name}
                          </p>
                          <p className="line-clamp-1 text-xs text-zinc-500">
                            {product.category || "Sem categoria"}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-zinc-700">#{product.id}</td>
                        <td className="px-3 py-3 text-zinc-600">
                          <p className="line-clamp-1">
                            {product.additionalInfo || product.description || "--"}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-zinc-900">
                          {formatBRL(product.price)}
                        </td>
                        <td className="px-3 py-3 text-right text-zinc-600">--</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="flex min-h-[440px] items-center justify-center px-4 py-10">
                  <div className="max-w-[500px] text-center">
                    <h3 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-800 md:text-5xl">
                      Hora de cadastrar
                      <br />
                      o seu primeiro produto
                    </h3>
                    <p className="mt-4 text-lg leading-8 text-zinc-500">
                      Cadastrar produtos e facil! Clique e assista o passo a passo
                    </p>
                    <Link
                      href="/admin/products/new"
                      className="mt-7 inline-flex items-center justify-center rounded-full bg-sky-500 px-9 py-3 text-lg font-semibold text-white transition hover:bg-sky-600"
                    >
                      Ver video
                    </Link>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function ProductThumb({ product }: { product: Product }) {
  const hasLocalImage = Boolean(product.image?.startsWith("/"));

  if (hasLocalImage) {
    return (
      <div className="relative h-12 w-12 overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-50">
        <Image
          src={product.image!}
          alt={product.name}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-500">
      {getProductFallback(product.name)}
    </div>
  );
}

function CategoryMenuLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-[10px] px-2.5 py-2 text-[1.06rem] transition ${
        active
          ? "font-semibold text-sky-600"
          : "font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
      }`}
    >
      {label}
    </Link>
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

function resolveSelectedCategory(
  requestedCategory: string | undefined,
  knownCategories: string[],
  uncategorizedCount: number,
): ProductsCategoryFilter {
  if (requestedCategory === "__uncategorized__" && uncategorizedCount > 0) {
    return "__uncategorized__";
  }

  if (
    requestedCategory &&
    requestedCategory !== "__all__" &&
    knownCategories.includes(requestedCategory)
  ) {
    return requestedCategory;
  }

  return "__all__";
}

function buildProductsHref({
  category,
  q,
}: {
  category: ProductsCategoryFilter;
  q: string;
}) {
  const params = new URLSearchParams();

  if (category !== "__all__") {
    params.set("category", category);
  }
  if (q.trim().length > 0) {
    params.set("q", q.trim());
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
      `${product.id}`,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("pt-BR")
      .includes(normalizedQuery),
  );
}

function getProductFallback(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
