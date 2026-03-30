import Image from "next/image";
import { getNameInitials } from "@/src/lib/get-name-initials";
import { RestaurantBusinessTone } from "@/src/types/restaurant";

type MenuHeroBannerProps = {
  restaurantName: string;
  restaurantLogo?: string;
  bannerImage?: string;
  restaurantStatusLabel: string;
  restaurantStatusDetail: string;
  restaurantStatusTone: RestaurantBusinessTone;
};

export function MenuHeroBanner({
  restaurantName,
  restaurantLogo,
  bannerImage,
  restaurantStatusLabel,
  restaurantStatusDetail,
  restaurantStatusTone,
}: MenuHeroBannerProps) {
  const restaurantInitials = getNameInitials(restaurantName);
  const statusClassName =
    restaurantStatusTone === "open"
      ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--brand-ink)]"
      : restaurantStatusTone === "closed"
        ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent-ink)]"
        : "border-zinc-200 bg-white/70 text-zinc-700";

  return (
    <section className="pb-3">
      <div className="relative h-40 w-full overflow-hidden bg-zinc-200">
        <Image
          src={bannerImage ?? "/brand/banner.svg"}
          alt={`Banner do restaurante ${restaurantName}`}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-[var(--brand-ink)] opacity-60" />
      </div>
    </section>
  );
}
