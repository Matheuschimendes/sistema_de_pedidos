import { formatBRL } from "@/src/lib/format";

type CheckoutFooterProps = {
  subtotal: number;
  deliveryFee: number;
  deliveryFeeToCombine?: boolean;
  discount?: number;
  total: number;
  showDeliveryFee: boolean;
  disabled?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
};

export function CheckoutFooter({
  subtotal,
  deliveryFee,
  deliveryFeeToCombine = false,
  discount = 0,
  total,
  showDeliveryFee,
  disabled,
  errorMessage,
  onConfirm,
}: CheckoutFooterProps) {
  return (
    <div className="fixed bottom-0 left-1/2 w-full max-w-[520px] -translate-x-1/2 border-t border-[var(--brand-border)]/75 bg-white/96 px-4 py-4 backdrop-blur-xl">
      <div className="mb-3 space-y-1">
        <div className="flex justify-between text-sm text-zinc-500">
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>

        {showDeliveryFee && (
          <div className="flex justify-between text-sm text-zinc-500">
            <span>Taxa de entrega</span>
            <span>{deliveryFeeToCombine ? "A combinar" : formatBRL(deliveryFee)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-sm text-zinc-500">
            <span>Desconto</span>
            <span>- {formatBRL(discount)}</span>
          </div>
        )}
      </div>

      <div className="mb-2 flex justify-between text-xl font-semibold text-[var(--brand-ink)]">
        <span>{deliveryFeeToCombine ? "Total parcial" : "Total"}</span>
        <span className="text-[var(--brand-accent)]">{formatBRL(total)}</span>
      </div>

      {deliveryFeeToCombine ? (
        <div className="mb-2 text-xs text-zinc-400">
          A taxa de entrega será combinada no atendimento.
        </div>
      ) : null}

      <div className="mb-4 text-sm text-zinc-500">
        Ao confirmar, seu pedido sera registrado no sistema e, se houver
        WhatsApp configurado, a conversa sera aberta pronta para envio.
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <button
        onClick={onConfirm}
        disabled={disabled}
        className="w-full rounded-[16px] bg-[var(--brand-primary)] px-4 py-3.5 text-base font-semibold text-white shadow-[0_14px_28px_rgba(0,115,230,0.18)] transition hover:bg-[var(--brand-primary-strong)] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
      >
        ✓ Confirmar pedido
      </button>
    </div>
  );
}
