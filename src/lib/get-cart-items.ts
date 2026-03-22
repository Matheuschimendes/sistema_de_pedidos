import { Product, Cart } from "@/src/types/menu";

export function getCartFromStorage(storageKey = "mesa-cart"): Cart {
  if (typeof window === "undefined") return {};

  const savedCart = window.localStorage.getItem(storageKey);

  if (!savedCart) return {};

  try {
    return JSON.parse(savedCart);
  } catch {
    return {};
  }
}

export function getCartItemsFromProducts(products: Product[], cart: Cart) {
  return products
    .filter((product) => cart[product.id])
    .map((product) => ({
      id: product.id,
      name: product.name,
      quantity: cart[product.id],
      price: product.price,
    }));
}
