import Image from "next/image";
import { getNameInitials } from "@/src/lib/get-name-initials";
import { RestaurantBusinessTone } from "@/src/types/restaurant";

type MenuHeaderProps = {
  restaurantName: string;
  restaurantLogo?: string;
  restaurantStatusLabel: string;
  restaurantStatusDetail: string;
  restaurantStatusTone: RestaurantBusinessTone;
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
  slug,
  search,
  onSearchChange,
}: MenuHeaderProps) {
  const restaurantInitials = getNameInitials(restaurantName);
  const statusClassName =
    restaurantStatusTone === "open"
      ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--brand-ink)]"
      : restaurantStatusTone === "closed"
        ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent-ink)]"
        : "border-zinc-200 bg-zinc-100 text-zinc-700";

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-100 bg-white px-4 pb-0 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {restaurantLogo ? (
              <Image
                src={restaurantLogo}
                alt={`Logo do restaurante ${restaurantName}`}
                fill
                sizes="40px"
                className="object-contain p-1.5"
              />
            ) : (
              <span className="text-sm font-semibold text-zinc-900">
                {restaurantInitials}
              </span>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold text-zinc-900">
              {restaurantName}
            </div>
            <div className="text-[10px] text-[var(--brand-accent)]">
              ★ 4.8 · 312 avaliações
            </div>
          </div>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${statusClassName}`}
        >
          {restaurantStatusLabel}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 text-[10px] text-zinc-400">
        <span>⌛ {restaurantStatusDetail}</span>
        <span>·</span>
        <span>📍 Taxa R$ 5,00</span>
        <span>·</span>
        <span>📱 Pedido pelo app</span>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary-soft)]">
        <span className="text-sm text-zinc-400">🔍</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar no cardápio..."
          className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        />
      </div>

      <div className="pb-2 text-[11px] text-zinc-400">
        Restaurante: {slug}
      </div>
    </header>
  );
}
