import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
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
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-black/8 bg-[#f2f2f3]/95 px-4 py-3.5 backdrop-blur-xl sm:px-5">
      <Link
        href={`/${slug}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-zinc-300 bg-white text-base text-zinc-500 transition hover:text-zinc-900"
      >
        ←
      </Link>

      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-zinc-300 bg-white">
        {restaurantLogo ? (
          <Image
            src={restaurantLogo}
            alt={`Logo do restaurante ${restaurantName}`}
            fill
            sizes="40px"
            className="object-contain p-1"
          />
        ) : (
          <span className="text-sm font-semibold text-zinc-900">
            {restaurantInitials}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <div className="font-ui-mono text-[10px] uppercase tracking-[0.06em] text-[#1688e8]">
            Checkout
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
            <ShieldCheck className="h-3 w-3" />
            Seguro
          </span>
        </div>
        <div className="text-[15px] font-semibold text-zinc-900">
          Finalizar pedido
        </div>
        <div className="truncate text-[13px] text-zinc-600">
          {restaurantName}
        </div>
      </div>
    </div>
  );
}
