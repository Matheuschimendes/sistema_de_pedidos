import { DeliveryType } from "@/src/types/checkout";

type DeliveryOptionsProps = {
  value: DeliveryType;
  onChange: (value: DeliveryType) => void;
};

export function DeliveryOptions({
  value,
  onChange,
}: DeliveryOptionsProps) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
        Tipo de entrega
      </div>
      <div className="mb-4 mt-2 text-sm leading-6 text-zinc-500">
        Escolha se você prefere receber em casa ou retirar seu pedido no
        balcão.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange("delivery")}
          className={`rounded-xl border p-4.5 text-center ${value === "delivery"
            ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]"
            : "border-zinc-200 bg-white"
            }`}
        >
          <div className="text-[1.75rem]">🚚</div>
          <div className="mt-1.5 text-base font-semibold text-zinc-700">
            Entrega
          </div>
          <div className="mt-1 text-sm text-zinc-400">+R$ 5,00</div>
        </button>

        <button
          onClick={() => onChange("pickup")}
          className={`rounded-xl border p-4.5 text-center ${value === "pickup"
            ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]"
            : "border-zinc-200 bg-white"
            }`}
        >
          <div className="text-[1.75rem]">🙋</div>
          <div className="mt-1.5 text-base font-semibold text-zinc-700">
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
