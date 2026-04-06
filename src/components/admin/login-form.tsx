"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAdmin } from "@/src/app/(dashboard)/admin/login/actions";

const initialState = undefined;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-zinc-700"
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
          placeholder="voce@restaurante.com"
          className="w-full rounded-[16px] border border-zinc-200 bg-[#fffdfa] px-4 py-3.5 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#5888b8] focus:ring-4 focus:ring-[#d9ecf8]/70"
          required
        />

        {state?.errors?.email ? (
          <p className="mt-2 text-sm text-red-600">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Senha
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            className="w-full rounded-[16px] border border-zinc-200 bg-[#fffdfa] px-4 py-3.5 pr-12 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#5888b8] focus:ring-4 focus:ring-[#d9ecf8]/70"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-3 inline-flex items-center justify-center rounded-full px-2 text-zinc-500 transition hover:text-[#5888b8]"
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
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-[16px] bg-[#080828] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(8,8,40,0.18)] transition hover:bg-[#11143a] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <div className="rounded-[18px] border border-zinc-200/90 bg-[#fcfaf6] px-4 py-4 text-sm leading-7 text-zinc-600">
        Se precisar recuperar o acesso, fale com quem administra a operacao do
        restaurante.
      </div>
    </form>
  );
}
