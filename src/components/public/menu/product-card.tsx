import Image from "next/image";
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
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-36 w-full bg-zinc-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            {product.emoji}
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="text-sm font-semibold uppercase text-zinc-900">
          {product.name}
        </div>

        <div className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
          {product.description}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="text-base font-semibold text-zinc-900">
            {formatBRL(product.price)}
          </div>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-xl text-white transition hover:scale-105"
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}