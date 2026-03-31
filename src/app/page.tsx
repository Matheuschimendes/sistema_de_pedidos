import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <div className="w-full rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <span className="inline-flex rounded-full bg-[var(--brand-primary-soft)] px-3.5 py-1.5 text-base font-medium text-[var(--brand-primary)]">
            Cardápio digital
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900">
            Faça seu pedido de forma rápida e prática
          </h1>

          <p className="mt-4 max-w-2xl text-xl leading-8 text-zinc-600">
            Escolha seus produtos, adicione ao carrinho e finalize tudo pelo
            celular, com uma experiência mais clara e rápida.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cardapio"
              className="rounded-2xl bg-[var(--brand-primary)] px-6 py-3 text-center font-medium text-white hover:opacity-90"
            >
              Ver cardápio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
