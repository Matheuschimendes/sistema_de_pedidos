"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Camera, ChevronDown, ScanLine, Settings2 } from "lucide-react";
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
  cancelHref?: string;
};

const initialState = undefined;

export function ProductForm({
  title,
  description,
  categories,
  action,
  product,
  submitLabel,
  cancelHref = "/admin/products",
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 pb-28">
      <section className="overflow-hidden rounded-[18px] border border-zinc-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap gap-8 border-b border-zinc-200 px-4 py-3 md:px-6">
          <button
            type="button"
            className="border-b-2 border-sky-500 pb-2 text-[1.04rem] font-semibold text-zinc-950"
          >
            Cadastro
          </button>
          <button
            type="button"
            className="pb-2 text-[1.04rem] font-medium text-zinc-700 transition hover:text-zinc-950"
          >
            Kit/Combo
          </button>
          <button
            type="button"
            className="pb-2 text-[1.04rem] font-medium text-zinc-700 transition hover:text-zinc-950"
          >
            Fornecedores
          </button>
          <button
            type="button"
            className="pb-2 text-[1.04rem] font-medium text-zinc-700 transition hover:text-zinc-950"
          >
            Opcoes
          </button>
        </div>

        <div className="px-4 py-4 md:px-6 md:py-5">
          <div className="mb-5">
            <h2 className="text-[1.2rem] font-semibold tracking-tight text-zinc-950">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px]">
            <div className="space-y-4">
              <FormField
                label="Nome"
                required
                error={state?.errors?.name?.[0]}
                suffix={`${(product?.name ?? "").length} / 100`}
              >
                <input
                  name="name"
                  defaultValue={product?.name ?? ""}
                  required
                  maxLength={100}
                  className={getInputClassName(Boolean(state?.errors?.name?.[0]))}
                  placeholder="Campo obrigatorio"
                />
              </FormField>

              <FormField label="EAN/GTIN">
                <div className="flex items-center gap-2 rounded-[10px] border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-zinc-400">
                  <input
                    disabled
                    className="w-full bg-transparent text-base outline-none"
                    placeholder="Use o leitor ou digite"
                  />
                  <ScanLine className="h-5 w-5 shrink-0 text-zinc-500" />
                </div>
              </FormField>

              <FormField label="Categoria" required error={state?.errors?.category?.[0]}>
                <div className="relative">
                  <input
                    name="category"
                    list="product-categories"
                    defaultValue={product?.category ?? ""}
                    required
                    className={`${getInputClassName(Boolean(state?.errors?.category?.[0]))} pr-10`}
                    placeholder="Selecione uma opcao"
                  />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                </div>
                <datalist id="product-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </FormField>

              <FormField label="Descricao" required error={state?.errors?.description?.[0]}>
                <textarea
                  name="description"
                  defaultValue={product?.description ?? ""}
                  required
                  rows={4}
                  className={getInputClassName(Boolean(state?.errors?.description?.[0]))}
                  placeholder="Descreva o produto para o cliente"
                />
              </FormField>

              <FormField label="Codigo Extra">
                <input
                  disabled
                  className="w-full rounded-[10px] border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-base text-zinc-400 outline-none"
                  placeholder="--"
                />
              </FormField>

              <FormField label="Selo curto" error={state?.errors?.badge?.[0]}>
                <input
                  name="badge"
                  defaultValue={product?.badge ?? ""}
                  className={getInputClassName(Boolean(state?.errors?.badge?.[0]))}
                  placeholder="Ex.: Combo"
                />
              </FormField>

              <FormField label="Emoji" error={state?.errors?.emoji?.[0]}>
                <input
                  name="emoji"
                  defaultValue={product?.emoji ?? ""}
                  className={getInputClassName(Boolean(state?.errors?.emoji?.[0]))}
                  placeholder="Ex.: 🍔"
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <FormField label="Preco de venda" required error={state?.errors?.price?.[0]}>
                <div className="relative">
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product ? product.price.toFixed(2) : ""}
                    required
                    className={`${getInputClassName(Boolean(state?.errors?.price?.[0]))} pr-12`}
                    placeholder="0,00"
                  />
                  <Settings2 className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                </div>
              </FormField>

              <FormField label="URL da imagem" required error={state?.errors?.image?.[0]}>
                <input
                  name="image"
                  defaultValue={product?.image ?? ""}
                  required
                  className={getInputClassName(Boolean(state?.errors?.image?.[0]))}
                  placeholder="https://... ou /produtos/item.png"
                />
              </FormField>

              <FormField label="Preco de custo">
                <input
                  disabled
                  className="w-full rounded-[10px] border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-base text-zinc-400 outline-none"
                  placeholder="0,00"
                />
              </FormField>

              <FormField label="Estoque atual">
                <div className="space-y-2 rounded-[10px] border border-zinc-300 bg-zinc-50 px-3 py-2.5">
                  <input
                    disabled
                    className="w-full bg-transparent text-base text-zinc-500 outline-none"
                    placeholder="0"
                  />
                  <SwitchField
                    name="featured"
                    defaultChecked={product?.featured ?? false}
                    label="Controlar estoque"
                    hint="Use esse toggle para destacar item no menu."
                  />
                </div>
              </FormField>

              <FormField label="Publicacao">
                <SwitchField
                  name="isAvailable"
                  defaultChecked={product?.isAvailable ?? true}
                  label="Disponivel no cardapio"
                  hint="Quando desligado, o item fica oculto do cliente."
                />
              </FormField>

              <FormField label="Informacoes adicionais" error={state?.errors?.additionalInfo?.[0]}>
                <textarea
                  name="additionalInfo"
                  defaultValue={product?.additionalInfo ?? ""}
                  rows={4}
                  className={getInputClassName(Boolean(state?.errors?.additionalInfo?.[0]))}
                  placeholder="Observacoes internas ou detalhes extras"
                />
              </FormField>
            </div>

            <aside>
              <div className="flex h-[300px] items-center justify-center rounded-[12px] border border-zinc-300 bg-zinc-100">
                <div className="text-center text-zinc-500">
                  <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-zinc-400">
                    <Camera className="h-7 w-7" />
                  </div>
                  <p className="mt-3 text-sm font-medium">Imagem do produto</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Cole a URL no campo ao lado
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {state?.message ? (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-w-[180px] items-center justify-center rounded-[10px] bg-zinc-300 px-5 py-3 text-base font-semibold text-white transition hover:bg-zinc-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "SALVANDO..." : submitLabel.toUpperCase()}
          </button>

          <Link
            href={cancelHref}
            className="inline-flex min-w-[180px] items-center justify-center rounded-[10px] border border-zinc-300 bg-white px-5 py-3 text-base font-semibold text-zinc-800 transition hover:bg-zinc-50"
          >
            CANCELAR
          </Link>
        </div>
      </div>
    </form>
  );
}

function FormField({
  label,
  error,
  suffix,
  required = false,
  children,
}: {
  label: string;
  error?: string;
  suffix?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-[1.05rem] font-medium text-zinc-700">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
        {suffix ? <span className="text-xs text-zinc-500">{suffix}</span> : null}
      </div>

      {children}
      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SwitchField({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[10px] border border-zinc-300 bg-white px-3 py-2">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-zinc-800">{label}</span>
        {hint ? <span className="block text-xs text-zinc-500">{hint}</span> : null}
      </span>

      <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-zinc-300 transition peer-checked:bg-sky-500" />
        <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function getInputClassName(hasError: boolean) {
  return `w-full rounded-[10px] border px-3 py-2.5 text-base outline-none transition ${
    hasError
      ? "border-red-400 bg-red-50 text-red-900 placeholder:text-red-300 focus:border-red-500"
      : "border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:bg-white"
  }`;
}
