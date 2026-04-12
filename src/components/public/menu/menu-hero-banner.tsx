import Image from "next/image";
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
  bannerImage,
  restaurantStatusLabel,
}: MenuHeroBannerProps) {
  return (
    <section>
      <div className="relative h-44 w-full overflow-hidden border-b border-[var(--brand-border)]/70 bg-[var(--brand-canvas)]">
        <Image
          src={bannerImage ?? "/brand/banner.svg"}
          alt={`Banner do restaurante ${restaurantName}`}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,17,21,0.1)_0%,rgba(15,17,21,0.28)_56%,rgba(15,17,21,0.72)_100%)]" />
        <div className="absolute left-4 top-4 rounded-full border border-white/18 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          {restaurantStatusLabel}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="font-ui-mono text-[11px] uppercase tracking-[0.02em] text-white/72">
            Cardápio digital
          </div>
          <div className="mt-1 text-xl font-semibold text-white">
            {restaurantName}
          </div>
        </div>
      </div>
    </section>
  );
}
