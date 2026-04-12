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
      title="Produtos"
      description="Cadastro de itens do catalogo."
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      userName={session.name}
      currentSection="products"
      actions={
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          Voltar
        </Link>
      }
    >
      <ProductForm
        title="Cadastro de produto"
        description="Preencha os campos para cadastrar um novo item no catalogo."
        categories={categories}
        action={createProductAction}
        submitLabel="Salvar"
        cancelHref="/admin/products"
      />
    </AdminShell>
  );
}
