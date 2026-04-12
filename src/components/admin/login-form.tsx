"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAdmin } from "@/src/app/(dashboard)/admin/login/actions";

const initialState = undefined;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-7 space-y-3.5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[13px] font-medium text-zinc-700"
        >
          E-mail
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          className="w-full rounded-[8px] border border-zinc-300 bg-white px-3.5 py-2 text-[14px] text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-4 focus:ring-sky-100"
          required
        />

        {state?.errors?.email ? (
          <p className="mt-1.5 text-xs text-red-600">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[13px] font-medium text-zinc-700"
        >
          Senha
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="w-full rounded-[8px] border border-zinc-300 bg-[#f7f7f8] px-3.5 py-2 pr-11 text-[14px] text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-4 focus:ring-sky-100"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-full px-2 text-zinc-500 transition hover:text-zinc-800"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {state?.errors?.password ? (
          <p className="mt-1.5 text-xs text-red-600">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      {state?.message ? (
        <div className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-[13px] font-semibold text-[#1688e8] hover:underline">
          Esqueci a senha
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-[8px] bg-[var(--brand-primary)] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[var(--brand-primary-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[138px] sm:w-auto"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </form>
  );
}
