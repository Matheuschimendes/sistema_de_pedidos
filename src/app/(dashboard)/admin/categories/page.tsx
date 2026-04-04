import Link from "next/link";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { CategoryForm } from "@/src/components/admin/category-form";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/src/app/(dashboard)/admin/products/actions";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import {
  buildAdminCategorySummaries,
  getAdminCategories,
  getAdminProducts,
  getRestaurantForAdmin,
} from "@/src/lib/menu-data";
import { AdminCategorySummary } from "@/src/types/menu";

type PageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AdminCategoriesPage({
  searchParams,
}: PageProps) {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [{ status }, restaurant, products, registeredCategories] =
    await Promise.all([
      searchParams,
      getRestaurantForAdmin(restaurantId),
      getAdminProducts(restaurantId),
      getAdminCategories(restaurantId),
    ]);

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  const categorySummaries = buildAdminCategorySummaries(
    products,
    registeredCategories.map((category) => category.name),
  );
  const registeredCategoryByName = new Map(
    registeredCategories.map((category) => [category.name, category.id]),
  );
  const categoriesWithProducts = categorySummaries.filter(
    (category) => category.count > 0,
  ).length;
  const emptyCategories = categorySummaries.filter(
    (category) => category.count === 0,
  ).length;
  const categoriesWithFeaturedProducts = categorySummaries.filter(
    (category) => category.featuredCount > 0,
  ).length;
  const statusFeedback = getStatusFeedback(status);

  return (
    <AdminShell
      title="Categorias"
      description="Cadastre e acompanhe os grupos do menu para manter os produtos organizados desde a criacao."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="categories"
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Gerenciar produtos
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
          <Link
            href={`/${restaurant.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Ver vitrine
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      }
    >
      {statusFeedback ? (
        <div
          className={`mb-6 rounded-[24px] border px-4 py-3 text-sm font-medium ${
            statusFeedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {statusFeedback.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-[30px] border border-zinc-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] md:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">
            Estrutura do menu
          </p>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-zinc-950 md:text-[2.1rem]">
                Categorias cadastradas
              </h2>
              <p className="mt-3 text-[15px] leading-8 text-zinc-500">
                Crie categorias primeiro e depois vincule os produtos certos a
                cada grupo para deixar a navegacao do cardapio mais clara.
              </p>
            </div>

            <div className="rounded-[22px] border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
              {categorySummaries.length} categorias no sistema
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <MetricCard
              label="Categorias"
              value={`${categorySummaries.length}`}
              detail="grupos cadastrados"
            />
            <MetricCard
              label="Com produtos"
              value={`${categoriesWithProducts}`}
              detail="ja em operacao"
            />
            <MetricCard
              label="Sem itens"
              value={`${emptyCategories}`}
              detail="prontas para uso"
            />
            <MetricCard
              label="Com destaque"
              value={`${categoriesWithFeaturedProducts}`}
              detail="com itens em evidencia"
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Nova categoria
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              Cadastre a estrutura do menu antes mesmo de preencher o
              catalogo.
            </p>

            <CategoryForm
              action={createCategoryAction}
              redirectTo="/admin/categories"
            />
          </section>

          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Boas praticas
            </p>

            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-500">
              <p>Use nomes curtos e claros, como Drinks ou Petiscos.</p>
              <p>Evite criar categorias duplicadas com variacoes pequenas.</p>
              <p>Depois de cadastrar, vincule os produtos pela tela de edicao.</p>
              <p>Para excluir, a categoria precisa estar sem produtos vinculados.</p>
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-6 rounded-[30px] border border-zinc-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
        <div className="border-b border-zinc-200 px-5 py-5 md:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Lista de categorias
          </p>
          <h3 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-zinc-950">
            Categorias disponiveis para o menu
          </h3>
          <p className="mt-2 text-sm leading-7 text-zinc-500">
            Veja quais categorias ja estao ocupadas e quais ainda esperam os
            primeiros produtos.
          </p>
        </div>

        {categorySummaries.length === 0 ? (
          <div className="px-5 py-6 md:px-6">
            <div className="rounded-[20px] border border-dashed border-zinc-300 bg-zinc-50 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Sem categorias
              </p>
              <h4 className="mt-3 text-[1.2rem] font-semibold tracking-tight text-zinc-950">
                O sistema ainda nao tem categorias cadastradas
              </h4>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Crie a primeira categoria para organizar os produtos do menu com
                mais clareza.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 px-5 py-5 md:px-6 md:py-6 xl:grid-cols-2">
            {categorySummaries.map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                categoryId={registeredCategoryByName.get(category.name)}
              />
            ))}
          </div>
        )}
      </section>
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

function CategoryCard({
  category,
  categoryId,
}: {
  category: AdminCategorySummary;
  categoryId?: string;
}) {
  const canDelete = Boolean(categoryId) && category.count === 0;

  return (
    <article className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[1rem] font-semibold tracking-tight text-zinc-950">
            {category.name}
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            {category.count > 0
              ? `${category.count} itens cadastrados nessa categoria.`
              : "Categoria pronta para receber os primeiros produtos."}
          </p>
        </div>

        <div className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-700">
          {category.count}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Ativos" value={`${category.availableCount}`} />
        <MiniStat label="Destaques" value={`${category.featuredCount}`} />
        <MiniStat
          label="Status"
          value={category.count > 0 ? "Em uso" : "Livre"}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {category.count > 0
            ? "Remova ou troque os produtos dessa categoria antes de excluir."
            : "Categoria pronta para exclusao."}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={buildProductsHref(category.name)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Ver produtos
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          {categoryId ? (
            <form action={deleteCategoryAction.bind(null, categoryId)}>
              <button
                type="submit"
                disabled={!canDelete}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  canDelete
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function getStatusFeedback(status?: string) {
  if (status === "category-created") {
    return {
      tone: "success" as const,
      message: "Categoria cadastrada com sucesso.",
    };
  }

  if (status === "category-deleted") {
    return {
      tone: "success" as const,
      message: "Categoria excluida com sucesso.",
    };
  }

  if (status === "category-in-use") {
    return {
      tone: "error" as const,
      message:
        "Nao foi possivel excluir a categoria porque ainda existem produtos vinculados a ela.",
    };
  }

  if (status === "category-missing") {
    return {
      tone: "error" as const,
      message: "A categoria solicitada nao foi encontrada.",
    };
  }

  return null;
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-zinc-200 bg-white px-3 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-zinc-950">{value}</div>
    </div>
  );
}

function buildProductsHref(category: string) {
  const params = new URLSearchParams();
  params.set("category", category);
  return `/admin/products?${params.toString()}`;
}
