import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Package,
  ShoppingBag,
  Star,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { menuCategories, menuProducts } from "@/src/data/menu-products";
import { getRestaurants } from "@/src/data/restaurants";
import { formatBRL } from "@/src/lib/format";
import { getRestaurantBusinessStatus } from "@/src/lib/get-restaurant-business-status";

type MockVariant = "dashboard" | "products" | "orders" | "reports";

const navigationItems = [
  { href: "#beneficios", label: "Beneficios" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#faq", label: "FAQ" },
];

const moduleItems = [
  { icon: Store, label: "Cardapio" },
  { icon: ShoppingBag, label: "Pedidos" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: CreditCard, label: "Checkout" },
  { icon: Package, label: "Produtos" },
  { icon: BarChart3, label: "Relatorios" },
];

const benefitCards = [
  {
    icon: ShoppingBag,
    title: "Controle de pedidos",
    description: "Receba, acompanhe e organize cada pedido em um fluxo simples.",
  },
  {
    icon: Package,
    title: "Cadastro rapido",
    description: "Atualize produtos, categorias e destaques sem complicacao.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp integrado",
    description: "Continue o atendimento com mais contexto e menos retrabalho.",
  },
  {
    icon: BarChart3,
    title: "Relatorios claros",
    description: "Veja o que vende mais e tome decisoes com rapidez.",
  },
];

const showcaseItems = [
  {
    eyebrow: "Painel de controle",
    title: "Tenha a operacao da loja em uma visao clara.",
    description:
      "Um painel simples para acompanhar pedidos, cardapio e os numeros principais do dia.",
    bullets: [
      "Visao geral da operacao",
      "Indicadores essenciais",
      "Acesso rapido as principais areas",
    ],
    variant: "dashboard" as MockVariant,
  },
  {
    eyebrow: "Cadastro de produtos",
    title: "Atualize o catalogo em poucos cliques.",
    description:
      "Organize categorias, destaque os itens mais fortes e mantenha a vitrine sempre atualizada.",
    bullets: [
      "Categorias bem organizadas",
      "Precos e destaques editaveis",
      "Disponibilidade mais clara",
    ],
    variant: "products" as MockVariant,
  },
  {
    eyebrow: "Pedidos online",
    title: "Receba pedidos com uma jornada mais fluida.",
    description:
      "Do cardapio ao checkout, o cliente entende rapido o que fazer e conclui com menos atrito.",
    bullets: [
      "Carrinho simples de revisar",
      "Entrega e retirada no mesmo fluxo",
      "Resumo pronto para atendimento",
    ],
    variant: "orders" as MockVariant,
  },
  {
    eyebrow: "Relatorios",
    title: "Enxergue o que esta acontecendo no negocio.",
    description:
      "Acompanhe ticket medio, itens fortes e movimentacao da loja em uma leitura objetiva.",
    bullets: [
      "Vendas e ticket medio",
      "Produtos mais relevantes",
      "Base para decisoes mais rapidas",
    ],
    variant: "reports" as MockVariant,
  },
];

const testimonials = [
  {
    quote:
      "Ficou muito mais facil apresentar o catalogo e receber pedidos sem confusao.",
    author: "Camila Yamada",
    role: "Loja piloto",
  },
  {
    quote:
      "A interface passa mais confianca e ajuda o cliente a entender rapido o produto.",
    author: "Lucas Fernandes",
    role: "Operacao local",
  },
  {
    quote:
      "O fluxo no celular ficou limpo e o time ganhou mais clareza no atendimento.",
    author: "Marina Costa",
    role: "Delivery regional",
  },
];

const faqItems = [
  {
    question: "Posso testar o sistema sem configuracao complexa?",
    answer:
      "Sim. A landing leva para rotas reais do projeto e mostra a experiencia do produto de forma imediata.",
  },
  {
    question: "A pagina foi pensada para conversao?",
    answer:
      "Sim. A estrutura reforca beneficios, repete CTA ao longo da pagina e organiza melhor a narrativa comercial.",
  },
  {
    question: "O layout funciona bem no celular?",
    answer:
      "Sim. A pagina foi organizada em abordagem mobile-first com blocos claros, espacamento generoso e leitura rapida.",
  },
  {
    question: "Da para evoluir essa base depois?",
    answer:
      "Da. A composicao foi pensada para crescer com mais modulos, mais provas sociais e novas integracoes.",
  },
];

export default async function HomePage() {
  await connection();

  const now = new Date();
  const restaurants = getRestaurants().map((restaurant) => ({
    ...restaurant,
    businessStatus: getRestaurantBusinessStatus(restaurant, now),
  }));

  const primaryRestaurant = restaurants[0];
  const categories = menuCategories.filter((category) => category !== "Todos");
  const featuredProducts = menuProducts.filter((product) => product.featured);
  const previewProducts = featuredProducts.slice(0, 3);
  const avgTicket =
    menuProducts.length > 0
      ? menuProducts.reduce((sum, product) => sum + product.price, 0) /
        menuProducts.length
      : 0;
  const heroCtaHref = primaryRestaurant ? `/${primaryRestaurant.slug}` : "/admin";
  const averageRating = primaryRestaurant?.rating?.toFixed(1) ?? "4.8";
  const totalReviews = primaryRestaurant?.reviewCount ?? 0;

  return (
    <main className="min-h-screen bg-[#e9f1f7] text-[var(--brand-ink)]">
      <header className="sticky top-0 z-40 border-b border-[#c7d8e7] bg-[#eef5fb]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1220px] items-center justify-between gap-4 px-5 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1688E8] shadow-[0_12px_24px_rgba(22,136,232,0.2)]">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-[#111827]">
                Sistema de Pedidos
              </div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-[#6B7280]">
                gestao e vendas
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden text-sm font-medium text-[#6B7280] transition hover:text-[#111827] md:inline-flex"
            >
              Entrar
            </Link>
            <PrimaryButton href={heroCtaHref} compact>
              Teste gratis
            </PrimaryButton>
          </div>
        </div>
      </header>

      <section className="overflow-hidden border-b border-[#c7d8e7] bg-[linear-gradient(180deg,#f9fcff_0%,#edf4fa_100%)]">
        <div className="mx-auto grid max-w-[1220px] gap-12 px-5 pb-18 pt-12 md:px-6 md:pb-22 md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D1E6F8] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0F7AD8] shadow-[0_10px_22px_rgba(0,0,0,0.04)]">
              <span className="h-2 w-2 rounded-full bg-[#1688E8]" />
              Teste 14 dias gratis
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[clamp(3rem,7vw,5.4rem)] font-semibold leading-[0.93] tracking-[-0.06em] text-[#111827]">
              Venda mais com seu cardapio digital.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6B7280]">
              Organize pedidos, produtos e atendimento em um sistema moderno,
              simples e pronto para converter visitantes em clientes.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href={heroCtaHref}>Teste gratis</PrimaryButton>
              <SecondaryButton href="#demo">Ver demonstracao</SecondaryButton>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <StatBadge value={averageRating} label="avaliacao media" />
              <StatBadge value={`${totalReviews}+`} label="usuarios satisfeitos" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#6B7280]">
              <TrustItem text="Sem cartao" />
              <TrustItem text="Configuracao rapida" />
              <TrustItem text="Suporte por WhatsApp" />
            </div>
          </div>

          <HeroMockup
            restaurantName={primaryRestaurant?.name ?? "Loja piloto"}
            statusLabel={primaryRestaurant?.businessStatus.label ?? "Online"}
            statusDetail={primaryRestaurant?.businessStatus.detail ?? "Disponivel"}
            deliveryTime={primaryRestaurant?.deliveryTime ?? "20-35 min"}
            categoriesCount={categories.length}
            avgTicket={formatBRL(avgTicket)}
            products={previewProducts}
          />
        </div>
      </section>

      <section className="border-b border-[#c7d8e7] bg-[#f7fbff]">
        <div className="mx-auto max-w-[1220px] px-5 py-5 md:px-6">
          <div className="flex flex-wrap gap-3">
            {moduleItems.map((item) => (
              <ModulePill key={item.label} icon={item.icon} label={item.label} />
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-b border-[#c7d8e7] bg-[#eff5fb]">
        <div className="mx-auto max-w-[1220px] px-5 py-20 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <SectionEyebrow>Beneficios principais</SectionEyebrow>
            <SectionTitle>
              Tudo o que voce precisa para vender com mais clareza.
            </SectionTitle>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#6B7280]">
              A pagina destaca beneficios reais do sistema, com linguagem curta,
              visual limpo e foco em conversao.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefitCards.map((card) => (
              <BenefitCard key={card.title} {...card} />
            ))}
          </div>

          <InlineCta
            className="mt-10"
            title="Comece a testar agora e veja a vitrine funcionando."
            href={heroCtaHref}
            label="Quero testar gratis"
          />
        </div>
      </section>

      <section id="funcionalidades" className="border-b border-[#c7d8e7] bg-[#f8fcff]">
        <div className="mx-auto max-w-[1220px] px-5 py-20 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <SectionEyebrow>Funcionalidades</SectionEyebrow>
            <SectionTitle>
              Recursos pensados para uma operacao mais simples.
            </SectionTitle>
          </div>

          <div className="mt-12 space-y-16">
            {showcaseItems.map((item, index) => (
              <FeatureShowcase
                key={item.title}
                reverse={index % 2 === 1}
                eyebrow={item.eyebrow}
                title={item.title}
                description={item.description}
                bullets={item.bullets}
                variant={item.variant}
                categoriesCount={categories.length}
                featuredCount={featuredProducts.length}
                avgTicket={formatBRL(avgTicket)}
                products={previewProducts}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="border-b border-[#c7d8e7] bg-[#eff5fb]">
        <div className="mx-auto max-w-[1220px] px-5 py-20 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <SectionEyebrow>Demonstracao do sistema</SectionEyebrow>
            <SectionTitle>
              Veja como o produto aparece na pratica.
            </SectionTitle>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#6B7280]">
              Mockups limpos para reforcar a sensacao de produto SaaS real e
              profissional.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <DemoCard
              title="Dashboard"
              subtitle="Visao geral da operacao"
              variant="dashboard"
              categoriesCount={categories.length}
              featuredCount={featuredProducts.length}
              avgTicket={formatBRL(avgTicket)}
              products={previewProducts}
            />
            <DemoCard
              title="Produtos"
              subtitle="Catalogo organizado"
              variant="products"
              categoriesCount={categories.length}
              featuredCount={featuredProducts.length}
              avgTicket={formatBRL(avgTicket)}
              products={previewProducts}
            />
            <DemoCard
              title="Pedidos"
              subtitle="Fluxo mais claro"
              variant="orders"
              categoriesCount={categories.length}
              featuredCount={featuredProducts.length}
              avgTicket={formatBRL(avgTicket)}
              products={previewProducts}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[#c7d8e7] bg-[#f8fcff]">
        <div className="mx-auto max-w-[1220px] px-5 py-20 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <SectionEyebrow>Prova social</SectionEyebrow>
            <SectionTitle>
              Quem usa gosta da rapidez e da clareza do sistema.
            </SectionTitle>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <TestimonialCard key={item.author} {...item} />
            ))}
          </div>

          <InlineCta
            className="mt-10"
            title="Transforme visitantes em usuarios com uma experiencia mais profissional."
            href={heroCtaHref}
            label="Testar agora"
          />
        </div>
      </section>

      <section id="faq" className="border-b border-[#c7d8e7] bg-[#eff5fb]">
        <div className="mx-auto max-w-[1220px] px-5 py-20 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <SectionTitle>
              Perguntas comuns antes de comecar.
            </SectionTitle>
          </div>

          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8fcff]">
        <div className="mx-auto max-w-[1220px] px-5 pb-16 pt-8 md:px-6 md:pb-20">
          <div className="rounded-[14px] border border-[#1d466f]/30 bg-[linear-gradient(160deg,#18395c_0%,#1a4d81_56%,#1688e8_100%)] px-6 py-8 text-white shadow-[0_12px_34px_rgba(17,38,63,0.22)] md:px-8 md:py-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                  CTA final
                </div>
                <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
                  Pronto para vender mais com um sistema mais profissional?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
                  Crie sua conta, teste gratis e veja a diferenca de uma landing
                  clara combinada com um produto bem apresentado.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton href={heroCtaHref}>Comecar agora gratis</PrimaryButton>
                <SecondaryButton href="/admin/dashboard" dark>
                  Ver painel
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PrimaryButton({
  href,
  children,
  compact = false,
}: {
  href: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--brand-primary)] font-semibold text-white transition hover:bg-[var(--brand-primary-strong)] ${
        compact ? "px-4 py-2.5 text-sm" : "px-5 py-3.5 text-base"
      }`}
    >
      {children}
      {!compact ? <ArrowRight className="h-4 w-4" /> : null}
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-[8px] border px-5 py-3.5 text-base font-semibold transition ${
        dark
          ? "border-white/24 bg-white/8 text-white hover:bg-white/14"
          : "border-[#bfd7ea] bg-white text-[var(--brand-ink)] hover:border-[#1688E8]/32 hover:text-[#0F7AD8]"
      }`}
    >
      {children}
    </Link>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F7AD8]">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#111827]">
      {children}
    </h2>
  );
}

function StatBadge({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-[#c7d8e7] bg-white px-4 py-2.5">
      <div className="flex items-center gap-1 text-[#1688E8]">
        <Star className="h-4 w-4 fill-current" />
        <Star className="h-4 w-4 fill-current" />
        <Star className="h-4 w-4 fill-current" />
        <Star className="h-4 w-4 fill-current" />
        <Star className="h-4 w-4 fill-current" />
      </div>
      <div className="text-sm font-semibold text-[#111827]">{value}</div>
      <div className="text-sm text-[#6B7280]">{label}</div>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="rounded-[8px] border border-[#c7d8e7] bg-white px-3 py-2 text-sm text-[#6B7280]">
      {text}
    </div>
  );
}

function HeroMockup({
  restaurantName,
  statusLabel,
  statusDetail,
  deliveryTime,
  categoriesCount,
  avgTicket,
  products,
}: {
  restaurantName: string;
  statusLabel: string;
  statusDetail: string;
  deliveryTime: string;
  categoriesCount: number;
  avgTicket: string;
  products: typeof menuProducts;
}) {
  return (
    <div>
      <div className="rounded-[12px] border border-[#c7d8e7] bg-white p-4 shadow-[0_8px_24px_rgba(28,61,94,0.12)]">
        <div className="rounded-[10px] border border-[#D9E5F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)] p-4">
          <div className="flex items-center justify-between gap-3 border-b border-[#E3EDF6] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF5FF] text-[#1688E8]">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#111827]">
                  {restaurantName}
                </div>
                <div className="text-xs text-[#6B7280]">{statusDetail}</div>
              </div>
            </div>

            <div className="rounded-full bg-[#EAF5FF] px-3 py-1 text-xs font-semibold text-[#0F7AD8]">
              {statusLabel}
            </div>
          </div>

          <div className="mt-4 rounded-[10px] bg-[#1A3554] p-5 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              sistema ao vivo
            </div>
            <div className="mt-2 text-2xl font-semibold leading-tight">
              Pedidos organizados do cardapio ao checkout.
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <PreviewPill
                icon={Truck}
                label="Entrega media"
                value={deliveryTime}
              />
              <PreviewPill
                icon={CreditCard}
                label="Ticket medio"
                value={avgTicket}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-[8px] border border-[#D9E5F0] bg-white px-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#111827]">
                    {product.name}
                  </div>
                  <div className="truncate text-xs text-[#6B7280]">
                    {product.category}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#111827]">
                  {formatBRL(product.price)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniPanel title="Categorias" subtitle={`${categoriesCount} ativas`} />
            <MiniPanel title="Checkout" subtitle="Entrega e retirada" />
            <MiniPanel title="Pagamento" subtitle="Fluxo objetivo" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-white/16 bg-white/8 p-3.5">
      <div className="flex items-center gap-2 text-white/70">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function ProductCardPreview({
  name,
  description,
  price,
}: {
  name: string;
  description: string;
  price: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#D9E5F0] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#111827]">
            {name}
          </div>
          <div className="mt-1 text-sm leading-6 text-[#6B7280]">{description}</div>
        </div>
        <div className="text-sm font-semibold text-[#111827]">{price}</div>
      </div>
    </div>
  );
}

function MiniPanel({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#D9E5F0] bg-white p-3.5">
      <div className="text-sm font-semibold text-[#111827]">{title}</div>
      <div className="mt-1 text-sm text-[#6B7280]">{subtitle}</div>
    </div>
  );
}

function ModulePill({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-[8px] border border-[#D9E5F0] bg-white px-4 py-2 text-sm font-medium text-[#475569]">
      <Icon className="h-4 w-4 text-[#1688E8]" />
      <span>{label}</span>
    </div>
  );
}

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[8px] border border-[#D9E5F0] bg-white p-6">
      <div className="inline-flex rounded-[8px] border border-[#d6e6f4] bg-[#EAF5FF] p-2.5 text-[#1688E8]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[#111827]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#6B7280]">{description}</p>
    </article>
  );
}

function InlineCta({
  title,
  href,
  label,
  className = "",
}: {
  title: string;
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[8px] border border-[#c7d8e7] bg-[#f8fbff] p-6 ${className}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-lg font-semibold text-[#111827]">{title}</div>
        <PrimaryButton href={href}>{label}</PrimaryButton>
      </div>
    </div>
  );
}

function FeatureShowcase({
  reverse,
  eyebrow,
  title,
  description,
  bullets,
  variant,
  categoriesCount,
  featuredCount,
  avgTicket,
  products,
}: {
  reverse: boolean;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  variant: MockVariant;
  categoriesCount: number;
  featuredCount: number;
  avgTicket: string;
  products: typeof menuProducts;
}) {
  return (
    <div
      className={`grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(380px,1.08fr)] lg:items-center ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="max-w-xl">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <SectionTitle>{title}</SectionTitle>
        <p className="mt-4 text-base leading-7 text-[#6B7280]">{description}</p>

        <div className="mt-6 space-y-4">
          {bullets.map((bullet) => (
            <FeatureLine key={bullet} text={bullet} />
          ))}
        </div>
      </div>

      <ShowcaseMock
        variant={variant}
        categoriesCount={categoriesCount}
        featuredCount={featuredCount}
        avgTicket={avgTicket}
        products={products}
      />
    </div>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm leading-7 text-[#111827]">
      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#1688E8]" />
      <span>{text}</span>
    </div>
  );
}

function ShowcaseMock({
  variant,
  categoriesCount,
  featuredCount,
  avgTicket,
  products,
}: {
  variant: MockVariant;
  categoriesCount: number;
  featuredCount: number;
  avgTicket: string;
  products: typeof menuProducts;
}) {
  return (
    <div className="rounded-[8px] border border-[#D9E5F0] bg-[#F4F8FC] p-4">
      <div className="rounded-[8px] border border-[#D9E5F0] bg-white p-4">
        {variant === "dashboard" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniPanel title="Categorias" subtitle={`${categoriesCount}`} />
              <MiniPanel title="Destaques" subtitle={`${featuredCount}`} />
              <MiniPanel title="Ticket" subtitle={avgTicket} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DashboardStat title="Pedidos hoje" value="28" />
              <DashboardStat title="Taxa de conversao" value="18%" />
            </div>
          </div>
        ) : null}

        {variant === "products" ? (
          <div className="space-y-3">
            {products.map((product) => (
              <ProductCardPreview
                key={product.id}
                name={product.name}
                description={product.description}
                price={formatBRL(product.price)}
              />
            ))}
          </div>
        ) : null}

        {variant === "orders" ? (
          <div className="space-y-3">
            <OrderRow title="Pedido #1042" status="Novo" total="R$ 69,90" />
            <OrderRow title="Pedido #1041" status="Em preparo" total="R$ 42,00" />
            <OrderRow title="Pedido #1040" status="Concluido" total="R$ 89,90" />
          </div>
        ) : null}

        {variant === "reports" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniPanel title="Faturamento" subtitle="R$ 4.280" />
              <MiniPanel title="Ticket medio" subtitle={avgTicket} />
              <MiniPanel title="Top item" subtitle="Combo destaque" />
            </div>
            <div className="rounded-[8px] bg-[#F4F8FC] p-4">
              <div className="flex items-end gap-2">
                <Bar height="38%" />
                <Bar height="52%" />
                <Bar height="46%" />
                <Bar height="74%" />
                <Bar height="68%" />
                <Bar height="86%" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DashboardStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#D9E5F0] bg-[#F4F8FC] p-4">
      <div className="text-sm text-[#6B7280]">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111827]">
        {value}
      </div>
    </div>
  );
}

function OrderRow({
  title,
  status,
  total,
}: {
  title: string;
  status: string;
  total: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-[#D9E5F0] bg-white px-4 py-3">
      <div>
        <div className="text-sm font-semibold text-[#111827]">{title}</div>
        <div className="text-xs text-[#6B7280]">{status}</div>
      </div>
      <div className="text-sm font-semibold text-[#111827]">{total}</div>
    </div>
  );
}

function Bar({ height }: { height: string }) {
  return (
    <div className="flex-1 rounded-t-[10px] bg-[#1688E8]" style={{ height }} />
  );
}

function DemoCard({
  title,
  subtitle,
  variant,
  categoriesCount,
  featuredCount,
  avgTicket,
  products,
}: {
  title: string;
  subtitle: string;
  variant: MockVariant;
  categoriesCount: number;
  featuredCount: number;
  avgTicket: string;
  products: typeof menuProducts;
}) {
  return (
    <article className="rounded-[8px] border border-[#D9E5F0] bg-white p-5">
      <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0F7AD8]">
        {title}
      </div>
      <div className="mt-2 text-lg font-semibold text-[#111827]">{subtitle}</div>
      <div className="mt-5">
        <ShowcaseMock
          variant={variant}
          categoriesCount={categoriesCount}
          featuredCount={featuredCount}
          avgTicket={avgTicket}
          products={products.slice(0, 2)}
        />
      </div>
    </article>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <article className="rounded-[8px] border border-[#D9E5F0] bg-white p-6">
      <div className="flex items-center gap-1 text-[#1688E8]">
        <Star className="h-4 w-4 fill-current" />
        <Star className="h-4 w-4 fill-current" />
        <Star className="h-4 w-4 fill-current" />
        <Star className="h-4 w-4 fill-current" />
        <Star className="h-4 w-4 fill-current" />
      </div>
      <p className="mt-4 text-base leading-7 text-[#111827]">&quot;{quote}&quot;</p>
      <div className="mt-5 text-sm font-semibold text-[#111827]">{author}</div>
      <div className="text-sm text-[#6B7280]">{role}</div>
    </article>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-[8px] border border-[#D9E5F0] bg-white p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#111827]">
        {question}
        <span className="text-[#0F7AD8] transition group-open:rotate-45">+</span>
      </summary>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6B7280]">{answer}</p>
    </details>
  );
}
