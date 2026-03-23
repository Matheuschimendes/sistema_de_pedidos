"use client";

import { use, useEffect, useMemo, useState } from "react";
import { MenuHeader } from "@/src/components/public/menu/menu-header";
import { CategoryChips } from "@/src/components/public/menu/category-chips";
import { ProductCard } from "@/src/components/public/menu/product-card";
import { CartBar } from "@/src/components/public/menu/cart-bar";
import { CartDrawer } from "@/src/components/public/menu/cart-drawer";
import { menuProducts, menuCategories } from "@/src/data/menu-products";
import { getRestaurantBySlug } from "@/src/data/restaurants";
import { getRestaurantBusinessStatus } from "@/src/lib/get-restaurant-business-status";
import { useCart } from "@/src/hooks/use-cart";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default function PublicMenuPage({ params }: Props) {
  const { slug } = use(params);
  return <CardapioClient slug={slug} />;
}

function CardapioClient({ slug }: { slug: string }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const restaurant = useMemo(() => getRestaurantBySlug(slug), [slug]);
  const restaurantBusinessStatus = useMemo(() => {
    return getRestaurantBusinessStatus(restaurant, currentTime);
  }, [restaurant, currentTime]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const {
    cart,
    cartItems,
    totalItems,
    subtotal,
    deliveryFee,
    total,
    addToCart,
    changeQty,
  } = useCart({
    products: menuProducts,
    deliveryFee: 5,
  });

  const filteredProducts = useMemo(() => {
    return menuProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, typeof menuProducts> = {} as Record<
      string,
      typeof menuProducts
    >;

    filteredProducts.forEach((product) => {
      if (!groups[product.category]) groups[product.category] = [];
      groups[product.category].push(product);
    });

    return groups;
  }, [filteredProducts]);

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-white">
        <MenuHeader
          restaurantName={restaurant.name}
          restaurantLogo={restaurant.logo}
          restaurantStatusLabel={restaurantBusinessStatus.label}
          restaurantStatusDetail={restaurantBusinessStatus.detail}
          restaurantStatusTone={restaurantBusinessStatus.tone}
          slug={slug}
          search={search}
          onSearchChange={setSearch}
        />

        <CategoryChips
          categories={menuCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <section className="flex-1 space-y-5 px-4 pb-24 pt-3">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
              Nenhum item encontrado.
            </div>
          ) : (
            Object.entries(groupedProducts).map(([category, items]) => (
              <div key={category}>
                <div className="mb-3 border-b border-zinc-100 pb-2 text-sm font-semibold text-zinc-900">
                  {category}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={cart[product.id] || 0}
                      onAdd={() => addToCart(product.id)}
                      onDecrease={() => changeQty(product.id, -1)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        <CartBar
          totalItems={totalItems}
          subtotal={subtotal}
          onOpenCart={() => setDrawerOpen(true)}
        />

        <CartDrawer
          open={drawerOpen}
          items={cartItems}
          cart={cart}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          slug={slug}
          onClose={() => setDrawerOpen(false)}
          onIncrease={(id) => addToCart(id)}
          onDecrease={(id) => changeQty(id, -1)}
        />
      </div>
    </main>
  );
}
