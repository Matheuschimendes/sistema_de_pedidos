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
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition">
      <div className="relative h-28 w-full bg-zinc-100 sm:h-36">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl sm:text-5xl">
            {product.emoji}
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-3">
        <div className="line-clamp-2 min-h-[2.5rem] text-[11px] font-semibold uppercase leading-5 text-zinc-900 sm:text-sm">
          {product.name}
        </div>

        <div className="mt-1 line-clamp-2 min-h-[2.25rem] text-[10px] leading-4 text-zinc-400 sm:text-xs sm:leading-5">
          {product.description}
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="text-sm font-semibold text-zinc-900 sm:text-base">
            {formatBRL(product.price)}
          </div>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-lg text-white"
            >
              +
            </button>
          ) : (
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                onClick={onDecrease}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-zinc-700"
              >
                −
              </button>

              <span className="min-w-[18px] text-center text-xs font-semibold text-zinc-900 sm:text-sm">
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