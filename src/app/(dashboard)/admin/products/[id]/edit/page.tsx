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
      title="Produtos"
      description="Edicao de item do catalogo."
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
            Voltar
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
      <ProductForm
        title={`Cadastro de produto: ${product.name}`}
        description="Atualize os campos do item e salve para refletir no catalogo."
        categories={categories}
        action={updateProductAction.bind(null, product.id)}
        product={product}
        submitLabel="Salvar"
        cancelHref="/admin/products"
      />
    </AdminShell>
  );
}
