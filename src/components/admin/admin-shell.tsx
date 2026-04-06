import type { ReactNode } from "react";
import { logoutAdmin } from "@/src/app/(dashboard)/admin/login/actions";
import { AdminOrderNotifier } from "@/src/components/admin/admin-order-notifier";
import {
  AdminSection,
  AdminShellFrame,
} from "@/src/components/admin/admin-shell-frame";

type AdminShellProps = {
  title: string;
  description: string;
  restaurantName: string;
  restaurantSlug?: string;
  userName: string;
  children: ReactNode;
  actions?: ReactNode;
  currentSection?: AdminSection;
};

export function AdminShell({
  title,
  description,
  restaurantName,
  restaurantSlug,
  userName,
  children,
  actions,
  currentSection = "dashboard",
}: AdminShellProps) {
  return (
    <>
      <AdminOrderNotifier
        key={currentSection === "orders" ? "disabled" : "enabled"}
        enabled={currentSection !== "orders"}
      />

      <AdminShellFrame
        title={title}
        description={description}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
        userName={userName}
        actions={actions}
        currentSection={currentSection}
        logoutAction={logoutAdmin}
      >
        {children}
      </AdminShellFrame>
    </>
  );
}
