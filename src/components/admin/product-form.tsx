"use client";

import Link from "next/link";
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
    <form action={formAction} className="space-y-6">
      <section className="rounded-[30px] border border-zinc-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] md:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">
          Dados principais
        </p>
        <div className="mt-3 max-w-2xl">
          <h2 className="text-[1.45rem] font-semibold tracking-tight text-zinc-950">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-7 text-zinc-500">{description}</p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FieldWrapper label="Nome" error={state?.errors?.name?.[0]}>
            <input
              name="name"
              defaultValue={product?.name ?? ""}
              required
              className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-950 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="Ex.: Heineken Long Neck"
            />
          </FieldWrapper>

          <FieldWrapper label="Categoria" error={state?.errors?.category?.[0]}>
            <input
              name="category"
              list="product-categories"
              defaultValue={product?.category ?? ""}
              required
              className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-950 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="Ex.: Cervejas"
            />
            <datalist id="product-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <p className="mt-2 text-sm text-zinc-500">
              Use uma categoria existente ou{" "}
              <Link
                href="/admin/categories"
                className="font-semibold text-violet-700 transition hover:text-violet-800"
              >
                cadastre uma nova categoria
              </Link>
              .
            </p>
          </FieldWrapper>
        </div>

        <div className="mt-5">
          <FieldWrapper
            label="Descricao"
            error={state?.errors?.description?.[0]}
          >
            <textarea
              name="description"
              defaultValue={product?.description ?? ""}
              required
              rows={4}
              className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-950 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="Explique o produto de forma clara para o cliente."
            />
          </FieldWrapper>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FieldWrapper label="Preco" error={state?.errors?.price?.[0]}>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product ? product.price.toFixed(2) : ""}
              required
              className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-950 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="0.00"
            />
          </FieldWrapper>

          <FieldWrapper label="Imagem" error={state?.errors?.image?.[0]}>
            <input
              name="image"
              defaultValue={product?.image ?? ""}
              required
              className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-950 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="https://... ou /products/item.svg"
            />
          </FieldWrapper>
        </div>
      </section>

      <section className="rounded-[30px] border border-zinc-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] md:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Apresentacao
        </p>

        <div className="mt-5">
          <FieldWrapper
            label="Informacoes adicionais"
            error={state?.errors?.additionalInfo?.[0]}
          >
            <textarea
              name="additionalInfo"
              defaultValue={product?.additionalInfo ?? ""}
              rows={3}
              className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-950 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="Ex.: lata 350ml, acompanha gelo, sugestao de consumo..."
            />
          </FieldWrapper>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FieldWrapper label="Selo curto" error={state?.errors?.badge?.[0]}>
            <input
              name="badge"
              defaultValue={product?.badge ?? ""}
              className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-950 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="Ex.: Combo"
            />
          </FieldWrapper>

          <FieldWrapper label="Emoji" error={state?.errors?.emoji?.[0]}>
            <input
              name="emoji"
              defaultValue={product?.emoji ?? ""}
              className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-950 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="Ex.: 🍺"
            />
          </FieldWrapper>
        </div>
      </section>

      <section className="rounded-[30px] border border-zinc-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] md:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Publicacao
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
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
            description="Mantem o item em evidencia no cardapio e nas listas principais."
          />
        </div>
      </section>

      {state?.message ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
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
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
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
    <label className="flex cursor-pointer items-start gap-3 rounded-[22px] border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-200"
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
