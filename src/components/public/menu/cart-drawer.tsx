import { Cart, Product } from "@/src/types/menu";
import { formatBRL } from "@/src/lib/format";
import Link from "next/link";

type CartDrawerProps = {
  open: boolean;
  items: Product[];
  cart: Cart;
  subtotal: number;
  deliveryFee: number;
  total: number;
  slug: string;
  onClose: () => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
};

export function CartDrawer({
  open,
  items,
  cart,
  subtotal,
  deliveryFee,
  total,
  slug,
  onClose,
  onIncrease,
  onDecrease,
}: CartDrawerProps) {
  const itemCountLabel =
    items.length === 1 ? "1 item no pedido" : `${items.length} itens no pedido`;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <div
        className={`fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 rounded-t-[20px] bg-white transition duration-300 ${open ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div className="flex items-start justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <div className="text-lg font-semibold text-zinc-900">
              Seu carrinho
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              {itemCountLabel}. Revise os itens antes de seguir para o checkout.
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-base text-zinc-500"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto px-5 py-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3.5 border-b border-zinc-100 py-4 last:border-b-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg">
                {item.emoji}
              </div>

              <div className="flex-1">
                <div className="text-base font-medium leading-6 text-zinc-900">
                  {item.name}
                </div>
                <div className="mt-1 text-sm text-zinc-400">
                  {formatBRL(item.price)} cada
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDecrease(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-base text-zinc-700"
                >
                  −
                </button>

                <span className="min-w-5 text-center text-base font-semibold text-zinc-900">
                  {cart[item.id]}
                </span>

                <button
                  onClick={() => onIncrease(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-base text-white"
                >
                  +
                </button>
              </div>

              <div className="w-20 text-right text-base font-semibold text-zinc-900">
                {formatBRL(item.price * (cart[item.id] || 0))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-100 px-5 py-4">
          <div className="mb-1.5 flex justify-between text-sm text-zinc-500">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>

          <div className="mb-1.5 flex justify-between text-sm text-zinc-500">
            <span>Taxa de entrega</span>
            <span>{formatBRL(deliveryFee)}</span>
          </div>

          <div className="mb-4 flex justify-between text-xl font-semibold text-zinc-900">
            <span>Total</span>
            <span className="text-[var(--brand-accent)]">{formatBRL(total)}</span>
          </div>

          <Link
            href={`/${slug}/checkout`}
            className="block w-full rounded-xl bg-[var(--brand-primary)] px-4 py-3.5 text-center text-base font-semibold text-white hover:opacity-90"
          >
            Continuar para checkout →
          </Link>
        </div>
      </div>
    </>
  );
}
