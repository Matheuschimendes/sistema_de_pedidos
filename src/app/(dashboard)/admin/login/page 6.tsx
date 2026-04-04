import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import { LoginForm } from "@/src/components/admin/login-form";
import { redirectIfAuthenticated } from "@/src/lib/admin-auth";

const heroFeatures: Array<{
  icon: LucideIcon;
  title: string;
  detail: string;
}> = [
  {
    icon: Store,
    title: "Catalogo centralizado",
    detail: "Produtos, categorias e disponibilidade no mesmo painel.",
  },
  {
    icon: Zap,
    title: "Publicacao rapida",
    detail: "O que muda no admin reflete rapido na vitrine publica.",
  },
  {
    icon: ShieldCheck,
    title: "Acesso interno",
    detail: "Entrada protegida para a operacao do restaurante.",
  },
];

const previewStats = [
  {
    value: "42",
    label: "itens ativos",
  },
  {
    value: "8",
    label: "categorias",
  },
  {
    value: "12",
    label: "destaques",
  },
];

const previewCategories = [
  "Combos com maior saida",
  "Bebidas organizadas por tipo",
  "Produtos pausados fora da vitrine",
];

const loginPills = ["Dashboard", "Produtos", "Publicacao"];

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <section className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#171726_0%,#1d1b37_48%,#0f172a_100%)] px-6 py-6 text-white md:px-10 md:py-8 lg:px-14 lg:py-12">
          <div
            aria-hidden
            className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:84px_84px]"
          />
          <div
            aria-hidden
            className="absolute left-[-5rem] top-[10%] h-56 w-56 rounded-full bg-violet-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute bottom-[-4rem] right-[6%] h-64 w-64 rounded-full bg-emerald-400/14 blur-3xl"
          />

          <div className="relative flex h-full min-h-[38rem] flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Painel interno
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Ver vitrine publica
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-violet-200/80">
                Login do sistema
              </p>
              <h1 className="font-admin-display mt-4 text-[clamp(2.9rem,7vw,5.8rem)] leading-[0.95] text-white">
                Seu cardapio organizado em um painel so.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/72">
                Entre para acompanhar categorias, revisar produtos, ajustar
                publicacao e manter a operacao do menu fluindo sem excesso de
                tela ou ruido.
              </p>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-[32px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                      Preview do painel
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Visao rapida da operacao
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    Menu online
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {previewStats.map((item) => (
                    <PreviewStat key={item.label} {...item} />
                  ))}
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-[#121826]/80 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    O que voce acompanha aqui
                  </p>

                  <div className="mt-4 space-y-3">
                    {previewCategories.map((item) => (
                      <PreviewRow key={item} text={item} />
                    ))}
                  </div>
                </div>
              </section>

              <div className="space-y-4">
                {heroFeatures.map(({ icon, title, detail }) => (
                  <HeroFeatureCard
                    key={title}
                    icon={icon}
                    title={title}
                    detail={detail}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[linear-gradient(180deg,#f5f6f8_0%,#f3f4f6_100%)] px-6 py-10 md:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-[480px]">
            <div className="rounded-[34px] border border-zinc-200 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600">
                  <Store className="h-3.5 w-3.5" />
                  Servido Admin
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  SaaS de cardapio
                </div>
              </div>

              <div className="mt-6 h-1.5 w-24 rounded-full bg-violet-600" />

              <h2 className="mt-6 text-[1.95rem] font-semibold tracking-tight text-zinc-950 md:text-[2.15rem]">
                Acesse sua conta
              </h2>

              <p className="mt-4 text-sm leading-7 text-zinc-500">
                Entre com as credenciais do administrador para acompanhar o
                menu, revisar o catalogo e seguir com a operacao em um unico
                ambiente.
              </p>

              <div className="mt-6 grid gap-3 rounded-[24px] bg-zinc-50 p-4 sm:grid-cols-3">
                {loginPills.map((pill) => (
                  <LoginPill key={pill} label={pill} />
                ))}
              </div>

              <LoginForm />
            </div>

            <div className="mt-5 rounded-[24px] border border-zinc-200 bg-white px-5 py-4 text-sm leading-7 text-zinc-500 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
              Credenciais iniciais em{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[12px] text-zinc-800">
                SEED_ADMIN_EMAIL
              </code>{" "}
              e{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[12px] text-zinc-800">
                SEED_ADMIN_PASSWORD
              </code>
              .
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function PreviewStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4">
      <p className="text-[1.5rem] font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/58">
        {label}
      </p>
    </div>
  );
}

function PreviewRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/6 px-4 py-3 text-sm text-white/72">
      <span className="h-2 w-2 rounded-full bg-violet-300" />
      <span>{text}</span>
    </div>
  );
}

function HeroFeatureCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
      <div className="inline-flex rounded-2xl border border-violet-300/20 bg-violet-400/15 p-2.5 text-violet-100">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="mt-4 text-sm font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-white/68">{detail}</p>
    </article>
  );
}

function LoginPill({ label }: { label: string }) {
  return (
    <div className="rounded-[18px] border border-violet-100 bg-white px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
      {label}
    </div>
  );
}
