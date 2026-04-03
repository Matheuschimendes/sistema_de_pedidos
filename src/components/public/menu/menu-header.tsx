import Image from "next/image";
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

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-100 bg-white px-4 pb-0 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {restaurantLogo ? (
              <Image
                src={restaurantLogo}
                alt={`Logo do restaurante ${restaurantName}`}
                fill
                sizes="44px"
                className="object-contain p-1.5"
              />
            ) : (
              <span className="text-base font-semibold text-zinc-900">
                {restaurantInitials}
              </span>
            )}
          </div>

          <div>
            <div className="text-base font-semibold text-zinc-900">
              {restaurantName}
            </div>
            <div className="text-xs font-medium text-[var(--brand-accent)]">
              ★ {rating.toFixed(1)} · {reviewCount} avaliações
            </div>
          </div>
        </div>

        <div
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${statusClassName}`}
        >
          {restaurantStatusLabel}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-500">
        <span>⌛ {restaurantStatusDetail}</span>
        <span>·</span>
        <span>📍 Taxa R$ {deliveryFee.toFixed(2).replace(".", ",")}</span>
        <span>·</span>
        <span>📱 Pedido pelo app com confirmação rápida</span>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary-soft)]">
        <span className="text-base text-zinc-400">🔍</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar no cardápio..."
          className="w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400"
        />
      </div>

      <div className="pb-3 text-xs text-zinc-500">
        Restaurante: {slug}
      </div>
    </header>
  );
}
