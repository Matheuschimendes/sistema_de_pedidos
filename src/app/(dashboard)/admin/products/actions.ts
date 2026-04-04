"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { prisma } from "@/src/lib/prisma";
import {
  parseCategoryFormData,
  parseProductFormData,
  type CategoryFormState,
  type ProductFormState,
} from "@/src/lib/product-validation";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function revalidateProductPaths(slug: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/products");
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/checkout`);
}

function resolveCategoryRedirectTo(formData: FormData) {
  const redirectTo = formData.get("redirectTo");

  if (
    redirectTo === "/admin/categories" ||
    redirectTo === "/admin/products"
  ) {
    return redirectTo;
  }

  return "/admin/categories";
}

async function getAdminRestaurantContext() {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const restaurant =
    session.restaurant?.id === restaurantId
      ? session.restaurant
      : await prisma.restaurant.findUnique({
          where: { id: restaurantId },
        });

  if (!restaurant) {
    throw new Error("Restaurante nao encontrado.");
  }

  return {
    restaurantId,
    restaurantSlug: restaurant.slug,
  };
}

async function ensureCategoryExists(restaurantId: string, categoryName: string) {
  const trimmedName = categoryName.trim();

  if (!trimmedName) {
    return;
  }

  await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId,
        name: trimmedName,
      },
    },
    update: {},
    create: {
      restaurantId,
      name: trimmedName,
    },
  });
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const { restaurantId, restaurantSlug } = await getAdminRestaurantContext();
  const redirectTo = resolveCategoryRedirectTo(formData);
  const validatedFields = parseCategoryFormData(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Revise o nome da categoria e tente novamente.",
    };
  }

  const categoryName = validatedFields.data.name;
  const existingCategory = await prisma.category.findUnique({
    where: {
      restaurantId_name: {
        restaurantId,
        name: categoryName,
      },
    },
  });

  if (existingCategory) {
    return {
      message: "Essa categoria ja esta cadastrada no sistema.",
    };
  }

  await prisma.category.create({
    data: {
      restaurantId,
      name: categoryName,
    },
  });

  revalidateProductPaths(restaurantSlug);
  redirect(`${redirectTo}?status=category-created`);
}

export async function deleteCategoryAction(categoryId: string) {
  const { restaurantId, restaurantSlug } = await getAdminRestaurantContext();
  const existingCategory = await prisma.category.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
  });

  if (!existingCategory) {
    redirect("/admin/categories?status=category-missing");
  }

  const linkedProductsCount = await prisma.product.count({
    where: {
      restaurantId,
      category: existingCategory.name,
    },
  });

  if (linkedProductsCount > 0) {
    redirect("/admin/categories?status=category-in-use");
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  revalidateProductPaths(restaurantSlug);
  redirect("/admin/categories?status=category-deleted");
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { restaurantId, restaurantSlug } = await getAdminRestaurantContext();
  const validatedFields = parseProductFormData(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Revise os dados do produto e tente novamente.",
    };
  }

  try {
    await ensureCategoryExists(restaurantId, validatedFields.data.category);

    await prisma.product.create({
      data: {
        restaurantId,
        name: validatedFields.data.name,
        description: validatedFields.data.description,
        price: validatedFields.data.price,
        imageUrl: validatedFields.data.image,
        category: validatedFields.data.category,
        additionalInfo: validatedFields.data.additionalInfo,
        isAvailable: validatedFields.data.isAvailable,
        badge: validatedFields.data.badge,
        featured: validatedFields.data.featured,
        emoji: validatedFields.data.emoji,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        message:
          "Ja existe um produto com esse nome nessa categoria. Edite o item existente ou altere o nome.",
      };
    }

    throw error;
  }

  revalidateProductPaths(restaurantSlug);
  redirect("/admin/products?status=created");
}

export async function updateProductAction(
  productId: number,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { restaurantId, restaurantSlug } = await getAdminRestaurantContext();
  const validatedFields = parseProductFormData(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Revise os dados do produto e tente novamente.",
    };
  }

  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      restaurantId,
    },
  });

  if (!existingProduct) {
    return {
      message: "Produto nao encontrado para edicao.",
    };
  }

  try {
    await ensureCategoryExists(restaurantId, validatedFields.data.category);

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
        price: validatedFields.data.price,
        imageUrl: validatedFields.data.image,
        category: validatedFields.data.category,
        additionalInfo: validatedFields.data.additionalInfo,
        isAvailable: validatedFields.data.isAvailable,
        badge: validatedFields.data.badge,
        featured: validatedFields.data.featured,
        emoji: validatedFields.data.emoji,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        message:
          "Ja existe um produto com esse nome nessa categoria. Edite o item existente ou altere o nome.",
      };
    }

    throw error;
  }

  revalidateProductPaths(restaurantSlug);
  redirect("/admin/products?status=updated");
}

export async function deleteProductAction(productId: number) {
  const { restaurantId, restaurantSlug } = await getAdminRestaurantContext();
  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      restaurantId,
    },
  });

  if (!existingProduct) {
    redirect("/admin/products?status=missing");
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidateProductPaths(restaurantSlug);
  redirect("/admin/products?status=deleted");
}
