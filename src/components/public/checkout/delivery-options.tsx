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
    <div className="rounded-2xl border border-zinc-100 bg-white p-4">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
        Tipo de entrega
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange("delivery")}
          className={`rounded-xl border p-4 text-center ${value === "delivery"
            ? "border-emerald-500 bg-emerald-50"
            : "border-zinc-200 bg-white"
            }`}
        >
          <div className="text-2xl">🚚</div>
          <div className="mt-1 text-sm font-semibold text-zinc-700">Entrega</div>
          <div className="mt-1 text-[11px] text-zinc-400">+R$ 5,00</div>
        </button>

        <button
          onClick={() => onChange("pickup")}
          className={`rounded-xl border p-4 text-center ${value === "pickup"
            ? "border-emerald-500 bg-emerald-50"
            : "border-zinc-200 bg-white"
            }`}
        >
          <div className="text-2xl">🙋</div>
          <div className="mt-1 text-sm font-semibold text-zinc-700">Retirada</div>
          <div className="mt-1 text-[11px] text-zinc-400">No balcão · grátis</div>
        </button>
      </div>
    </div>
  );
}