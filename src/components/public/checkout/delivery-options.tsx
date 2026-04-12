import { DeliveryType } from "@/src/types/checkout";

type DeliveryOptionsProps = {
  value: DeliveryType;
  deliveryFee: number;
  deliveryFeeToCombine?: boolean;
  onChange: (value: DeliveryType) => void;
};

export function DeliveryOptions({
  value,
  deliveryFee,
  deliveryFeeToCombine = false,
  onChange,
}: DeliveryOptionsProps) {
  const deliveryFeeLabel = deliveryFeeToCombine
    ? "a combinar"
    : deliveryFee > 0
      ? deliveryFee.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "grátis";

  return (
    <div className="ds-panel p-5">
      <div className="font-ui-mono text-[11px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
        Tipo de entrega
      </div>
      <div className="mb-4 mt-2 text-sm leading-6 text-zinc-500">
        Escolha se você prefere receber em casa ou retirar seu pedido no
        balcão.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange("delivery")}
          className={`rounded-[18px] border p-[18px] text-center shadow-sm transition ${value === "delivery"
            ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] shadow-[0_12px_22px_rgba(0,115,230,0.12)]"
            : "border-[var(--brand-border)] bg-white"
            }`}
        >
          <div className="text-[1.75rem]">🚚</div>
          <div className="mt-1.5 text-base font-semibold text-[var(--brand-ink)]">
            Entrega
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            + {deliveryFeeLabel}
          </div>
        </button>

        <button
          onClick={() => onChange("pickup")}
          className={`rounded-[18px] border p-[18px] text-center shadow-sm transition ${value === "pickup"
            ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] shadow-[0_12px_22px_rgba(0,115,230,0.12)]"
            : "border-[var(--brand-border)] bg-white"
            }`}
        >
          <div className="text-[1.75rem]">🙋</div>
          <div className="mt-1.5 text-base font-semibold text-[var(--brand-ink)]">
            Retirada
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            No balcão · grátis
          </div>
        </button>
      </div>
    </div>
  );
}
