import { CheckoutItem } from "@/src/types/checkout";
import { formatBRL } from "@/src/lib/format";

type OrderSummaryProps = {
  items: CheckoutItem[];
  subtotal: number;
};

export function OrderSummary({ items, subtotal }: OrderSummaryProps) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
        Seu pedido
      </div>
      <div className="mb-4 mt-2 text-sm leading-6 text-zinc-500">
        Confira os itens e valores antes de confirmar o envio pelo WhatsApp.
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between gap-4 text-base text-zinc-500"
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

      <div className="mt-4 flex justify-between border-t border-zinc-100 pt-4 text-base font-semibold text-zinc-900">
        <span>Subtotal</span>
        <span>{formatBRL(subtotal)}</span>
      </div>
    </div>
  );
}
