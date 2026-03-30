import { formatBRL } from "@/src/lib/format";

type CheckoutFooterProps = {
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  showDeliveryFee: boolean;
  disabled?: boolean;
  onConfirm: () => void;
};

export function CheckoutFooter({
  subtotal,
  deliveryFee,
  discount = 0,
  total,
  showDeliveryFee,
  disabled,
  onConfirm,
}: CheckoutFooterProps) {
  return (
    <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-zinc-200 bg-white px-4 py-4">
      <div className="mb-3 space-y-1">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>

        {showDeliveryFee && (
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Taxa de entrega</span>
            <span>{formatBRL(deliveryFee)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Desconto</span>
            <span>- {formatBRL(discount)}</span>
          </div>
        )}
      </div>

      <div className="mb-4 flex justify-between text-lg font-semibold text-zinc-900">
        <span>Total</span>
        <span className="text-[var(--brand-accent)]">{formatBRL(total)}</span>
      </div>

      <button
        onClick={onConfirm}
        disabled={disabled}
        className="w-full rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        ✓ Confirmar pedido
      </button>
    </div>
  );
}
