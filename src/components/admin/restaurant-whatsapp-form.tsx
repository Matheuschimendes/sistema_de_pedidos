"use client";

import { useActionState } from "react";
import { type RestaurantWhatsappFormState } from "@/src/lib/restaurant-settings-validation";

type RestaurantWhatsappFormProps = {
  action: (
    state: RestaurantWhatsappFormState,
    formData: FormData,
  ) => Promise<RestaurantWhatsappFormState>;
  defaultValue: string;
};

const initialState = undefined;

export function RestaurantWhatsappForm({
  action,
  defaultValue,
}: RestaurantWhatsappFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-3.5">
      <div>
        <label
          htmlFor="restaurant-whatsapp-number"
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400"
        >
          Numero do WhatsApp
        </label>

        <input
          id="restaurant-whatsapp-number"
          name="whatsappNumber"
          type="tel"
          defaultValue={defaultValue}
          required
          placeholder="+55 (85) 99999-9999"
          className="w-full rounded-[18px] border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-950 shadow-[0_10px_24px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Pode digitar com ou sem mascara. O sistema salva o numero pronto para
          abrir a conversa no checkout.
        </p>

        {state?.errors?.whatsappNumber ? (
          <p className="mt-2 text-sm text-red-600">
            {state.errors.whatsappNumber[0]}
          </p>
        ) : null}
      </div>

      {state?.message ? (
        <div
          className={`rounded-[18px] border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-teal-700 bg-[linear-gradient(135deg,#0f766e_0%,#10b981_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Salvando..." : "Salvar numero"}
      </button>
    </form>
  );
}
