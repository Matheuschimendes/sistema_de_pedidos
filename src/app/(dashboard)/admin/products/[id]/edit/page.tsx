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
import {
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
  const [restaurant, products, product] = await Promise.all([
    getRestaurantForAdmin(restaurantId),
    getAdminProducts(restaurantId),
    getAdminProductById(productId, restaurantId),
  ]);

  if (!restaurant || !product) {
    notFound();
  }

  return (
    <AdminShell
      title={`Editar ${product.name}`}
      description="Atualize os dados do produto sem perder a conexão com o cardapio publico."
      restaurantName={restaurant.name}
      userName={session.name}
      currentSection="products"
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-full border border-zinc-950/8 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-950/14"
          >
            Voltar para produtos
          </Link>
          <form action={deleteProductAction.bind(null, product.id)}>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Excluir produto
            </button>
          </form>
        </div>
      }
    >
      <ProductForm
        title="Editar dados do produto"
        description="As alteracoes ficam disponiveis no cardapio assim que o formulario for salvo."
        categories={getExistingCategories(products)}
        action={updateProductAction.bind(null, product.id)}
        product={product}
        submitLabel="Salvar alteracoes"
      />
    </AdminShell>
  );
}
