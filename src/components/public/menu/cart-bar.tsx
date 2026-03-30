import { formatBRL } from "@/src/lib/format";

type CartBarProps = {
  totalItems: number;
  subtotal: number;
  onOpenCart: () => void;
};

export function CartBar({
  totalItems,
  subtotal,
  onOpenCart,
}: CartBarProps) {
  if (totalItems <= 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 bg-gradient-to-t from-white via-white to-transparent px-4 pb-4 pt-6">
      <button
        onClick={onOpenCart}
        className="pointer-events-auto flex w-full items-center justify-between rounded-2xl bg-[var(--brand-ink)] px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-[10px] font-semibold text-white">
            {totalItems}
          </div>
          <div className="text-sm font-semibold text-white">Ver carrinho</div>
        </div>

        <div className="text-sm font-semibold text-[var(--brand-accent)]">
          {formatBRL(subtotal)}
        </div>
      </button>
    </div>
  );
}
