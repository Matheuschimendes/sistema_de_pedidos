import { PaymentMethod } from "@/src/types/checkout";

type PaymentOptionsProps = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

const options = [
  { key: "pix", label: "Pix", icon: "📱" },
  { key: "credit", label: "Cartão crédito", icon: "💳" },
  { key: "debit", label: "Cartão débito", icon: "💳" },
  { key: "cash", label: "Dinheiro", icon: "💵" },
] as const;

export function PaymentOptions({
  value,
  onChange,
}: PaymentOptionsProps) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
        Forma de pagamento
      </div>
      <div className="mb-4 mt-2 text-sm leading-6 text-zinc-500">
        Selecione como deseja pagar no momento da entrega ou da retirada.
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`flex items-center gap-3 rounded-xl border p-3.5 ${value === option.key
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]"
                : "border-zinc-200 bg-white"
              }`}
          >
            <span className="text-lg">{option.icon}</span>
            <span className="text-base font-medium text-zinc-700">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
