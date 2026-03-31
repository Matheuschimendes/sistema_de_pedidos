import Link from "next/link";

export default function AdminEntryPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-zinc-900 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-semibold">Área Administrativa</h1>
          <p className="mt-3 text-lg leading-8 text-zinc-300">
            Gerencie pedidos, produtos, categorias e o funcionamento do
            restaurante.
          </p>

          <ul className="mt-6 space-y-2.5 text-base text-zinc-300">
            <li>• Controle de pedidos</li>
            <li>• Gestão de produtos</li>
            <li>• Dashboard com métricas</li>
            <li>• Configurações do restaurante</li>
          </ul>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/admin/login"
              className="rounded-2xl bg-[var(--brand-primary)] px-5 py-3 text-center font-medium text-white hover:opacity-90"
            >
              Entrar no sistema
            </Link>

            <Link
              href="/admin/dashboard"
              className="rounded-2xl border border-white/10 px-5 py-3 text-center font-medium text-white hover:bg-white/5"
            >
              Ir para dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-zinc-900">Acesso restrito</h2>
          <p className="mt-3 text-lg leading-8 text-zinc-600">
            Esta área é destinada somente para administradores.
          </p>

          <div className="mt-6 space-y-3 text-base leading-7 text-zinc-500">
            <div className="rounded-2xl bg-zinc-50 p-4">
              O cliente final não vê esta área.
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              O usuário comum acessa apenas o cardápio e o checkout.
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              Depois vamos proteger esta rota com autenticação.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
