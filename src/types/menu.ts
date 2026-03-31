export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji?: string;
  image?: string;
  badge?: string;
  featured?: boolean;
};

export type Cart = Record<number, number>;

export type MenuCategory = {
  id: string;
  name: string;
  image: string;
};
