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
      className="group w-full overflow-hidden rounded-[26px] border border-[var(--brand-border)]/80 bg-white text-left shadow-[0_12px_24px_rgba(0,0,0,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[var(--brand-primary)]/25 hover:shadow-[0_18px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="relative h-[8.5rem] w-full bg-[var(--brand-canvas)] sm:h-40">
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

        <div className="font-ui-mono absolute left-3 top-3 rounded-full border border-white/14 bg-black/58 px-2.5 py-1 text-[10px] uppercase tracking-[0.03em] text-white backdrop-blur-sm">
          Categoria
        </div>
      </div>

      <div className="bg-[linear-gradient(180deg,#ffffff_0%,rgba(229,244,255,0.42)_100%)] p-3.5 sm:p-4">
        <div className="line-clamp-2 min-h-[3.1rem] text-sm font-semibold leading-[1.45] text-[var(--brand-ink)] sm:text-base">
          {group.name}
        </div>

        <div className="mt-1.5 line-clamp-3 min-h-[3.6rem] text-[12px] leading-[1.5] text-zinc-500 sm:text-sm">
          {group.description}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-base font-semibold text-[var(--brand-ink)] sm:text-lg">
              {formatBRL(group.priceFrom)}
            </div>
            <div className="text-xs text-zinc-400">
              A partir de · {itemCountLabel}
            </div>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)]">
            Ver itens
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </button>
  );
}
