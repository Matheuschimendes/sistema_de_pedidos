import { redirect } from "next/navigation";
import { AdminShell } from "@/src/components/admin/admin-shell";
import { ProductForm } from "@/src/components/admin/product-form";
import { createProductAction } from "@/src/app/(dashboard)/admin/products/actions";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import {
  getAdminProducts,
  getExistingCategories,
  getRestaurantForAdmin,
} from "@/src/lib/menu-data";

export default async function NewProductPage() {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const [restaurant, products] = await Promise.all([
    getRestaurantForAdmin(restaurantId),
    getAdminProducts(restaurantId),
  ]);

  if (!restaurant) {
    redirect("/admin/products");
  }

  return (
    <AdminShell
      title="Novo produto"
      description="Cadastre um item completo para aparecer automaticamente no cardapio publico."
      restaurantName={restaurant.name}
      userName={session.name}
      currentSection="products"
    >
      <ProductForm
        title="Cadastrar produto"
        description="Preencha os dados principais do item. Assim que salvar, o cardapio ja podera consumir essa informacao."
        categories={getExistingCategories(products)}
        action={createProductAction}
        submitLabel="Salvar produto"
      />
    </AdminShell>
  );
}
