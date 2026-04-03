"use client";

import { useActionState } from "react";
import { type Product } from "@/src/types/menu";
import { type ProductFormState } from "@/src/lib/product-validation";

type ProductFormProps = {
  title: string;
  description: string;
  categories: string[];
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  product?: Product;
  submitLabel: string;
};

const initialState = undefined;

export function ProductForm({
  title,
  description,
  categories,
  action,
  product,
  submitLabel,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-zinc-950">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-zinc-500">{description}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FieldWrapper label="Nome" error={state?.errors?.name?.[0]}>
          <input
            name="name"
            defaultValue={product?.name ?? ""}
            required
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-[var(--brand-primary)]"
            placeholder="Ex.: Heineken Long Neck"
          />
        </FieldWrapper>

        <FieldWrapper label="Categoria" error={state?.errors?.category?.[0]}>
          <input
            name="category"
            list="product-categories"
            defaultValue={product?.category ?? ""}
            required
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-[var(--brand-primary)]"
            placeholder="Ex.: Cervejas"
          />
          <datalist id="product-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </FieldWrapper>
      </div>

      <FieldWrapper
        label="Descricao"
        error={state?.errors?.description?.[0]}
      >
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          required
          rows={4}
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-[var(--brand-primary)]"
          placeholder="Explique o produto de forma clara para o cliente."
        />
      </FieldWrapper>

      <div className="grid gap-5 md:grid-cols-2">
        <FieldWrapper label="Preco" error={state?.errors?.price?.[0]}>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product ? product.price.toFixed(2) : ""}
            required
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-[var(--brand-primary)]"
            placeholder="0.00"
          />
        </FieldWrapper>

        <FieldWrapper label="Imagem" error={state?.errors?.image?.[0]}>
          <input
            name="image"
            defaultValue={product?.image ?? ""}
            required
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-[var(--brand-primary)]"
            placeholder="https://... ou /products/item.svg"
          />
        </FieldWrapper>
      </div>

      <FieldWrapper
        label="Informacoes adicionais"
        error={state?.errors?.additionalInfo?.[0]}
      >
        <textarea
          name="additionalInfo"
          defaultValue={product?.additionalInfo ?? ""}
          rows={3}
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-[var(--brand-primary)]"
          placeholder="Ex.: lata 350ml, acompanha gelo, sugestao de consumo..."
        />
      </FieldWrapper>

      <div className="grid gap-5 md:grid-cols-2">
        <FieldWrapper label="Selo curto" error={state?.errors?.badge?.[0]}>
          <input
            name="badge"
            defaultValue={product?.badge ?? ""}
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-[var(--brand-primary)]"
            placeholder="Ex.: Combo"
          />
        </FieldWrapper>

        <FieldWrapper label="Emoji" error={state?.errors?.emoji?.[0]}>
          <input
            name="emoji"
            defaultValue={product?.emoji ?? ""}
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-[var(--brand-primary)]"
            placeholder="Ex.: 🍺"
          />
        </FieldWrapper>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ToggleCard
          name="isAvailable"
          defaultChecked={product?.isAvailable ?? true}
          title="Disponivel no cardapio"
          description="Controla se o item aparece para o cliente no cardapio publico."
        />
        <ToggleCard
          name="featured"
          defaultChecked={product?.featured ?? false}
          title="Destacar produto"
          description="Mantem o item em evidência no cardapio e em listas principais."
        />
      </div>

      {state?.message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-6 py-3.5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function FieldWrapper({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </label>
      {children}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function ToggleCard({
  name,
  defaultChecked,
  title,
  description,
}: {
  name: string;
  defaultChecked: boolean;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-zinc-300 text-[var(--brand-primary)]"
      />
      <span>
        <span className="block text-sm font-semibold text-zinc-900">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-zinc-500">
          {description}
        </span>
      </span>
    </label>
  );
}
