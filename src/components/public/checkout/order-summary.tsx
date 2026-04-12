import { CheckoutItem } from "@/src/types/checkout";
import { formatBRL } from "@/src/lib/format";

type OrderSummaryProps = {
  items: CheckoutItem[];
  subtotal: number;
};

export function OrderSummary({ items, subtotal }: OrderSummaryProps) {
  return (
    <div className="ds-panel p-5">
      <div className="font-ui-mono text-[11px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
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
            <strong className="font-semibold text-[var(--brand-ink)]">
              {formatBRL(item.quantity * item.price)}
            </strong>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between border-t border-[var(--brand-border)]/75 pt-4 text-base font-semibold text-[var(--brand-ink)]">
        <span>Subtotal</span>
        <span>{formatBRL(subtotal)}</span>
      </div>
    </div>
  );
}
