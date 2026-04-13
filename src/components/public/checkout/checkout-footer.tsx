import { ShieldCheck } from "lucide-react";
import { formatBRL } from "@/src/lib/format";

type CheckoutFooterProps = {
  subtotal: number;
  deliveryFee: number;
  deliveryFeeToCombine?: boolean;
  discount?: number;
  total: number;
  showDeliveryFee: boolean;
  disabled?: boolean;
  isSubmitting?: boolean;
  ctaLabel?: string;
  helperMessage?: string | null;
  validationHint?: string | null;
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
  isSubmitting = false,
  ctaLabel = "Confirmar pedido",
  helperMessage,
  validationHint,
  errorMessage,
  onConfirm,
}: CheckoutFooterProps) {
  return (
    <div className="fixed bottom-0 left-1/2 w-full max-w-[540px] -translate-x-1/2 border-t border-black/10 bg-[#f2f2f3]/96 px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3.5 backdrop-blur-xl sm:px-5">
      <div className="mb-2.5 rounded-[10px] border border-zinc-200 bg-white px-3 py-2.5">
        <div className="flex justify-between text-[13px] text-zinc-600">
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>

        {showDeliveryFee && (
          <div className="mt-1 flex justify-between text-[13px] text-zinc-600">
            <span>Taxa de entrega</span>
            <span>{deliveryFeeToCombine ? "A combinar" : formatBRL(deliveryFee)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="mt-1 flex justify-between text-[13px] text-zinc-600">
            <span>Desconto</span>
            <span>- {formatBRL(discount)}</span>
          </div>
        )}
      </div>

      <div className="mb-2 flex justify-between text-[19px] font-semibold text-zinc-900">
        <span>{deliveryFeeToCombine ? "Total parcial" : "Total"}</span>
        <span className="text-[#1688e8]">{formatBRL(total)}</span>
      </div>

      {deliveryFeeToCombine ? (
        <div className="mb-2 text-[11px] text-zinc-500">
          A taxa de entrega sera combinada no atendimento.
        </div>
      ) : null}

      <div className="mb-3 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {helperMessage ??
              "Seu pedido sera registrado no sistema e, se houver WhatsApp configurado, a conversa abrira pronta para envio."}
          </span>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {!errorMessage && validationHint ? (
        <div className="mb-3 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          {validationHint}
        </div>
      ) : null}

      <button
        onClick={onConfirm}
        disabled={disabled}
        className="w-full rounded-[8px] bg-[var(--brand-primary)] px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(0,115,230,0.18)] transition hover:bg-[var(--brand-primary-strong)] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
      >
        {isSubmitting ? "Enviando pedido..." : `✓ ${ctaLabel}`}
      </button>
    </div>
  );
}
