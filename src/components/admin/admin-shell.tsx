import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  Link2,
  LogOut,
  Package,
  Store,
  User2,
} from "lucide-react";
import { logoutAdmin } from "@/src/app/(dashboard)/admin/login/actions";

type AdminSection = "dashboard" | "products";

type AdminShellProps = {
  title: string;
  description: string;
  restaurantName: string;
  userName: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  currentSection?: AdminSection;
};

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  section: AdminSection;
}> = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "dashboard",
  },
  {
    href: "/admin/products",
    label: "Produtos",
    icon: Package,
    section: "products",
  },
];

export function AdminShell({
  title,
  description,
  restaurantName,
  userName,
  children,
  actions,
  currentSection = "dashboard",
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f6f7] text-zinc-900 md:flex">
      <aside className="w-full border-b border-zinc-200 bg-white md:sticky md:top-0 md:h-screen md:w-[252px] md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-200 px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[1rem] font-black uppercase tracking-tight text-violet-700">
                  Sistema
                </div>
                <div className="text-[0.82rem] font-black uppercase tracking-tight text-zinc-900">
                  de Pedidos
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-700">
                {getInitials(restaurantName)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {restaurantName}
                </p>
                <p className="mt-0.5 truncate text-sm text-zinc-500">{userName}</p>
              </div>

              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Painel online
            </div>

            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          <div className="flex-1 px-4 py-5">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Painel
            </p>

            <nav className="mt-4 space-y-1">
              {navItems.map(({ href, label, icon: Icon, section }) => {
                const isActive = currentSection === section;

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 border-l-[3px] px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "border-violet-500 bg-zinc-50 text-violet-600"
                        : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-zinc-200 px-4 py-5">
            <div className="space-y-2">
              <SidebarUtilityLink
                href="/admin/dashboard"
                label="Duvidas?"
                icon={CircleHelp}
              />
              <SidebarUtilityLink
                href="/admin/products"
                label="Ver meus links"
                icon={Link2}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-3 text-sm font-medium text-zinc-600">
              <User2 className="h-4 w-4" />
              {userName}
            </div>

            <form action={logoutAdmin} className="mt-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="px-5 py-4 md:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-[1.6rem] font-semibold tracking-tight text-zinc-950 md:text-[1.8rem]">
                  {title}
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-7 text-zinc-500 md:text-[15px]">
                  {description}
                </p>
              </div>

              {actions ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {actions}
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="px-4 py-5 md:px-6 md:py-6 xl:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarUtilityLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Package;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 px-1 py-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
    >
      <span className="inline-flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
