"use server";

import { revalidatePath } from "next/cache";
import {
  getAdminRestaurantId,
  requireAdminSession,
} from "@/src/lib/admin-auth";
import { prisma } from "@/src/lib/prisma";
import {
  parseRestaurantWhatsappFormData,
  type RestaurantWhatsappFormState,
} from "@/src/lib/restaurant-settings-validation";

function revalidateRestaurantPaths(slug: string) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/checkout`);
}

export async function updateRestaurantWhatsappAction(
  _prevState: RestaurantWhatsappFormState,
  formData: FormData,
): Promise<RestaurantWhatsappFormState> {
  const session = await requireAdminSession();
  const restaurantId = await getAdminRestaurantId(session);
  const validatedFields = parseRestaurantWhatsappFormData(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Revise o numero do WhatsApp e tente novamente.",
      success: false,
    };
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      id: true,
      slug: true,
      whatsappNumber: true,
    },
  });

  if (!restaurant) {
    return {
      message: "Restaurante nao encontrado para atualizar o WhatsApp.",
      success: false,
    };
  }

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      whatsappNumber: validatedFields.data.whatsappNumber,
    },
  });

  revalidateRestaurantPaths(restaurant.slug);

  return {
    message: "WhatsApp da empresa atualizado com sucesso.",
    success: true,
  };
}
