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
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-primary-soft)] text-4xl text-[var(--brand-primary)]">
        ✓
      </div>

      <h1 className="mb-2 text-3xl font-semibold text-zinc-900">
        Pedido confirmado!
      </h1>

      <p className="mb-6 max-w-[320px] text-base leading-8 text-zinc-500">
        Recebemos seu pedido {orderNumber}. Em breve você receberá uma
        confirmação pelo WhatsApp.
      </p>

      <div className="mb-5 w-full rounded-2xl border border-zinc-100 bg-white p-5 text-left">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
          Resumo do pedido
        </div>

        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 text-base text-zinc-500"
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

        <div className="mt-4 flex justify-between border-t border-zinc-100 pt-4 text-base font-semibold">
          <span>Total pago</span>
          <span className="text-[var(--brand-accent)]">{formatBRL(total)}</span>
        </div>
      </div>

      <div className="mb-6 text-base text-zinc-500">
        Pedido {orderNumber} ·{" "}
        {deliveryType === "delivery"
          ? "Previsão: 30–50 min"
          : "Retirada no balcão"}
      </div>

      <Link
        href={`/${slug}`}
        className="rounded-xl bg-[var(--brand-primary)] px-7 py-3.5 text-base font-semibold text-white"
      >
        Voltar ao cardápio
      </Link>
    </div>
  );
}
