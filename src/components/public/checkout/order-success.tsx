import Link from "next/link";
import { CheckoutItem, DeliveryType } from "@/src/types/checkout";
import { formatBRL } from "@/src/lib/format";

type OrderSuccessProps = {
  slug: string;
  orderNumber: string;
  items: CheckoutItem[];
  total: number;
  deliveryType: DeliveryType;
};

export function OrderSuccess({
  slug,
  orderNumber,
  items,
  total,
  deliveryType,
}: OrderSuccessProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center sm:p-8">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#d1e6f8] bg-[#eaf5ff] text-3xl text-[#1688e8]">
        ✓
      </div>

      <h1 className="mb-2 text-[30px] font-semibold text-zinc-900">
        Pedido confirmado!
      </h1>

      <p className="mb-5 max-w-[360px] text-[14px] leading-7 text-zinc-600">
        Recebemos seu pedido {orderNumber}. A equipe ja consegue acompanhar o
        andamento e seguir com a confirmacao.
      </p>

      <div className="mb-4 w-full rounded-[12px] border border-zinc-200 bg-white p-4 text-left shadow-[0_10px_22px_rgba(37,68,94,0.08)] sm:p-5">
        <div className="font-ui-mono mb-2.5 text-[10px] uppercase tracking-[0.06em] text-[#1688e8]">
          Resumo do pedido
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 text-[14px] text-zinc-700"
            >
              <span className="leading-6">
                {item.quantity}× {item.name}
              </span>
              <strong className="text-zinc-900">
                {formatBRL(item.quantity * item.price)}
              </strong>
            </div>
          ))}
        </div>

        <div className="mt-3.5 flex justify-between border-t border-zinc-200 pt-3 text-[15px] font-semibold">
          <span>Total pago</span>
          <span className="text-[#1688e8]">{formatBRL(total)}</span>
        </div>
      </div>

      <div className="mb-5 text-[14px] text-zinc-600">
        Pedido {orderNumber} ·{" "}
        {deliveryType === "delivery"
          ? "Previsão: 30–50 min"
          : "Retirada no balcão"}
      </div>

      <Link
        href={`/${slug}`}
        className="rounded-[8px] bg-[var(--brand-primary)] px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(0,115,230,0.18)] transition hover:bg-[var(--brand-primary-strong)]"
      >
        Voltar ao cardápio
      </Link>
    </div>
  );
}
