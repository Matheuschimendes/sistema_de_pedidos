type CategoryChipsProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export function CategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto px-4 pb-3 pt-3">
      {categories.map((category) => {
        const active = selectedCategory === category;

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${active
              ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-[0_12px_22px_rgba(0,115,230,0.18)]"
              : "border-[var(--brand-border)] bg-white text-zinc-500 hover:border-[var(--brand-primary)]/25 hover:text-[var(--brand-primary)]"
              }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
