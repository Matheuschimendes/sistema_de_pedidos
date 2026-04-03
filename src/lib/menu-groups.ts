import { Product, ProductGroup } from "@/src/types/menu";

export const comboCategory = "Combos";

export function normalizeMenuText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesProductSearch(product: Product, search: string) {
  const normalizedSearch = normalizeMenuText(search);

  if (!normalizedSearch) return true;

  const content = normalizeMenuText(
    [product.name, product.description, product.category].join(" ")
  );

  return content.includes(normalizedSearch);
}

export function buildProductGroups(
  products: Product[],
  categories: string[]
): ProductGroup[] {
  return categories
    .filter((category) => category !== "Todos" && category !== comboCategory)
    .reduce<ProductGroup[]>((groups, category) => {
      const items = products.filter((product) => product.category === category);

      if (items.length === 0) {
        return groups;
      }

      const coverProduct = items.find((item) => item.image) ?? items[0];
      const previewNames = items.slice(0, 3).map((item) => item.name);
      const remainingCount = items.length - previewNames.length;
      const baseDescription = `${items.length} ${
        items.length === 1 ? "opção disponível" : "opções disponíveis"
      }`;
      const previewDescription =
        remainingCount > 0
          ? `${previewNames.join(", ")} e mais ${remainingCount}.`
          : `${previewNames.join(", ")}.`;

      groups.push({
        id: category,
        category,
        name: category,
        description: `${baseDescription}: ${previewDescription}`,
        priceFrom: Math.min(...items.map((item) => item.price)),
        itemCount: items.length,
        emoji: coverProduct.emoji,
        image: coverProduct.image,
        items,
      });

      return groups;
    }, []);
}

export function matchesProductGroupSearch(
  group: ProductGroup,
  search: string
) {
  const normalizedSearch = normalizeMenuText(search);

  if (!normalizedSearch) return true;

  const content = normalizeMenuText(
    [group.name, group.description, group.category].join(" ")
  );

  if (content.includes(normalizedSearch)) {
    return true;
  }

  return group.items.some((item) => matchesProductSearch(item, search));
}
