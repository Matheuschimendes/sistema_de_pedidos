import Link from "next/link";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  Tags,
} from "lucide-react";
import { logoutAdmin } from "@/src/app/(dashboard)/admin/login/actions";

type AdminSection = "categories" | "dashboard" | "products";

type AdminShellProps = {
  title: string;
  description: string;
  restaurantName: string;
  restaurantSlug?: string;
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
  {
    href: "/admin/categories",
    label: "Categorias",
    icon: Tags,
    section: "categories",
  },
];

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
  const activeSection =
    navItems.find((item) => item.section === currentSection)?.label ?? "Painel";

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-zinc-900 md:grid md:grid-cols-[272px_minmax(0,1fr)]">
      <aside className="border-b border-zinc-200 bg-white md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-200 px-5 py-6">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Store className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[1rem] font-semibold tracking-tight text-zinc-950">
                  Servido Admin
                </p>
                <p className="text-sm text-zinc-500">Painel de cardapio</p>
              </div>
            </Link>

            <div className="mt-5 rounded-[24px] border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-zinc-700 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                  {getInitials(restaurantName)}
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-zinc-950">
                {restaurantName}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{userName}</p>
            </div>
          </div>

          <div className="flex-1 px-4 py-5">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Navegacao
            </p>

            <nav className="mt-4 space-y-1">
              {navItems.map(({ href, label, icon: Icon, section }) => {
                const isActive = currentSection === section;

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-violet-50 text-violet-700"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Acesso rapido
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Acompanhe a vitrine publica e volte rapido para o fluxo interno
                quando precisar ajustar menu, preco ou disponibilidade.
              </p>

              <div className="mt-4 space-y-2">
                {restaurantSlug ? (
                  <SidebarLink
                    href={`/${restaurantSlug}`}
                    label="Abrir vitrine"
                  />
                ) : null}
                <SidebarLink href="/" label="Voltar para o site" />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 px-4 py-5">
            <div className="rounded-[20px] border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Secao atual
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-950">
                {activeSection}
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {description}
              </p>
            </div>

            <form action={logoutAdmin} className="mt-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <LogOut className="h-4 w-4" />
                Sair do painel
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-[#f5f6f8]/95 backdrop-blur">
          <div className="px-4 py-5 md:px-6 xl:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  {activeSection}
                </p>
                <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight text-zinc-950 md:text-[1.9rem]">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-500 md:text-[15px]">
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

function SidebarLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
    >
      <span>{label}</span>
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
