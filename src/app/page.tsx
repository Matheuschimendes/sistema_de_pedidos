import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  Clock3,
  LayoutDashboard,
  PackageCheck,
  ShoppingBag,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { menuCategories, menuProducts } from "@/src/data/menu-products";
import { getRestaurants } from "@/src/data/restaurants";
import { formatBRL } from "@/src/lib/format";
import { getRestaurantBusinessStatus } from "@/src/lib/get-restaurant-business-status";

const pillars = [
  {
    icon: ShoppingBag,
    title: "Fluxo público pronto",
    description:
      "Cardápio, categorias, grupos de produtos, carrinho e checkout já conectados.",
  },
  {
    icon: Smartphone,
    title: "Pedido no WhatsApp",
    description:
      "O cliente confirma o pedido no celular com resumo completo e dados de entrega.",
  },
  {
    icon: LayoutDashboard,
    title: "Painel inicial do dono",
    description:
      "O administrador já tem uma visão clara de catálogo, métricas e próximos ajustes.",
  },
];

const steps = [
  "Compartilhe o link do restaurante e deixe o cliente entrar direto no cardápio.",
  "O cliente monta o pedido, escolhe entrega ou retirada e informa os dados.",
  "O restaurante recebe a solicitação pelo WhatsApp e opera o MVP sem integração pesada.",
];

