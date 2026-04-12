import Image from "next/image";
import { Search } from "lucide-react";
import { formatBRL } from "@/src/lib/format";
import { getNameInitials } from "@/src/lib/get-name-initials";
import { RestaurantBusinessTone } from "@/src/types/restaurant";

type MenuHeaderProps = {
  restaurantName: string;
  restaurantLogo?: string;
  restaurantStatusLabel: string;
  restaurantStatusDetail: string;
  restaurantStatusTone: RestaurantBusinessTone;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  deliveryTime?: string;
  slug: string;
  search: string;
  onSearchChange: (value: string) => void;
};

export function MenuHeader({
  restaurantName,
  restaurantLogo,
  restaurantStatusLabel,
  restaurantStatusDetail,
  restaurantStatusTone,
  rating,
  reviewCount,
  deliveryFee,
  deliveryTime,
  slug,
  search,
  onSearchChange,
}: MenuHeaderProps) {
  const restaurantInitials = getNameInitials(restaurantName);
  const statusClassName =
    restaurantStatusTone === "open"
      ? "border-[var(--border-status-open)] bg-[var(--brand-status-open)] text-[var(--status-open-ink)]"
      : restaurantStatusTone === "closed"
        ? "border-[var(--status-closed)] bg-[var(--status-closed-soft)] text-[var(--status-closed-ink)]"
        : "border-[var(--status-neutral)] bg-[var(--status-neutral-soft)] text-[var(--status-neutral-ink)]";
  const deliveryFeeToCombine = /combinar/i.test(deliveryTime ?? "");
  const deliveryFeeLabel = deliveryFeeToCombine
    ? "Taxa a combinar"
    : deliveryFee > 0
      ? `Taxa ${formatBRL(deliveryFee)}`
      : "Taxa grátis";

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--brand-border)]/75 bg-white/92 px-4 pb-0 pt-4 backdrop-blur-xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-[var(--brand-border)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
            {restaurantLogo ? (
              <Image
                src={restaurantLogo}
                alt={`Logo do restaurante ${restaurantName}`}
                fill
                sizes="48px"
                className="object-contain p-1.5"
              />
            ) : (
              <span className="text-base font-semibold text-[var(--brand-ink)]">
                {restaurantInitials}
              </span>
            )}
          </div>

          <div>
            <div className="font-ui-mono text-[11px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
              Cardápio digital
            </div>
            <div className="mt-1 text-lg font-semibold text-[var(--brand-ink)]">
              {restaurantName}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-semibold text-[var(--brand-accent-ink)]">
                ★ {rating.toFixed(1)}
              </span>
              <span>•</span>
              <span>{reviewCount} avaliações</span>
            </div>
          </div>
        </div>

        <div
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm ${statusClassName}`}
        >
          {restaurantStatusLabel}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs text-zinc-500">
        <span className="rounded-full border border-[var(--brand-border)] bg-white px-3 py-1.5">
          ⌛ {restaurantStatusDetail}
        </span>
        <span className="rounded-full border border-[var(--brand-border)] bg-white px-3 py-1.5">
          📍 {deliveryFeeLabel}
        </span>
        <span className="rounded-full border border-[var(--brand-border)] bg-white px-3 py-1.5">
          📱 Checkout com confirmação rápida
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-[18px] border border-[var(--brand-border)] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f7fa_100%)] px-3.5 py-3 focus-within:border-[var(--brand-primary)] focus-within:shadow-[0_0_0_4px_rgba(0,122,204,0.12)]">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar no cardápio..."
          className="w-full bg-transparent text-base text-[var(--brand-ink)] outline-none placeholder:text-zinc-400"
        />
      </div>

      <div className="font-ui-mono pb-4 text-[11px] uppercase tracking-[0.02em] text-zinc-400">
        Restaurante / {slug}
      </div>
    </header>
  );
}
