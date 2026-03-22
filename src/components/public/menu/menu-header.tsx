type MenuHeaderProps = {
  restaurantName: string;
  slug: string;
  search: string;
  onSearchChange: (value: string) => void;
};

export function MenuHeader({
  restaurantName,
  slug,
  search,
  onSearchChange,
}: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-100 bg-white px-4 pb-0 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white">
            C
          </div>

          <div>
            <div className="text-sm font-semibold text-zinc-900">
              {restaurantName}
            </div>
            <div className="text-[10px] text-amber-600">
              ★ 4.8 · 312 avaliações
            </div>
          </div>
        </div>

        <div className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[10px] font-semibold text-emerald-800">
          Aberto
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 text-[10px] text-zinc-400">
        <span>⌛ 30–50 min</span>
        <span>·</span>
        <span>📍 Taxa R$ 5,00</span>
        <span>·</span>
        <span>📱 Pedido pelo app</span>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
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