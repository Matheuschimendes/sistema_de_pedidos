"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAdmin } from "@/src/app/(dashboard)/admin/login/actions";

const initialState = undefined;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div className="relative pt-3">
        <label
          htmlFor="email"
          className="absolute left-4 top-0 bg-white px-1 text-[11px] font-medium tracking-[0.04em] text-violet-600"
        >
          E-mail *
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          className="w-full rounded-[12px] border border-zinc-200 bg-zinc-50 px-4 py-4 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
          required
        />

        {state?.errors?.email ? (
          <p className="mt-2 text-sm text-red-600">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div className="relative pt-3">
        <label
          htmlFor="password"
          className="absolute left-4 top-0 bg-white px-1 text-[11px] font-medium tracking-[0.04em] text-violet-600"
        >
          Senha *
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            className="w-full rounded-[12px] border border-zinc-200 bg-zinc-50 px-4 py-4 pr-12 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-4 inline-flex items-center text-zinc-500 transition hover:text-violet-600"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {state?.errors?.password ? (
          <p className="mt-2 text-sm text-red-600">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      {state?.message ? (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-[12px] bg-violet-600 px-5 py-4 text-[15px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_16px_36px_rgba(124,58,237,0.24)] transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <div className="pt-1 text-center text-sm font-medium text-violet-600">
        Esqueci minha senha
      </div>

      <div className="rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-4 text-center text-sm leading-7 text-zinc-500">
        Precisa de ajuda? Fale com o administrador da operacao.
      </div>
    </form>
  );
}
