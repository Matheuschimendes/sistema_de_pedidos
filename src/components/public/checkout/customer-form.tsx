import { CustomerData, DeliveryType } from "@/src/types/checkout";

type CustomerFormProps = {
  data: CustomerData;
  deliveryType: DeliveryType;
  onChange: (field: keyof CustomerData, value: string) => void;
};

export function CustomerForm({
  data,
  deliveryType,
  onChange,
}: CustomerFormProps) {
  return (
    <div className="ds-panel p-5">
      <div className="font-ui-mono text-[11px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
        Seus dados
      </div>
      <div className="mb-4 mt-2 text-sm leading-6 text-zinc-500">
        Usaremos essas informações para confirmar o pedido e garantir a
        entrega ou retirada correta.
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-700">
            Nome completo *
          </label>
          <input
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Seu nome"
            className="ds-input px-3.5 py-3 text-base"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-700">
            WhatsApp *
          </label>
          <input
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="(85) 99999-9999"
            className="ds-input px-3.5 py-3 text-base"
          />
        </div>

        {deliveryType === "delivery" && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-700">
              Endereço de entrega *
            </label>
            <input
              value={data.address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="Rua, número, complemento, bairro..."
              className="ds-input px-3.5 py-3 text-base"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-700">
            Observações
          </label>
          <input
            value={data.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Ex: sem cebola..."
            className="ds-input px-3.5 py-3 text-base"
          />
        </div>
      </div>
    </div>
  );
}
