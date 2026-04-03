"use server";

import { redirect } from "next/navigation";
import { createAdminSession, clearAdminSession } from "@/src/lib/admin-auth";
import { prisma } from "@/src/lib/prisma";
import {
  adminLoginSchema,
  type AdminLoginFormState,
} from "@/src/lib/product-validation";
import { verifyPassword } from "@/src/lib/password";

export async function loginAdmin(
  _prevState: AdminLoginFormState,
  formData: FormData,
): Promise<AdminLoginFormState> {
  const validatedFields = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Confira os dados e tente novamente.",
    };
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: validatedFields.data.email.toLowerCase() },
  });

  if (!user || !verifyPassword(validatedFields.data.password, user.passwordHash)) {
    return {
      message: "Credenciais invalidas.",
    };
  }

  await createAdminSession(user.id);
  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
