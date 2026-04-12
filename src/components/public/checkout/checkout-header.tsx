import Image from "next/image";
import Link from "next/link";
import { getNameInitials } from "@/src/lib/get-name-initials";

type CheckoutHeaderProps = {
  slug: string;
  restaurantName: string;
  restaurantLogo?: string;
};

export function CheckoutHeader({
  slug,
  restaurantName,
  restaurantLogo,
}: CheckoutHeaderProps) {
  const restaurantInitials = getNameInitials(restaurantName);

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--brand-border)]/75 bg-white/92 px-4 py-4 backdrop-blur-xl">
      <Link
        href={`/${slug}`}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--brand-border)] bg-white text-base text-zinc-500 shadow-sm"
      >
        ←
      </Link>

      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-[var(--brand-border)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
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

      <div className="min-w-0">
        <div className="font-ui-mono text-[11px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
          Checkout
        </div>
        <div className="text-base font-semibold text-[var(--brand-ink)]">
          Finalizar pedido
        </div>
        <div className="truncate text-sm text-zinc-500">
          {restaurantName}
        </div>
      </div>
    </div>
  );
}
