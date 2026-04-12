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
    <div className="ds-panel p-5">
      <div className="font-ui-mono text-[11px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
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
            className={`flex items-center gap-3 rounded-[18px] border p-3.5 shadow-sm transition ${value === option.key
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] shadow-[0_12px_22px_rgba(0,115,230,0.12)]"
                : "border-[var(--brand-border)] bg-white"
              }`}
          >
            <span className="text-lg">{option.icon}</span>
            <span className="text-base font-medium text-[var(--brand-ink)]">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
