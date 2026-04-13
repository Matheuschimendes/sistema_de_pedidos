import { Bike, Store } from "lucide-react";
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
    <div className="rounded-[12px] border border-zinc-200 bg-white p-4 shadow-[0_10px_22px_rgba(37,68,94,0.08)] sm:p-5">
      <div className="font-ui-mono text-[10px] uppercase tracking-[0.06em] text-[#1688e8]">
        Tipo de entrega
      </div>
      <div className="mb-3 mt-1.5 text-[13px] leading-6 text-zinc-600">
        Escolha se voce prefere receber em casa ou retirar no balcao.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("delivery")}
          className={`rounded-[10px] border px-3 py-3 text-center transition ${
            value === "delivery"
              ? "border-[#1688e8] bg-[#eaf5ff] shadow-[0_8px_18px_rgba(22,136,232,0.16)]"
              : "border-zinc-200 bg-zinc-50 hover:bg-white"
          }`}
        >
          <div className="flex justify-center">
            <span className="inline-flex rounded-[8px] border border-zinc-200 bg-white p-1.5 text-[#1688e8]">
              <Bike className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5 text-[14px] font-semibold text-zinc-900">
            Entrega
          </div>
          <div className="mt-0.5 text-[12px] text-zinc-600">
            + {deliveryFeeLabel}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange("pickup")}
          className={`rounded-[10px] border px-3 py-3 text-center transition ${
            value === "pickup"
              ? "border-[#1688e8] bg-[#eaf5ff] shadow-[0_8px_18px_rgba(22,136,232,0.16)]"
              : "border-zinc-200 bg-zinc-50 hover:bg-white"
          }`}
        >
          <div className="flex justify-center">
            <span className="inline-flex rounded-[8px] border border-zinc-200 bg-white p-1.5 text-[#1688e8]">
              <Store className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5 text-[14px] font-semibold text-zinc-900">
            Retirada
          </div>
          <div className="mt-0.5 text-[12px] text-zinc-600">
            No balcao - gratis
          </div>
        </button>
      </div>
    </div>
  );
}
