import Image from "next/image";
import { formatBRL } from "@/src/lib/format";
import { Cart, ProductGroup } from "@/src/types/menu";

type ProductGroupDrawerProps = {
  open: boolean;
  group: ProductGroup | null;
  cart: Cart;
  onClose: () => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
};

export function ProductGroupDrawer({
  open,
  group,
  cart,
  onClose,
  onIncrease,
  onDecrease,
}: ProductGroupDrawerProps) {
  const itemCountLabel = group
    ? group.itemCount === 1
      ? "1 item disponível"
      : `${group.itemCount} itens disponíveis`
    : "";

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 transition ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed bottom-0 left-1/2 z-[60] w-full max-w-[520px] -translate-x-1/2 rounded-t-[30px] border border-[var(--brand-border)]/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] transition duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-[var(--brand-border)]/75 px-5 py-4">
          <div>
            <div className="text-lg font-semibold text-[var(--brand-ink)]">
              {group?.name ?? "Produtos"}
            </div>
            <div className="mt-1 text-sm text-zinc-500">
              {group?.description ?? "Escolha os itens para adicionar ao pedido."}
            </div>
            {group ? (
              <div className="font-ui-mono mt-2 text-[11px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
                {itemCountLabel} · A partir de {formatBRL(group.priceFrom)}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-border)] bg-white text-base text-zinc-500 shadow-sm"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {group?.items.map((item) => {
            const quantity = cart[item.id] || 0;

            return (
              <div
                key={item.id}
                className="border-b border-[var(--brand-border)]/70 py-4 last:border-b-0"
              >
                <div className="flex gap-3.5">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[var(--brand-canvas)] text-2xl">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      item.emoji ?? "🍽️"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-base font-medium leading-6 text-[var(--brand-ink)]">
                      {item.name}
                    </div>
                    <div className="mt-1 text-sm text-zinc-500">
                      {item.description}
                    </div>
                    {item.additionalInfo ? (
                      <div className="mt-1 text-xs leading-5 text-zinc-400">
                        {item.additionalInfo}
                      </div>
                    ) : null}
                    <div className="mt-2 text-sm font-semibold text-[var(--brand-ink)]">
                      {formatBRL(item.price)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400">
                    {quantity > 0
                      ? `${quantity} no carrinho`
                      : "Toque para adicionar ao pedido"}
                  </div>

                  {quantity === 0 ? (
                    <button
                      type="button"
                      onClick={() => onIncrease(item.id)}
                      className="rounded-[14px] bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(0,115,230,0.16)]"
                    >
                      Adicionar
                    </button>
                  ) : (
                    <div className="grid grid-cols-[40px_1fr_40px] items-center overflow-hidden rounded-[16px] border border-[var(--brand-border)] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f7fa_100%)]">
                      <button
                        type="button"
                        onClick={() => onDecrease(item.id)}
                        aria-label={`Remover uma unidade de ${item.name}`}
                        className="flex h-10 items-center justify-center border-r border-[var(--brand-border)] bg-white text-lg text-zinc-700"
                      >
                        −
                      </button>

                      <div className="px-3 text-center text-sm font-semibold text-[var(--brand-ink)]">
                        {quantity}
                      </div>

                      <button
                        type="button"
                        onClick={() => onIncrease(item.id)}
                        aria-label={`Adicionar mais uma unidade de ${item.name}`}
                        className="flex h-10 items-center justify-center border-l border-[var(--brand-border)] bg-[var(--brand-primary)] text-lg text-white"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
