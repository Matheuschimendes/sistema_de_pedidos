"use client";

import { useMemo, useState } from "react";
import { Product, Cart } from "@/src/types/menu";

type UseCartParams = {
  products: Product[];
  deliveryFee?: number;
};

export function useCart({ products, deliveryFee = 5 }: UseCartParams) {
  const [cart, setCart] = useState<Cart>({});

  const addToCart = (id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const changeQty = (id: number, delta: number) => {
    setCart((prev) => {
      const nextQty = Math.max((prev[id] || 0) + delta, 0);
      const next = { ...prev };

      if (nextQty === 0) {
        delete next[id];
      } else {
        next[id] = nextQty;
      }

      return next;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((acc, qty) => acc + qty, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return products.reduce((acc, product) => {
      return acc + product.price * (cart[product.id] || 0);
    }, 0);
  }, [products, cart]);

  const total = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  const cartItems = useMemo(() => {
    return products.filter((product) => cart[product.id]);
  }, [products, cart]);

  return {
    cart,
    cartItems,
    totalItems,
    subtotal,
    deliveryFee,
    total,
    addToCart,
    changeQty,
    clearCart,
  };
}
