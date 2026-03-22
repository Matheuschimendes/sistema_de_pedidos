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
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-3">
      {categories.map((category) => {
        const active = selectedCategory === category;

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${active
                ? "border-zinc-900 bg-zinc-900 text-white"
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