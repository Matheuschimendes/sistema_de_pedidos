"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
  Tags,
  X,
} from "lucide-react";

export type AdminSection =
  | "categories"
  | "dashboard"
  | "orders"
  | "products"
  | "sales";

type AdminShellFrameProps = {
  title: string;
  description: string;
  restaurantName: string;
  restaurantSlug?: string;
  userName: string;
  children: ReactNode;
  actions?: ReactNode;
  currentSection: AdminSection;
  logoutAction: () => Promise<void>;
};

const DESKTOP_BREAKPOINT = 1280;
const SIDEBAR_STORAGE_KEY = "admin-shell-sidebar-collapsed";

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
    href: "/admin/orders",
    label: "Pedidos",
    icon: ClipboardList,
    section: "orders",
  },
  {
    href: "/admin/products",
    label: "Produtos",
    icon: Package,
    section: "products",
  },
  {
    href: "/admin/sales",
    label: "Vendas",
    icon: BarChart3,
    section: "sales",
  },
  {
    href: "/admin/categories",
    label: "Categorias",
    icon: Tags,
    section: "categories",
  },
];

export function AdminShellFrame({
  title,
  description,
  restaurantName,
  restaurantSlug,
  userName,
  children,
  actions,
  currentSection,
  logoutAction,
}: AdminShellFrameProps) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      isDesktopCollapsed ? "true" : "false",
    );
  }, [isDesktopCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeSection =
    navItems.find((item) => item.section === currentSection)?.label ?? "Painel";

  const toggleSidebar = () => {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
      setIsDesktopCollapsed((currentValue) => !currentValue);
      return;
    }

    setIsMobileSidebarOpen((currentValue) => !currentValue);
  };

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const shellGridClassName = isDesktopCollapsed
    ? "xl:grid-cols-[96px_minmax(0,1fr)] 2xl:grid-cols-[104px_minmax(0,1fr)]"
    : "xl:grid-cols-[272px_minmax(0,1fr)] 2xl:grid-cols-[288px_minmax(0,1fr)]";
  const shouldHideDesktopLabels = isDesktopCollapsed;

  return (
    <div
      className={`page-shell min-h-screen overflow-x-clip text-[var(--brand-text)] xl:grid ${shellGridClassName}`}
    >
      <button
        type="button"
        aria-label="Fechar menu lateral"
        className={`fixed inset-0 z-40 bg-slate-950/35 transition xl:hidden ${
          isMobileSidebarOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[292px] max-w-[calc(100vw-20px)] border-r border-[var(--brand-border)]/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,251,255,0.98)_100%)] shadow-[0_28px_60px_rgba(0,0,0,0.12)] transition-transform duration-300 xl:sticky xl:top-0 xl:z-auto xl:max-h-screen xl:w-auto xl:max-w-none xl:shadow-[inset_-1px_0_0_rgba(213,213,213,0.65)] ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${shouldHideDesktopLabels ? "xl:overflow-hidden" : "xl:overflow-y-auto"} xl:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div
            className={`border-b border-zinc-200/80 px-5 py-5 ${
              shouldHideDesktopLabels ? "xl:px-3 xl:py-4" : "xl:px-5 xl:py-6"
            }`}
          >
            <div
              className={`flex items-start gap-3 ${
                shouldHideDesktopLabels ? "xl:justify-center" : "justify-between"
              }`}
            >
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-3 ${
                  shouldHideDesktopLabels ? "xl:justify-center" : ""
                }`}
                onClick={closeMobileSidebar}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] shadow-[0_10px_26px_rgba(0,115,230,0.16)]">
                  <Store className="h-5 w-5" />
                </div>

                <div className={shouldHideDesktopLabels ? "xl:hidden" : ""}>
                  <p className="text-[1rem] font-semibold tracking-tight text-[var(--brand-ink)]">
                    Sistema Admin
                  </p>
                  <p className="text-sm text-zinc-500">Operação do restaurante</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={closeMobileSidebar}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--brand-border)] bg-white text-zinc-700 shadow-[0_10px_24px_rgba(0,0,0,0.06)] xl:hidden"
                aria-label="Fechar menu lateral"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className={`mt-5 rounded-[24px] border border-[var(--brand-border)]/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_14px_30px_rgba(0,0,0,0.05)] ${
                shouldHideDesktopLabels
                  ? "p-3 xl:flex xl:flex-col xl:items-center"
                  : "p-4"
              }`}
            >
              <div
                className={`flex items-start gap-3 ${
                  shouldHideDesktopLabels
                    ? "xl:flex-col xl:items-center xl:text-center"
                    : "justify-between"
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-zinc-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                  {getInitials(restaurantName)}
                </div>

                <span className="font-ui-mono inline-flex items-center gap-2 rounded-full border border-[var(--border-status-open)] bg-[var(--brand-status-open)] px-3 py-1 text-[10px] uppercase tracking-[0.02em] text-[var(--status-open-ink)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--brand-success)]" />
                  {shouldHideDesktopLabels ? (
                    <span className="xl:hidden">Online</span>
                  ) : (
                    "Online"
                  )}
                </span>
              </div>

              <div
                className={`${
                  shouldHideDesktopLabels ? "mt-3 text-center xl:hidden" : "mt-4"
                }`}
              >
                <p className="text-sm font-semibold text-zinc-950">
                  {restaurantName}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{userName}</p>
              </div>
            </div>
          </div>

          <div
            className={`flex-1 ${
              shouldHideDesktopLabels ? "px-3 py-4 xl:px-3" : "px-4 py-5 xl:px-5 xl:py-5"
            }`}
          >
            <p
              className={`font-ui-mono px-2 text-[10px] uppercase tracking-[0.02em] text-[var(--brand-primary)] ${
                shouldHideDesktopLabels ? "xl:hidden" : ""
              }`}
            >
              Navegacao
            </p>

            <nav className={`mt-4 ${shouldHideDesktopLabels ? "space-y-2" : "space-y-1.5"}`}>
              {navItems.map(({ href, label, icon: Icon, section }) => {
                const isActive = currentSection === section;

                return (
                  <Link
                    key={href}
                    href={href}
                    title={label}
                    onClick={closeMobileSidebar}
                    className={getAdminNavButtonClass(
                      section,
                      isActive,
                      shouldHideDesktopLabels,
                    )}
                  >
                    <span
                      className={getAdminNavIconClass(
                        section,
                        isActive,
                        shouldHideDesktopLabels,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={shouldHideDesktopLabels ? "xl:hidden" : ""}>
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div
              className={`mt-5 rounded-[24px] border border-[var(--brand-border)]/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.05)] ${
                shouldHideDesktopLabels ? "xl:hidden" : ""
              }`}
            >
              <p className="font-ui-mono text-[10px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
                Acesso rapido
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Acompanhe a vitrine publica e volte rapido para o fluxo interno
                quando precisar ajustar menu, pedidos, preco ou disponibilidade.
              </p>

              <div className="mt-4 space-y-2">
                {restaurantSlug ? (
                  <SidebarLink
                    href={`/${restaurantSlug}`}
                    label="Abrir vitrine"
                    tone="storefront"
                    onNavigate={closeMobileSidebar}
                  />
                ) : null}
                <SidebarLink
                  href="/"
                  label="Voltar para o site"
                  tone="site"
                  onNavigate={closeMobileSidebar}
                />
              </div>
            </div>
          </div>

          <div
            className={`border-t border-[var(--brand-border)]/80 ${
              shouldHideDesktopLabels ? "px-3 py-4 xl:px-3" : "px-4 py-5 xl:px-5 xl:py-5"
            }`}
          >
            <div
              className={`rounded-[22px] border border-[var(--brand-border)]/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_12px_28px_rgba(0,0,0,0.05)] ${
                shouldHideDesktopLabels ? "p-3 xl:hidden" : "px-4 py-3"
              }`}
            >
              <p className="font-ui-mono text-[10px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
                Secao atual
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--brand-ink)]">
                {activeSection}
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {description}
              </p>
            </div>

            <form action={logoutAction} className="mt-3">
              <button
                type="submit"
                title="Sair do painel"
                className={`inline-flex w-full items-center justify-center gap-2 border border-[var(--brand-danger)]/18 bg-[var(--brand-danger-soft)] text-sm font-semibold text-[var(--brand-danger-ink)] transition hover:border-[var(--brand-danger)]/28 hover:bg-[var(--brand-danger-soft)] ${
                  shouldHideDesktopLabels
                    ? "rounded-2xl px-3 py-3 xl:h-11 xl:w-full xl:px-0"
                    : "rounded-full px-4 py-3"
                }`}
              >
                <LogOut className="h-4 w-4" />
                <span className={shouldHideDesktopLabels ? "xl:hidden" : ""}>
                  Sair do painel
                </span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-[var(--brand-border)]/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,251,255,0.94)_100%)] backdrop-blur xl:sticky xl:top-0 xl:z-20">
          <div className="px-4 py-3 md:px-6 xl:px-6 2xl:px-8">
            <div className="flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(320px,auto)] xl:items-center xl:gap-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--brand-border)] bg-white text-zinc-700 shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition hover:bg-zinc-50"
                  aria-label={
                    isDesktopCollapsed ? "Abrir menu lateral" : "Fechar menu lateral"
                  }
                >
                  {isMobileSidebarOpen ? (
                    <X className="h-4 w-4 xl:hidden" />
                  ) : (
                    <Menu className="h-4 w-4 xl:hidden" />
                  )}
                  {isDesktopCollapsed ? (
                    <PanelLeftOpen className="hidden h-4 w-4 xl:block" />
                  ) : (
                    <PanelLeftClose className="hidden h-4 w-4 xl:block" />
                  )}
                </button>

                <div>
                  <p className="font-ui-mono text-[10px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
                    {activeSection}
                  </p>
                  <h1 className="mt-1 text-[1.22rem] font-semibold tracking-tight text-[var(--brand-ink)] md:text-[1.38rem] 2xl:text-[1.5rem]">
                    {title}
                  </h1>
                  <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-zinc-500 2xl:block">
                    {description}
                  </p>
                </div>
              </div>

              {actions ? (
                <div className="min-w-0 xl:w-full xl:max-w-[760px] xl:justify-self-end">
                  <div className="rounded-[18px] border border-[var(--brand-border)]/80 bg-white/80 p-1 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
                    <div className="overflow-x-auto">
                      <div className="min-w-max">{actions}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {!actions ? (
                <div className="hidden xl:block" />
              ) : null}
            </div>
          </div>
        </header>

        <main className="px-4 py-4 md:px-6 md:py-5 xl:px-6 2xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  tone,
  onNavigate,
}: {
  href: string;
  label: string;
  tone: "site" | "storefront";
  onNavigate: () => void;
}) {
  return (
    <Link href={href} className={getSidebarLinkClass(tone)} onClick={onNavigate}>
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

function getAdminNavButtonClass(
  _section: AdminSection,
  isActive: boolean,
  isCompact: boolean,
) {
  const baseClassName = isCompact
    ? "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition xl:justify-center xl:px-0"
    : "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition";

  return `${baseClassName} ${
    isActive
      ? "border border-[var(--brand-primary)]/18 bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
      : "text-zinc-600 hover:bg-white hover:text-[var(--brand-ink)]"
  }`;
}

function getAdminNavIconClass(
  section: AdminSection,
  isActive: boolean,
  isCompact: boolean,
) {
  const baseClassName = isCompact
    ? "inline-flex h-9 w-9 items-center justify-center rounded-full"
    : "inline-flex h-8 w-8 items-center justify-center rounded-full";

  switch (section) {
    case "dashboard":
      return `${baseClassName} ${
        isActive
          ? "bg-[var(--brand-primary)] text-white"
          : "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
      }`;
    case "orders":
      return `${baseClassName} ${
        isActive
          ? "bg-[var(--brand-primary)] text-white"
          : "bg-[var(--brand-accent-soft)] text-[var(--brand-accent-ink)]"
      }`;
    case "products":
      return `${baseClassName} ${
        isActive
          ? "bg-[var(--brand-primary)] text-white"
          : "bg-[var(--brand-success-soft)] text-[var(--brand-success-ink)]"
      }`;
    case "sales":
      return `${baseClassName} ${
        isActive
          ? "bg-[var(--brand-primary)] text-white"
          : "bg-indigo-100 text-indigo-700"
      }`;
    case "categories":
      return `${baseClassName} ${
        isActive
          ? "bg-[var(--brand-primary)] text-white"
          : "border border-[var(--brand-border)] bg-white text-zinc-600"
      }`;
  }
}

function getSidebarLinkClass(tone: "site" | "storefront") {
  const baseClassName =
    "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition";

  switch (tone) {
    case "storefront":
      return `${baseClassName} border-[var(--brand-primary)]/18 bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/28 hover:bg-[var(--brand-primary-soft)]`;
    case "site":
      return `${baseClassName} border-[rgba(0,0,0,0.9)] bg-white text-[var(--brand-ink)] hover:bg-black/[0.03]`;
  }
}
