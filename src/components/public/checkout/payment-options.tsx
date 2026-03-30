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
    <div className="rounded-2xl border border-zinc-100 bg-white p-4">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
        Forma de pagamento
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`flex items-center gap-2 rounded-xl border p-3 ${value === option.key
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]"
                : "border-zinc-200 bg-white"
              }`}
          >
            <span>{option.icon}</span>
            <span className="text-sm font-medium text-zinc-700">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
