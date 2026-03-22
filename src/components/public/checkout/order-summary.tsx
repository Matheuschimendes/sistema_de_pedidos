import { CheckoutItem } from "@/src/types/checkout";
import { formatBRL } from "@/src/lib/format";

type OrderSummaryProps = {
  items: CheckoutItem[];
  subtotal: number;
};

export function OrderSummary({ items, subtotal }: OrderSummaryProps) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
        Seu pedido
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-zinc-500">
            <span>
              {item.quantity}× {item.name}
            </span>
            <strong className="font-semibold text-zinc-900">
              {formatBRL(item.quantity * item.price)}
            </strong>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between border-t border-zinc-100 pt-3 text-sm font-semibold text-zinc-900">
        <span>Subtotal</span>
        <span>{formatBRL(subtotal)}</span>
      </div>
    </div>
  );
}