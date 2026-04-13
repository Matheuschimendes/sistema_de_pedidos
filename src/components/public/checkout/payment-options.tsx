import { Banknote, CreditCard, QrCode, Wallet } from "lucide-react";
import { PaymentMethod } from "@/src/types/checkout";

type PaymentOptionsProps = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

const options = [
  {
    key: "pix",
    label: "Pix",
    detail: "Transferencia instantanea",
    icon: QrCode,
  },
  {
    key: "credit",
    label: "Cartao de credito",
    detail: "Pagamento no atendimento",
    icon: CreditCard,
  },
  {
    key: "debit",
    label: "Cartao de debito",
    detail: "Pagamento no atendimento",
    icon: Wallet,
  },
  {
    key: "cash",
    label: "Dinheiro",
    detail: "Pagamento no atendimento",
    icon: Banknote,
  },
] as const;

export function PaymentOptions({
  value,
  onChange,
}: PaymentOptionsProps) {
  return (
    <div className="rounded-[12px] border border-zinc-200 bg-white p-4 shadow-[0_10px_22px_rgba(37,68,94,0.08)] sm:p-5">
      <div className="font-ui-mono text-[10px] uppercase tracking-[0.06em] text-[#1688e8]">
        Forma de pagamento
      </div>
      <div className="mb-3 mt-1.5 text-[13px] leading-6 text-zinc-600">
        Selecione como deseja pagar no momento da entrega ou da retirada.
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            type="button"
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition ${
              value === option.key
                ? "border-[#1688e8] bg-[#eaf5ff] shadow-[0_8px_18px_rgba(22,136,232,0.16)]"
                : "border-zinc-200 bg-zinc-50 hover:bg-white"
            }`}
          >
            <span className="inline-flex rounded-[8px] border border-zinc-200 bg-white p-1.5 text-[#1688e8]">
              <option.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-zinc-900">
                {option.label}
              </span>
              <span className="block truncate text-[11px] text-zinc-600">
                {option.detail}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
