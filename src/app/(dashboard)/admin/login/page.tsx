export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Login</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Entre para acessar o painel administrativo
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">E-mail</label>
            <input
              type="email"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none"
              placeholder="admin@mesa.app"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Senha</label>
            <input
              type="password"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[var(--brand-primary)] px-4 py-3 font-medium text-white hover:opacity-90"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
