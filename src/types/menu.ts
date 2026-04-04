export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  additionalInfo?: string;
  isAvailable?: boolean;
  emoji?: string;
  image?: string;
  badge?: string;
  featured?: boolean;
};

export type ProductGroup = {
  id: string;
  category: string;
  name: string;
  description: string;
  priceFrom: number;
  itemCount: number;
  emoji?: string;
  image?: string;
  items: Product[];
};

export type Cart = Record<number, number>;

export type MenuCategory = {
  id: string;
  name: string;
  image: string;
};

export type AdminCategory = {
  id: string;
  name: string;
};

export type AdminCategorySummary = {
  name: string;
  count: number;
  availableCount: number;
  featuredCount: number;
};
