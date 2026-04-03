import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { formatBRL } from "@/src/lib/format";
import { ProductGroup } from "@/src/types/menu";

type ProductGroupCardProps = {
  group: ProductGroup;
  onOpen: () => void;
};

export function ProductGroupCard({
  group,
  onOpen,
}: ProductGroupCardProps) {
  const itemCountLabel =
    group.itemCount === 1
      ? "1 item disponível"
      : `${group.itemCount} itens disponíveis`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white text-left shadow-sm transition hover:border-[var(--brand-primary)]/25 hover:shadow-md"
    >
      <div className="relative h-32 w-full bg-zinc-100 sm:h-40">
        {group.image ? (
          <Image
            src={group.image}
            alt={group.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl sm:text-5xl">
            {group.emoji ?? "📦"}
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          Categoria
        </div>
      </div>

      <div className="bg-gradient-to-b from-white to-[var(--brand-primary-soft)]/20 p-3.5 sm:p-4">
        <div className="line-clamp-2 min-h-[2.8rem] text-sm font-semibold uppercase leading-[1.35] text-zinc-900 sm:text-base">
          {group.name}
        </div>

        <div className="mt-1.5 line-clamp-3 min-h-[3.4rem] text-[12px] leading-[1.45] text-zinc-500 sm:text-sm">
          {group.description}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-base font-semibold text-zinc-900 sm:text-lg">
              {formatBRL(group.priceFrom)}
            </div>
            <div className="text-xs text-zinc-400">
              A partir de · {itemCountLabel}
            </div>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-ink)]">
            Ver itens
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </button>
  );
}
