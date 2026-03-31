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
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-4">
      <Link
        href={`/${slug}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-base text-zinc-500"
      >
        ←
      </Link>

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

      <div className="min-w-0">
        <div className="text-base font-semibold text-zinc-900">
          Finalizar pedido
        </div>
        <div className="truncate text-sm text-zinc-500">
          {restaurantName}
        </div>
      </div>
    </div>
  );
}
