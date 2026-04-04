import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ShieldCheck, Sparkles, Store, Zap } from "lucide-react";
import { LoginForm } from "@/src/components/admin/login-form";
import { redirectIfAuthenticated } from "@/src/lib/admin-auth";

const heroRibbons = [
  "menu em sintonia",
  "acesso direto",
  "sem perder o ritmo",
];

const heroFeatures: Array<{
  icon: LucideIcon;
  title: string;
  detail: string;
}> = [
  {
    icon: Store,
    title: "Catalogo vivo",
    detail: "Itens, categorias e disponibilidade no mesmo fluxo de operacao.",
  },
  {
    icon: Zap,
    title: "Publicacao agil",
    detail: "Ajustou no admin, refletiu rapido na vitrine publica.",
  },
  {
    icon: ShieldCheck,
    title: "Entrada segura",
    detail: "Validacao no servidor para proteger o ambiente interno.",
  },
];

const loginPills = ["Dashboard", "Produtos", "Publicacao"];

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="min-h-screen bg-[#f6f6f7]">
      <section className="grid min-h-screen lg:grid-cols-[1.18fr_0.82fr]">
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#171726_0%,#1d1b37_52%,#26164c_100%)] px-6 py-6 text-white md:px-10 md:py-8 lg:px-14 lg:py-12">
          <div
            aria-hidden
            className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:82px_82px]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(180deg,transparent_0_56px,rgba(139,92,246,0.2)_56px_64px)]"
          />
          <div
            aria-hidden
            className="absolute left-[-5rem] top-[12%] h-56 w-56 rounded-full bg-violet-500/24 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute bottom-[-4rem] right-[6%] h-64 w-64 rounded-full bg-emerald-400/14 blur-3xl"
          />

          <div className="relative flex h-full min-h-[36rem] flex-col justify-between">
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

            <div className="max-w-2xl py-12 md:py-16">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-white text-violet-600 shadow-[0_18px_42px_rgba(7,15,30,0.35)] md:h-20 md:w-20">
                  <Sparkles className="h-8 w-8 md:h-9 md:w-9" />
                </div>

                <h1 className="font-admin-display text-[clamp(3.3rem,8vw,6.7rem)] leading-none text-violet-200">
                  Painel
                </h1>
              </div>

              <div className="mt-6 space-y-3">
                {heroRibbons.map((text) => (
                  <HeroRibbon key={text} text={text} />
                ))}
              </div>

              <p className="mt-8 max-w-xl text-base leading-8 text-white/74 md:text-[1.02rem]">
                Uma entrada dividida em duas partes: a esquerda, contexto do
                produto e clima de operacao; a direita, o acesso rapido para
                abrir dashboard, revisar o catalogo e publicar mudancas sem
                ruido.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
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
        </section>

        <section className="flex items-center bg-[linear-gradient(180deg,#f6f6f7_0%,#f3f4f6_100%)] px-6 py-10 md:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-[470px]">
            <div className="rounded-[34px] border border-zinc-200 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600">
                  <Store className="h-3.5 w-3.5" />
                  Servido Admin
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Painel online
                </div>
              </div>

              <div className="mt-6 h-1.5 w-24 rounded-full bg-violet-600" />

              <h2 className="mt-6 text-center text-[1.95rem] font-semibold uppercase tracking-[0.06em] text-zinc-950 md:text-[2.15rem]">
                Acesse sua conta
              </h2>

              <p className="mt-4 text-center text-sm leading-7 text-zinc-500">
                Entre com as credenciais do administrador para acompanhar o
                menu e seguir com a operacao em um unico ambiente.
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

function HeroRibbon({ text }: { text: string }) {
  return (
    <div className="inline-flex max-w-full items-center rounded-[6px] border border-violet-300/30 bg-[linear-gradient(90deg,#8b5cf6_0%,#7c3aed_100%)] px-5 py-2 text-[clamp(1.85rem,4vw,3.45rem)] font-medium leading-none tracking-[-0.05em] text-white shadow-[0_12px_28px_rgba(91,33,182,0.28)]">
      <span className="truncate">{text}</span>
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
    <article className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
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
