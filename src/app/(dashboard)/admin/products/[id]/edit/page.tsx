import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { ProductForm } from "@/src/components/admin/product-form";
import {
  deleteProductAction,
  updateProductAction,
} from "@/src/app/(dashboard)/admin/products/actions";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { formatBRL } from "@/src/lib/format";
import {
  getAdminCategories,
  getAdminProductById,
  getAdminProducts,
  getExistingCategories,
  getRestaurantForAdmin,
} from "@/src/lib/menu-data";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isFinite(productId)) {
    notFound();
  }

  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [restaurant, products, product, registeredCategories] = await Promise.all([
    getRestaurantForAdmin(restaurantId),
    getAdminProducts(restaurantId),
    getAdminProductById(productId, restaurantId),
    getAdminCategories(restaurantId),
  ]);

  if (!restaurant || !product) {
    notFound();
  }

  const categories = getExistingCategories(
    products,
    registeredCategories.map((category) => category.name),
  );

  return (
    <AdminShell
      title={`Editar ${product.name}`}
      description="Atualize os dados do produto e mantenha a vitrine sincronizada com a operacao."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="products"
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Voltar para produtos
          </Link>
          <form action={deleteProductAction.bind(null, product.id)}>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Excluir produto
            </button>
          </form>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <ProductForm
            title="Editar dados do produto"
            description="As alteracoes ficam disponiveis no cardapio assim que o formulario for salvo."
            categories={categories}
            action={updateProductAction.bind(null, product.id)}
            product={product}
            submitLabel="Salvar alteracoes"
          />
        </div>

        <aside className="space-y-6">
          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Resumo do item
            </p>

            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-500">
              <InfoRow label="Categoria" value={product.category} />
              <InfoRow label="Preco" value={formatBRL(product.price)} />
              <InfoRow
                label="Status"
                value={product.isAvailable ? "Ativo" : "Oculto"}
              />
              <InfoRow
                label="Destaque"
                value={product.featured ? "Ligado" : "Desligado"}
              />
            </div>
          </section>

          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Edicao segura
            </p>

            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-500">
              <p>Revise categoria, preco e imagem antes de salvar.</p>
              <p>Se ocultar o item, ele sai da vitrine publica.</p>
              <p>Use destaque apenas nos produtos que merecem mais visibilidade.</p>
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      {label}: <span className="font-semibold text-zinc-900">{value}</span>
    </div>
  );
}
