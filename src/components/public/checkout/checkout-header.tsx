import Link from "next/link";

type CheckoutHeaderProps = {
  slug: string;
};

export function CheckoutHeader({ slug }: CheckoutHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
      <Link
        href={`/${slug}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500"
      >
        ←
      </Link>

      <div>
        <div className="text-sm font-semibold text-zinc-900">
          Finalizar pedido
        </div>
        <div className="text-[11px] text-zinc-400">Cozinha da Serra</div>
      </div>
    </div>
  );
}