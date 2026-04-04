import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { ProductForm } from "@/src/components/admin/product-form";
import { createProductAction } from "@/src/app/(dashboard)/admin/products/actions";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import {
  getAdminCategories,
  getAdminProducts,
  getExistingCategories,
  getRestaurantForAdmin,
} from "@/src/lib/menu-data";

export default async function NewProductPage() {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [restaurant, products, registeredCategories] = await Promise.all([
    getRestaurantForAdmin(restaurantId),
    getAdminProducts(restaurantId),
    getAdminCategories(restaurantId),
  ]);

  if (!restaurant) {
    redirect("/admin/products");
  }

  const categories = getExistingCategories(
    products,
    registeredCategories.map((category) => category.name),
  );

  return (
    <AdminShell
      title="Novo produto"
      description="Cadastre um item e deixe o cardapio pronto para publicar em poucos passos."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="products"
      actions={
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          Voltar para produtos
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <ProductForm
            title="Cadastrar produto"
            description="Preencha os dados principais do item. Assim que salvar, ele ja podera entrar na operacao do menu."
            categories={categories}
            action={createProductAction}
            submitLabel="Salvar produto"
          />
        </div>

        <aside className="space-y-6">
          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Base atual
            </p>

            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-500">
              <div>
                Itens no menu:{" "}
                <span className="font-semibold text-zinc-900">
                  {products.length}
                </span>
              </div>
              <div>
                Categorias usadas:{" "}
                <span className="font-semibold text-zinc-900">
                  {categories.length}
                </span>
              </div>
              <div>
                Publicacao:{" "}
                <span className="font-semibold text-zinc-900">
                  assim que salvar
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Antes de salvar
            </p>

            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-500">
              <p>Use um nome direto e facil de reconhecer no menu.</p>
              <p>Escolha a categoria certa para manter a navegacao organizada.</p>
              <p>Ative o item so quando ele estiver pronto para aparecer na vitrine.</p>
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
