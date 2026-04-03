"use client";

import { useEffect, useMemo, useState } from "react";
import { MenuHeader } from "@/src/components/public/menu/menu-header";
import { CategoryChips } from "@/src/components/public/menu/category-chips";
import { ProductCard } from "@/src/components/public/menu/product-card";
import { ProductGroupCard } from "@/src/components/public/menu/product-group-card";
import { ProductGroupDrawer } from "@/src/components/public/menu/product-group-drawer";
import { CartBar } from "@/src/components/public/menu/cart-bar";
import { CartDrawer } from "@/src/components/public/menu/cart-drawer";
import { getRestaurantBusinessStatus } from "@/src/lib/get-restaurant-business-status";
import {
  buildProductGroups,
  comboCategory,
  matchesProductGroupSearch,
  matchesProductSearch,
} from "@/src/lib/menu-groups";
import { useCart } from "@/src/hooks/use-cart";
import { MenuHeroBanner } from "@/src/components/public/menu/menu-hero-banner";
import { MenuInfoCarousel } from "@/src/components/public/menu/menu-info-carousel";
import { Product, ProductGroup } from "@/src/types/menu";
import { RestaurantProfile } from "@/src/types/restaurant";
import { getCartStorageKey } from "@/src/lib/storage-keys";

type PublicMenuPageClientProps = {
  slug: string;
  restaurant: RestaurantProfile;
  products: Product[];
  categories: string[];
};

export function PublicMenuPageClient({
  slug,
  restaurant,
  products,
  categories,
}: PublicMenuPageClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

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
    clearCart,
  } = useCart({
    products,
    deliveryFee: restaurant.deliveryFee ?? 0,
    storageKey: getCartStorageKey(slug),
  });

  const productGroups = useMemo(() => {
    return buildProductGroups(products, categories);
  }, [categories, products]);

  const comboProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" || selectedCategory === comboCategory;
      const matchesSearch = matchesProductSearch(product, search);

      return (
        product.category === comboCategory && matchesCategory && matchesSearch
      );
    });
  }, [products, search, selectedCategory]);

  const filteredProductGroups = useMemo(() => {
    return productGroups.filter((group) => {
      const matchesCategory =
        selectedCategory === "Todos" || group.category === selectedCategory;
      const matchesSearch = matchesProductGroupSearch(group, search);

      return matchesCategory && matchesSearch;
    });
  }, [productGroups, search, selectedCategory]);

  const hasResults =
    comboProducts.length > 0 || filteredProductGroups.length > 0;

  return (
    <main className="min-h-screen bg-zinc-100">
      <MenuHeroBanner
        restaurantName={restaurant.name}
        restaurantLogo={restaurant.logo}
        bannerImage={restaurant.bannerImage}
        restaurantStatusLabel={restaurantBusinessStatus.label}
        restaurantStatusDetail={restaurantBusinessStatus.detail}
        restaurantStatusTone={restaurantBusinessStatus.tone}
      />
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-white">
        <MenuHeader
          restaurantName={restaurant.name}
          restaurantLogo={restaurant.logo}
          restaurantStatusLabel={restaurantBusinessStatus.label}
          restaurantStatusDetail={restaurantBusinessStatus.detail}
          restaurantStatusTone={restaurantBusinessStatus.tone}
          rating={restaurant.rating ?? 0}
          reviewCount={restaurant.reviewCount ?? 0}
          deliveryFee={restaurant.deliveryFee ?? 0}
          slug={slug}
          search={search}
          onSearchChange={setSearch}
        />

        <MenuInfoCarousel
          deliveryFee={deliveryFee}
          restaurantName={restaurant.name}
          deliveryTime={restaurant.deliveryTime}
        />

        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <section className="flex-1 space-y-6 px-4 pb-24 pt-4">
          {!hasResults ? (
            <div className="rounded-2xl border border-zinc-100 bg-white p-7 text-center text-base text-zinc-500 shadow-sm">
              Nenhum item encontrado.
            </div>
          ) : (
            <>
              {comboProducts.length > 0 ? (
                <div>
                  <div className="mb-3 border-b border-zinc-100 pb-2 text-base font-semibold text-zinc-900">
                    {comboCategory}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {comboProducts.map((product) => (
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
              ) : null}

              {filteredProductGroups.length > 0 ? (
                <div>
                  {selectedCategory === "Todos" ? (
                    <div className="mb-3 border-b border-zinc-100 pb-2 text-base font-semibold text-zinc-900">
                      Produtos
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4">
                    {filteredProductGroups.map((group) => (
                      <ProductGroupCard
                        key={group.id}
                        group={group}
                        onOpen={() => {
                          setDrawerOpen(false);
                          setSelectedGroup(group);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        <ProductGroupDrawer
          open={Boolean(selectedGroup)}
          group={selectedGroup}
          cart={cart}
          onClose={() => setSelectedGroup(null)}
          onIncrease={(id) => addToCart(id)}
          onDecrease={(id) => changeQty(id, -1)}
        />

        <CartBar
          totalItems={totalItems}
          subtotal={subtotal}
          onOpenCart={() => {
            setSelectedGroup(null);
            setDrawerOpen(true);
          }}
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
          onClear={() => {
            clearCart();
            setDrawerOpen(false);
          }}
          onIncrease={(id) => addToCart(id)}
          onDecrease={(id) => changeQty(id, -1)}
        />
      </div>
    </main>
  );
}
