import Link from "next/link";
import {
  ArrowUpRight,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Store,
} from "lucide-react";
import { LoginForm } from "@/src/components/admin/login-form";
import { redirectIfAuthenticated } from "@/src/lib/admin-auth";

const adminHighlights = [
  {
    icon: LayoutDashboard,
    title: "Painel organizado",
    detail: "Acompanhe o que esta no ar e chegue mais rapido nas secoes principais.",
  },
  {
    icon: Package,
    title: "Catalogo no controle",
    detail: "Atualize produtos, categorias e disponibilidade no mesmo fluxo.",
  },
];

const adminSummary = [
  {
    label: "Pedidos",
    value: "Em acompanhamento",
  },
  {
    label: "Produtos",
    value: "Ajuste rapido",
  },
  {
    label: "Publicacao",
    value: "Tudo centralizado",
  },
];

const adminNotes = [
  "Ambiente reservado para a equipe do restaurante.",
  "Acesso com autenticacao protegida no servidor.",
  "Interface pensada para rotina, nao para demonstracao.",
];

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="admin-shell-bg min-h-screen">
      <div className="flex min-h-screen w-full items-center">
        <section className="grid min-h-screen w-full overflow-hidden border border-slate-900/10 bg-white/60 shadow-[0_32px_90px_rgba(15,23,42,0.14)] backdrop-blur-sm lg:grid-cols-[1.03fr_0.97fr]">
          <section className="relative overflow-hidden bg-[linear-gradient(160deg,#080828_0%,#152b48_54%,#5888b8_100%)] px-6 py-8 text-white md:px-10 md:py-10 lg:px-12 lg:py-12">
            <div
              aria-hidden
              className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:84px_84px]"
            />
            <div
              aria-hidden
              className="absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-40 left-[-4rem] h-80 w-80 rounded-full border border-white/10"
            />
            <div
              aria-hidden
              className="absolute -bottom-56 left-6 h-[28rem] w-[28rem] rounded-full border border-white/10"
            />

            <div className="relative flex h-full min-h-[560px] flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3.5 py-2 text-[11px] font-medium text-white/84">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Acesso interno
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/14"
                >
                  Ver vitrine
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-14 max-w-[33rem]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#080828] shadow-[0_14px_30px_rgba(8,8,40,0.2)]">
                    <Store className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Servido Admin
                    </p>
                    <p className="text-sm text-white/58">
                      Gestao do menu e da operacao
                    </p>
                  </div>
                </div>

                <h1 className="mt-8 max-w-[12ch] text-[clamp(2.1rem,4vw,3.15rem)] font-semibold leading-[1.02] tracking-tight text-white">
                  Um login mais claro para a rotina do restaurante.
                </h1>

                <p className="mt-5 max-w-xl text-[0.98rem] leading-8 text-white/72">
                  Rebranding da entrada do painel com um visual mais maduro,
                  menos exibicao e mais foco no uso diario da equipe.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {adminHighlights.map((item) => (
                  <HighlightCard key={item.title} {...item} />
                ))}
              </div>

              <section className="mt-8 rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/72">
                  Ao entrar no painel, voce encontra:
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {adminSummary.map((item) => (
                    <SummaryCard key={item.label} {...item} />
                  ))}
                </div>

                <div className="mt-5 space-y-2.5">
                  {adminNotes.map((note) => (
                    <NoteItem key={note} text={note} />
                  ))}
                </div>
              </section>

              <p className="mt-auto pt-8 text-sm text-white/46">
                Interface interna redesenhada para ficar mais natural, mais
                legivel e mais alinhada ao restante do admin.
              </p>
            </div>
          </section>

          <section className="bg-[linear-gradient(180deg,#fffdfa_0%,#f7f3ec_100%)] px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12">
            <div className="mx-auto flex min-h-full w-full max-w-[470px] flex-col justify-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#c8e8f8_0%,#fff3d6_100%)] text-[#080828] shadow-[0_12px_26px_rgba(15,23,42,0.08)]">
                  <Store className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-lg font-semibold tracking-tight text-[#080828]">
                    Servido
                  </p>
                  <p className="text-sm text-zinc-500">Painel administrativo</p>
                </div>
              </div>

              <div className="mt-12 rounded-[24px] border border-zinc-200/80 bg-white/68 p-4 md:p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-700">
                    Acesso do administrador
                  </p>

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d9ecf8] bg-[#eef7fc] px-3 py-1 text-[11px] font-medium text-[#3d6f9f]">
                    <span className="h-2 w-2 rounded-full bg-[#5888b8]" />
                    Uso interno
                  </div>
                </div>

                <h2 className="mt-5 text-[1.95rem] font-semibold leading-tight tracking-tight text-[#080828]">
                  Entrar no painel
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  Use suas credenciais para acessar a area de gestao do menu,
                  acompanhar a operacao e seguir com as atualizacoes.
                </p>

                <LoginForm />
              </div>

              <div className="mt-6 rounded-[22px] border border-zinc-200/80 bg-white/74 px-4 py-4 text-sm leading-7 text-zinc-600">
                Primeiro acesso? Use{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[12px] text-zinc-900">
                  SEED_ADMIN_EMAIL
                </code>{" "}
                e{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[12px] text-zinc-900">
                  SEED_ADMIN_PASSWORD
                </code>
                .
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function HighlightCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof LayoutDashboard;
  title: string;
  detail: string;
}) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
      <div className="inline-flex rounded-2xl border border-white/12 bg-white/10 p-2.5 text-[#fff3d6]">
        <Icon className="h-4 w-4" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/66">{detail}</p>
    </article>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-slate-950/18 px-4 py-4">
      <p className="text-[11px] font-medium text-white/52">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function NoteItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm text-white/66">
      <span className="mt-2 h-2 w-2 rounded-full bg-[#fff3d6]" />
      <span>{text}</span>
    </div>
  );
}
