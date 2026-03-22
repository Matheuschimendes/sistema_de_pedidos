import { Product } from "@/src/types/menu";
import { formatBRL } from "@/src/lib/format";

type ProductCardProps = {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onDecrease: () => void;
};

export function ProductCard({
  product,
  quantity,
  onAdd,
  onDecrease,
}: ProductCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-3xl">
        {product.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-zinc-900">{product.name}</div>
        <div className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
          {product.description}
        </div>
        <div className="mt-2 text-base font-semibold text-zinc-900">
          {formatBRL(product.price)}
        </div>
      </div>

      {quantity === 0 ? (
        <button
          onClick={onAdd}
          className="flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-lg bg-emerald-500 text-xl text-white transition hover:scale-105"
        >
          +
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-2 self-end">
          <button
            onClick={onDecrease}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-zinc-700"
          >
            −
          </button>

          <span className="min-w-4 text-center text-sm font-semibold text-zinc-900">
            {quantity}
          </span>

          <button
            onClick={onAdd}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-sm text-white"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}