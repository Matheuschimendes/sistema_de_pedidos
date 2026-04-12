import Link from "next/link";
import { LoginForm } from "@/src/components/admin/login-form";
import { redirectIfAuthenticated } from "@/src/lib/admin-auth";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="min-h-screen bg-[#c9dceb]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1360px] items-center px-3 py-5 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 lg:grid-cols-[minmax(360px,500px)_minmax(0,1fr)] lg:gap-7">
          <section className="rounded-[28px] border border-black/10 bg-[#f2f2f3] px-5 py-5 shadow-[0_16px_42px_rgba(37,68,94,0.14)] sm:px-6 sm:py-6">
            <div className="flex min-h-[540px] flex-col">

              <header className="mt-5 text-center">
                <h1 className="text-[clamp(1.8rem,3.4vw,2.55rem)] font-medium leading-none tracking-tight text-zinc-900">
                  Login
                </h1>
                <p className="mt-2 text-[16px] text-zinc-700">
                  Sem conta?{" "}
                  <Link href="/" className="font-semibold text-[#1688e8] hover:underline">
                    Criar acesso
                  </Link>
                </p>
              </header>

              <LoginForm />

              <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6 text-[15px] text-zinc-700">
                <p>
                  Idioma: Portugues <span className="text-zinc-500">v</span>
                </p>
                <Link href="/" className="transition hover:text-zinc-950">
                  Termos de uso
                </Link>
              </footer>
            </div>
          </section>

          <section className="relative hidden overflow-hidden rounded-[28px] border border-white/55 bg-[linear-gradient(180deg,#cfe1ee_0%,#c5d9ea_100%)] px-6 py-6 lg:flex lg:flex-col lg:items-center item-center">
            <div className="relative z-10 mt-1 text-center">
              
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