export default async function HomePage() {
  await connection();

  const now = new Date();
  const restaurants = getRestaurants().map((restaurant) => ({
    ...restaurant,
    businessStatus: getRestaurantBusinessStatus(restaurant, now),
  }));
  const primaryRestaurant = restaurants[0];
  const liveCategories = menuCategories.filter(
    (category) => category !== "Todos",
  ).length;
  const featuredProducts = menuProducts.filter((product) => product.featured);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,232,248,0.45),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef4fb_100%)]">
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-8 md:pb-12 md:pt-10">
        <div className="mb-6 flex flex-col gap-3 rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_20px_80px_rgba(8,8,40,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
              Sistema de Pedidos
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              MVP focado em cardápio digital, checkout rápido e operação simples.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryRestaurant ? `/${primaryRestaurant.slug}` : "/admin"}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Abrir cardápio
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            >
              Ver dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-7 shadow-[0_24px_90px_rgba(8,8,40,0.1)] backdrop-blur md:p-10">
            <span className="inline-flex rounded-full border border-[var(--brand-primary)]/10 bg-[var(--brand-primary-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--brand-ink)]">
              MVP pronto para validar com restaurante real
            </span>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">
              Venda pelo celular com uma operação enxuta e fácil de testar.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
              A base já cobre descoberta do restaurante, navegação no cardápio,
              carrinho, checkout e confirmação via WhatsApp. O próximo passo é
              validar com pedidos reais e refinar a operação.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryRestaurant ? (
                <Link
                  href={`/${primaryRestaurant.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-6 py-3.5 text-base font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Acessar restaurante piloto
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}

              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3.5 text-base font-semibold text-zinc-700 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                Entrar na área administrativa
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <HighlightMetric
                label="Restaurantes ativos"
                value={`${restaurants.length}`}
                caption="estrutura pronta para crescer"
              />
              <HighlightMetric
                label="Produtos publicados"
                value={`${menuProducts.length}`}
                caption={`${featuredProducts.length} combos em destaque`}
              />
              <HighlightMetric
                label="Categorias no cardápio"
                value={`${liveCategories}`}
                caption="catálogo organizado para mobile"
              />
            </div>
          </div>

          {primaryRestaurant ? (
            <aside className="overflow-hidden rounded-[32px] border border-[var(--brand-ink)]/20 bg-[linear-gradient(160deg,_rgba(8,8,40,0.98)_0%,_rgba(32,48,73,0.96)_54%,_rgba(88,136,184,0.9)_100%)] p-7 text-white shadow-[0_24px_90px_rgba(8,8,40,0.18)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                <Store className="h-3.5 w-3.5" />
                Operação piloto
              </div>

              <h2 className="mt-5 text-3xl font-semibold">
                {primaryRestaurant.name}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/74">
                {primaryRestaurant.description}
              </p>

              <div className="mt-6 grid gap-3">
                <LiveInfoCard
                  title={primaryRestaurant.businessStatus.label}
                  description={primaryRestaurant.businessStatus.detail}
                  tone={primaryRestaurant.businessStatus.tone}
                  icon={Clock3}
                />
                <LiveInfoCard
                  title={`${primaryRestaurant.rating?.toFixed(1)} estrelas`}
                  description={`${primaryRestaurant.reviewCount} avaliações e fluxo pronto para compartilhamento`}
                  tone="neutral"
                  icon={PackageCheck}
                />
                <LiveInfoCard
                  title={`Entrega ${formatBRL(primaryRestaurant.deliveryFee ?? 0)}`}
                  description={`Previsão média de ${primaryRestaurant.deliveryTime}`}
                  tone="neutral"
                  icon={Truck}
                />
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                  Link pronto para teste
                </div>
                <div className="mt-2 break-all text-sm font-medium text-white">
                  /{primaryRestaurant.slug}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Use esse link para validar descoberta, carrinho e checkout com
                  clientes reais.
                </p>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-4 md:py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(8,8,40,0.08)]"
            >
              <div className="inline-flex rounded-2xl bg-[var(--brand-primary-soft)] p-3 text-[var(--brand-ink)]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-zinc-900">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:py-12">
        <div className="rounded-[32px] border border-white/70 bg-white/85 p-7 shadow-[0_20px_70px_rgba(8,8,40,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            <Store className="h-4 w-4" />
            Restaurante disponível
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            Entrada pública do sistema já conectada ao cardápio real
          </h2>

          <p className="mt-3 max-w-2xl text-base leading-8 text-zinc-600">
            Em vez de uma landing genérica, o MVP agora apresenta a operação do
            restaurante e leva direto para a experiência que o cliente de fato
            vai usar.
          </p>

          <div className="mt-6 grid gap-4">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant.slug}
                className="rounded-[28px] border border-zinc-100 bg-[linear-gradient(180deg,_#ffffff_0%,_rgba(200,232,248,0.18)_100%)] p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xl font-semibold text-zinc-900">
                      {restaurant.name}
                    </div>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-zinc-600">
                      {restaurant.description}
                    </p>
                  </div>

                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      restaurant.businessStatus.tone === "open"
                        ? "bg-[var(--brand-status-open)] text-[var(--status-open-ink)]"
                        : "bg-[var(--status-closed-soft)] text-[var(--status-closed-ink)]"
                    }`}
                  >
                    {restaurant.businessStatus.label}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-500">
                  <span className="rounded-full bg-white px-3 py-1.5">
                    {restaurant.businessStatus.detail}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5">
                    Taxa {formatBRL(restaurant.deliveryFee ?? 0)}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5">
                    {restaurant.deliveryTime}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/${restaurant.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Abrir cardápio
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={`/${restaurant.slug}/checkout`}
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                  >
                    Ver checkout
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[32px] border border-[var(--brand-accent)]/10 bg-[linear-gradient(180deg,_#fffaf2_0%,_#ffffff_100%)] p-7 shadow-[0_20px_70px_rgba(216,136,24,0.08)]">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
            Como o MVP funciona
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            Um fluxo simples, validável e sem depender de integrações pesadas
          </h2>

          <div className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-[24px] border border-white bg-white/85 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-accent-soft)] font-semibold text-[var(--brand-accent-ink)]">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-zinc-600">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] bg-[var(--brand-ink)] p-5 text-white">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Próxima fase
            </div>
            <p className="mt-2 text-sm leading-7 text-white/78">
              Depois da validação inicial, podemos evoluir para autenticação,
              gestão de produtos, painel de pedidos em tempo real e persistência
              em banco.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function HighlightMetric({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-[24px] border border-zinc-100 bg-[linear-gradient(180deg,_#ffffff_0%,_rgba(200,232,248,0.22)_100%)] p-4">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        {value}
      </div>
      <div className="mt-1 text-sm text-zinc-500">{caption}</div>
    </div>
  );
}

function LiveInfoCard({
  title,
  description,
  tone,
  icon: Icon,
}: {
  title: string;
  description: string;
  tone: "open" | "closed" | "neutral";
  icon: typeof Clock3;
}) {
  const accentClassName =
    tone === "open"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-50"
      : tone === "closed"
        ? "border-red-300/20 bg-red-300/10 text-red-50"
        : "border-white/10 bg-white/10 text-white";

  return (
    <div className={`rounded-[24px] border p-4 ${accentClassName}`}>
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-2xl bg-black/15 p-2.5">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-sm leading-6 text-current/75">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}
