export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
};

export type Cart = Record<number, number>;
