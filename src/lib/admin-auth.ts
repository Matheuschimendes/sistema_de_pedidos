import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminSessionCookieName,
  adminSessionMaxAge,
  createAdminSessionValue,
  readAdminSessionValue,
} from "@/src/lib/admin-session";
import { prisma } from "@/src/lib/prisma";

async function findAdminSessionById(userId: string) {
  return prisma.adminUser.findUnique({
    where: { id: userId },
    include: { restaurant: true },
  });
}

export type AdminSession = NonNullable<
  Awaited<ReturnType<typeof findAdminSessionById>>
>;

export async function createAdminSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookieName, createAdminSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAge,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookieName);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(adminSessionCookieName)?.value;
  const payload = readAdminSessionValue(sessionValue);

  if (!payload) {
    return null;
  }

  return findAdminSessionById(payload.userId);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin/dashboard");
  }
}

export async function getAdminRestaurantId(session?: AdminSession) {
  const adminSession = session ?? (await requireAdminSession());

  if (adminSession.restaurantId) {
    return adminSession.restaurantId;
  }

  const restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!restaurant) {
    throw new Error("Nenhum restaurante cadastrado.");
  }

  return restaurant.id;
}
