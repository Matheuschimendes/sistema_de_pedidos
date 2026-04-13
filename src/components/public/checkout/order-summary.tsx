import Link from "next/link";
import { CheckoutItem } from "@/src/types/checkout";
import { formatBRL } from "@/src/lib/format";

type OrderSummaryProps = {
  slug: string;
  items: CheckoutItem[];
  subtotal: number;
};

export function OrderSummary({ slug, items, subtotal }: OrderSummaryProps) {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="rounded-[12px] border border-zinc-200 bg-white p-4 shadow-[0_10px_22px_rgba(37,68,94,0.08)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="font-ui-mono text-[10px] uppercase tracking-[0.06em] text-[#1688e8]">
          Seu pedido
        </div>
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
          {totalItems} {totalItems === 1 ? "item" : "itens"}
        </span>
      </div>
      <div className="mb-3 mt-1.5 text-[13px] leading-6 text-zinc-600">
        Confira os itens e valores antes de confirmar.
      </div>

      {items.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-[13px] text-zinc-600">
          Seu carrinho esta vazio no momento.
          <Link
            href={`/${slug}`}
            className="ml-1 font-semibold text-[#1688e8] hover:underline"
          >
            Escolher itens no cardapio
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 text-[14px] text-zinc-700"
            >
              <span className="leading-6">
                {item.quantity}× {item.name}
              </span>
              <strong className="font-semibold text-zinc-900">
                {formatBRL(item.quantity * item.price)}
              </strong>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3.5 flex justify-between border-t border-zinc-200 pt-3 text-[15px] font-semibold text-zinc-900">
        <span>Subtotal</span>
        <span>{formatBRL(subtotal)}</span>
      </div>
    </div>
  );
}
