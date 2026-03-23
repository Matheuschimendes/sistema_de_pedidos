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
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
      <Link
        href={`/${slug}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500"
      >
        ←
      </Link>

      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {restaurantLogo ? (
          <Image
            src={restaurantLogo}
            alt={`Logo do restaurante ${restaurantName}`}
            fill
            sizes="36px"
            className="object-contain p-1.5"
          />
        ) : (
          <span className="text-xs font-semibold text-zinc-900">
            {restaurantInitials}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-900">
          Finalizar pedido
        </div>
        <div className="truncate text-[11px] text-zinc-400">
          {restaurantName}
        </div>
      </div>
    </div>
  );
}
