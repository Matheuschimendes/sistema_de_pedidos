import { Product } from "@/src/types/menu";

export const menuProducts: Product[] = [
  {
    id: 1,
    name: "X-Burguer Artesanal",
    description: "Pão brioche, blend 180g, queijo cheddar, alface e tomate",
    price: 32,
    category: "Lanches",
    emoji: "🍔",
  },
  {
    id: 2,
    name: "X-Bacon Especial",
    description: "Blend 200g, bacon crocante, queijo gouda, molho especial",
    price: 38,
    category: "Lanches",
    emoji: "🍔",
  },
  {
    id: 3,
    name: "Pizza Margherita",
    description: "Molho de tomate, mussarela fresca, manjericão e azeite",
    price: 42,
    category: "Pizzas",
    emoji: "🍕",
  },
  {
    id: 4,
    name: "Pizza Quatro Queijos",
    description: "Mussarela, provolone, parmesão e gorgonzola",
    price: 48,
    category: "Pizzas",
    emoji: "🍕",
  },
  {
    id: 5,
    name: "Salada Caesar",
    description: "Alface romana, croutons crocantes, parmesão e molho caesar",
    price: 32,
    category: "Saladas",
    emoji: "🥗",
  },
  {
    id: 6,
    name: "Coca-Cola Lata",
    description: "350ml gelada",
    price: 7.5,
    category: "Bebidas",
    emoji: "🥤",
  },
  {
    id: 7,
    name: "Suco Natural",
    description: "Laranja, limão ou maracujá — 400ml",
    price: 12,
    category: "Bebidas",
    emoji: "🧃",
  },
];

export const menuCategories = [
  "Todos",
  "Lanches",
  "Pizzas",
  "Saladas",
  "Bebidas",
];
