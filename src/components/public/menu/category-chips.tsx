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
            className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${active
              ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
              : "border-zinc-200 bg-zinc-100 text-zinc-500"
              }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
