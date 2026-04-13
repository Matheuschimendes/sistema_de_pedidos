import { CustomerData, DeliveryType } from "@/src/types/checkout";

type CustomerErrors = Partial<Record<"name" | "phone" | "address", string>>;

type CustomerFormProps = {
  data: CustomerData;
  deliveryType: DeliveryType;
  errors?: CustomerErrors;
  onChange: (field: keyof CustomerData, value: string) => void;
};

export function CustomerForm({
  data,
  deliveryType,
  errors,
  onChange,
}: CustomerFormProps) {
  return (
    <div className="rounded-[12px] border border-zinc-200 bg-white p-4 shadow-[0_10px_22px_rgba(37,68,94,0.08)] sm:p-5">
      <div className="font-ui-mono text-[10px] uppercase tracking-[0.06em] text-[#1688e8]">
        Seus dados
      </div>
      <div className="mb-3 mt-1.5 text-[13px] leading-6 text-zinc-600">
        Usaremos essas informações para confirmar o pedido e garantir a
        entrega ou retirada correta. Seus dados ficam salvos neste aparelho
        para agilizar os próximos pedidos.
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="checkout-name"
            className="mb-1.5 block text-xs font-medium text-zinc-700"
          >
            Nome completo *
          </label>
          <input
            id="checkout-name"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            autoComplete="name"
            placeholder="Seu nome"
            className={`w-full rounded-[8px] border bg-white px-3 py-2.5 text-[14px] text-zinc-900 outline-none transition focus:ring-4 focus:ring-sky-100 ${
              errors?.name ? "border-red-300 focus:border-red-400" : ""
            } ${
              errors?.name ? "" : "border-zinc-300 focus:border-zinc-900"
            }`}
            aria-invalid={Boolean(errors?.name)}
          />
          {errors?.name ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="checkout-phone"
            className="mb-1.5 block text-xs font-medium text-zinc-700"
          >
            WhatsApp *
          </label>
          <input
            id="checkout-phone"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            maxLength={16}
            placeholder="(85) 99999-9999"
            className={`w-full rounded-[8px] border bg-white px-3 py-2.5 text-[14px] text-zinc-900 outline-none transition focus:ring-4 focus:ring-sky-100 ${
              errors?.phone ? "border-red-300 focus:border-red-400" : ""
            } ${
              errors?.phone ? "" : "border-zinc-300 focus:border-zinc-900"
            }`}
            aria-invalid={Boolean(errors?.phone)}
          />
          {errors?.phone ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
          ) : (
            <p className="mt-1.5 text-xs text-zinc-500">
              Use um numero com DDD para receber a confirmacao.
            </p>
          )}
        </div>

        {deliveryType === "delivery" && (
          <div>
            <label
              htmlFor="checkout-address"
              className="mb-1.5 block text-xs font-medium text-zinc-700"
            >
              Endereço de entrega *
            </label>
            <input
              id="checkout-address"
              value={data.address}
              onChange={(e) => onChange("address", e.target.value)}
              autoComplete="street-address"
              placeholder="Rua, número, complemento, bairro..."
              className={`w-full rounded-[8px] border bg-white px-3 py-2.5 text-[14px] text-zinc-900 outline-none transition focus:ring-4 focus:ring-sky-100 ${
                errors?.address ? "border-red-300 focus:border-red-400" : ""
              } ${
                errors?.address ? "" : "border-zinc-300 focus:border-zinc-900"
              }`}
              aria-invalid={Boolean(errors?.address)}
            />
            {errors?.address ? (
              <p className="mt-1.5 text-xs text-red-600">{errors.address}</p>
            ) : null}
          </div>
        )}

        <div>
          <label
            htmlFor="checkout-notes"
            className="mb-1.5 block text-xs font-medium text-zinc-700"
          >
            Observações
          </label>
          <textarea
            id="checkout-notes"
            value={data.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Ex: sem cebola..."
            className="w-full resize-none rounded-[8px] border border-zinc-300 bg-white px-3 py-2.5 text-[14px] text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-4 focus:ring-sky-100"
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            Opcional. Ate 280 caracteres.
          </p>
        </div>
      </div>
    </div>
  );
}
