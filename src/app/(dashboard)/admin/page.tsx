import { redirect } from "next/navigation";
import { getAdminSession } from "@/src/lib/admin-auth";

export default async function AdminEntryPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}
