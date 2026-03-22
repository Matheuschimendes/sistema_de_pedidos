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
    <div className="rounded-2xl border border-zinc-100 bg-white p-4">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
        Seus dados
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-zinc-700">
            Nome completo *
          </label>
          <input
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-zinc-700">
            WhatsApp *
          </label>
          <input
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="(85) 99999-9999"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {deliveryType === "delivery" && (
          <div>
            <label className="mb-1 block text-[11px] font-medium text-zinc-700">
              Endereço de entrega *
            </label>
            <input
              value={data.address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="Rua, número, complemento, bairro..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-[11px] font-medium text-zinc-700">
            Observações
          </label>
          <input
            value={data.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Ex: sem cebola..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}