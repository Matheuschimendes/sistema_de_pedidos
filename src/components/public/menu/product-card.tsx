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
  const isFeatured = Boolean(product.featured);
  const quantityLabel = quantity === 1 ? "1 item no pedido" : `${quantity} itens no pedido`;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${isFeatured ? "border-[var(--brand-primary)]/20 shadow-md" : "border-zinc-100"
        }`}
    >
      <div
        className={`relative w-full bg-zinc-100 ${isFeatured ? "h-44 sm:h-52" : "h-32 sm:h-40"
          }`}
      >
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

        {product.badge ? (
          <div className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            {product.badge}
          </div>
        ) : null}
      </div>

      <div
        className={`sm:p-3.5 ${isFeatured ? "bg-gradient-to-b from-white to-[var(--brand-primary-soft)]/35 p-3.5 sm:p-4" : "p-3"
          }`}
      >
        <div
          className={`line-clamp-3 min-h-[3.35rem] font-semibold uppercase leading-[1.35] text-zinc-900 ${isFeatured ? "text-sm sm:text-base" : "text-[13px] sm:text-[0.95rem]"
            }`}
        >
          {product.name}
        </div>

        <div
          className={`mt-1.5 line-clamp-3 min-h-[3.4rem] leading-[1.45] sm:text-sm ${isFeatured ? "text-[12px] text-zinc-600" : "text-[12px] text-zinc-500"
            }`}
        >
          {product.description}
        </div>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <div className="text-base font-semibold text-zinc-900 sm:text-lg">
                {formatBRL(product.price)}
              </div>
              <div className="text-xs text-zinc-400">
                {quantity > 0 ? quantityLabel : "Toque para adicionar"}
              </div>
            </div>

            {quantity > 0 ? (
              <div className="rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-ink)]">
                {quantity}
              </div>
            ) : null}
          </div>

          {quantity === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Adicionar ${product.name}`}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white ${isFeatured
                ? "bg-[var(--brand-primary)] shadow-sm"
                : "bg-[var(--brand-ink)]"
                }`}
            >
              <span className="text-base leading-none">+</span>
              <span>Adicionar ao pedido</span>
            </button>
          ) : (
            <div className="grid grid-cols-[44px_1fr_44px] items-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              <button
                type="button"
                onClick={onDecrease}
                aria-label={`Remover uma unidade de ${product.name}`}
                className="flex h-11 items-center justify-center border-r border-zinc-200 bg-white text-lg text-zinc-700"
              >
                −
              </button>

              <div className="px-2 text-center">
                <div className="text-base font-semibold text-zinc-900">
                  {quantity}
                </div>
                <div className="text-[11px] text-zinc-400">no carrinho</div>
              </div>

              <button
                type="button"
                onClick={onAdd}
                aria-label={`Adicionar mais uma unidade de ${product.name}`}
                className="flex h-11 items-center justify-center border-l border-zinc-200 bg-[var(--brand-primary)] text-lg text-white"
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
