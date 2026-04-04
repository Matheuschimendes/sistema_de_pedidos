"use client";

import { useActionState } from "react";
import { type CategoryFormState } from "@/src/lib/product-validation";

type CategoryFormProps = {
  action: (
    state: CategoryFormState,
    formData: FormData,
  ) => Promise<CategoryFormState>;
  redirectTo?: "/admin/categories" | "/admin/products";
};

const initialState = undefined;

export function CategoryForm({
  action,
  redirectTo = "/admin/categories",
}: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div>
        <label
          htmlFor="category-name"
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400"
        >
          Nome da categoria
        </label>

        <input
          id="category-name"
          name="name"
          placeholder="Ex.: Drinks, Petiscos, Sobremesas"
          className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
          required
        />

        {state?.errors?.name ? (
          <p className="mt-2 text-sm text-red-600">{state.errors.name[0]}</p>
        ) : null}
      </div>

      {state?.message ? (
        <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Salvando..." : "Salvar categoria"}
      </button>
    </form>
  );
}
