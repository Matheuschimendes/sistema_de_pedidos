"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Star, Clock3, Truck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getRestaurantBusinessStatus } from "@/src/lib/get-restaurant-business-status";
import { matchesProductSearch } from "@/src/lib/menu-groups";
import { useCart } from "@/src/hooks/use-cart";
import { Cart, Product } from "@/src/types/menu";
import { RestaurantProfile } from "@/src/types/restaurant";
import { getCartStorageKey } from "@/src/lib/storage-keys";
import { formatBRL } from "@/src/lib/format";
import { getNameInitials } from "@/src/lib/get-name-initials";

type PublicMenuPageClientProps = {
  slug: string;
  restaurant: RestaurantProfile;
  products: Product[];
  categories: string[];
};

type MenuSection = {
  category: string;
  items: Product[];
};

type ProductCardProps = {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onDecrease: () => void;
};

type CartBarProps = {
  totalItems: number;
  subtotal: number;
  onOpenCart: () => void;
};

type CartDrawerProps = {
  open: boolean;
  items: Product[];
  cart: Cart;
  subtotal: number;
  deliveryFee: number;
  deliveryFeeToCombine?: boolean;
  total: number;
  slug: string;
  onClose: () => void;
  onClear: () => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
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

  const normalizedCategories = useMemo(() => {
    const incoming = Array.from(
      new Set(categories.map((category) => category.trim()).filter(Boolean)),
    );

    return incoming.includes("Todos") ? incoming : ["Todos", ...incoming];
  }, [categories]);

  const menuCategories = useMemo(
    () => normalizedCategories.filter((category) => category !== "Todos"),
    [normalizedCategories],
  );

  const categoryProductCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const category of menuCategories) {
      counts.set(category, 0);
    }

    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }

    return counts;
  }, [menuCategories, products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "Todos" || product.category === selectedCategory;
        const matchesSearch = matchesProductSearch(product, search);

        return matchesCategory && matchesSearch;
      })
      .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
  }, [products, search, selectedCategory]);

  const sections = useMemo<MenuSection[]>(() => {
    const categoriesToShow = selectedCategory === "Todos" ? menuCategories : [selectedCategory];

    return categoriesToShow
      .map((category) => ({
        category,
        items: filteredProducts.filter((item) => item.category === category),
      }))
      .filter((section) => section.items.length > 0);
  }, [filteredProducts, menuCategories, selectedCategory]);

  const deliveryFeeToCombine = /combinar/i.test(restaurant.deliveryTime ?? "");
  const deliveryFeeLabel = deliveryFeeToCombine
    ? "Taxa a combinar"
    : restaurant.deliveryFee && restaurant.deliveryFee > 0
      ? `Taxa ${formatBRL(restaurant.deliveryFee)}`
      : "Taxa grátis";

  const restaurantInitials = getNameInitials(restaurant.name);
  const visibleProductsLabel =
    filteredProducts.length === 1
      ? "1 item encontrado"
      : `${filteredProducts.length} itens encontrados`;
  const cartSummaryLabel =
    totalItems > 0
      ? `${totalItems} ${totalItems === 1 ? "item" : "itens"} • ${formatBRL(subtotal)}`
      : "Carrinho vazio";

  return (
    <main className="min-h-screen bg-zinc-100 px-2 py-2 md:px-4 md:py-4">
      <div className="mx-auto grid w-full max-w-[1220px] gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-sm md:sticky md:top-4 md:flex">
          <div className="border-b border-zinc-200 px-4 py-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50">
                {restaurant.logo ? (
                  <Image
                    src={restaurant.logo}
                    alt={`Logo ${restaurant.name}`}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                ) : (
                  <span className="text-xl font-semibold text-zinc-900">
                    {restaurantInitials}
                  </span>
                )}
              </div>

              <h1 className="mt-3 line-clamp-2 text-base font-semibold leading-5 text-zinc-900">
                {restaurant.name}
              </h1>
              <p className="mt-1 line-clamp-3 text-xs leading-4 text-zinc-500">
                {restaurant.description ?? "Catálogo online"}
              </p>

              <div
                className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  restaurantBusinessStatus.tone === "open"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : restaurantBusinessStatus.tone === "closed"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600"
                }`}
              >
                {restaurantBusinessStatus.label}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-zinc-600">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span>
                  {(restaurant.rating ?? 0).toFixed(1)} ({restaurant.reviewCount ?? 0})
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5">
                <Clock3 className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                <span>{restaurant.deliveryTime ?? "Entrega rápida"}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5">
                <Truck className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                <span>{deliveryFeeLabel}</span>
              </div>
            </div>
          </div>

          <div className="px-4 pt-4 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
            Categorias
          </div>

          <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
            {normalizedCategories.map((category) => {
              const active = selectedCategory === category;
              const totalByCategory =
                category === "Todos" ? products.length : categoryProductCounts.get(category) ?? 0;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-zinc-900 font-semibold text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <span className="truncate">{category}</span>
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
                      active ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {totalByCategory}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-sm">
          <header className="border-b border-zinc-200 px-4 pb-4 pt-4 md:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50">
                  {restaurant.logo ? (
                    <Image
                      src={restaurant.logo}
                      alt={`Logo ${restaurant.name}`}
                      fill
                      sizes="48px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-[var(--brand-ink)]">
                      {restaurantInitials}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-base font-semibold text-[var(--brand-ink)]">
                    {restaurant.name}
                  </h1>
                  <div className="mt-0.5 line-clamp-2 text-sm text-zinc-500">
                    {restaurant.description ?? "Catálogo online"}
                  </div>
                </div>
              </div>

              <div
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                  restaurantBusinessStatus.tone === "open"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : restaurantBusinessStatus.tone === "closed"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600"
                }`}
              >
                {restaurantBusinessStatus.label}
              </div>
            </div>
          </header>

          <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white px-4 py-3">
            <div className="flex gap-2">
              <label className="flex flex-1 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2.5">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full bg-transparent text-sm text-[var(--brand-ink)] outline-none placeholder:text-zinc-400"
                />
              </label>

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className={`hidden min-w-[140px] items-center justify-center rounded-md border px-3 text-xs font-semibold transition md:inline-flex ${
                  totalItems > 0
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-zinc-100 text-zinc-500"
                }`}
              >
                {cartSummaryLabel}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
              <span>Cardápio de produtos</span>
              <span>{visibleProductsLabel}</span>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
              {normalizedCategories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 text-zinc-600"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="flex-1 space-y-6 overflow-y-auto px-4 pb-28 pt-4 md:px-5 md:pb-8 md:pt-5">
            {sections.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
                Nenhum produto encontrado para o filtro informado.
              </div>
            ) : (
              sections.map((section) => (
                <div key={section.category} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.02em] text-[var(--brand-ink)]">
                      {section.category}
                    </h2>
                    <span className="text-xs text-zinc-400">{section.items.length} item(ns)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {section.items.map((product) => (
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
        </section>
      </div>

      <CartBar totalItems={totalItems} subtotal={subtotal} onOpenCart={() => setDrawerOpen(true)} />

      <CartDrawer
        open={drawerOpen}
        items={cartItems}
        cart={cart}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        deliveryFeeToCombine={deliveryFeeToCombine}
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
    </main>
  );
}

function ProductCard({ product, quantity, onAdd, onDecrease }: ProductCardProps) {
  const badgeLabel = product.badge ?? (product.featured ? "Destaque" : null);

  return (
    <div
      className={`overflow-hidden rounded-[14px] border bg-white transition ${
        product.featured ? "border-zinc-400" : "border-zinc-200"
      }`}
    >
      <div className="relative h-24 w-full bg-zinc-100 md:h-28">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">
            {product.emoji}
          </div>
        )}

        {badgeLabel ? (
          <div className="absolute left-2.5 top-2 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
            {badgeLabel}
          </div>
        ) : null}
      </div>

      <div className="p-2.5">
        <div className="line-clamp-2 min-h-[2.4rem] text-[13px] font-semibold leading-[1.2rem] text-[var(--brand-ink)]">
          {product.name}
        </div>

        <div className="mt-1 line-clamp-2 min-h-[2rem] text-[11px] leading-4 text-zinc-500">
          {product.description || "Produto disponível para pedido."}
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="text-sm font-semibold text-zinc-900">{formatBRL(product.price)}</div>

          {quantity <= 0 ? (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Adicionar ${product.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-lg font-semibold text-white transition hover:bg-zinc-800"
            >
              +
            </button>
          ) : (
            <div className="grid grid-cols-[28px_30px_28px] items-center overflow-hidden rounded-full border border-zinc-300 bg-white">
              <button
                type="button"
                onClick={onDecrease}
                aria-label={`Remover uma unidade de ${product.name}`}
                className="flex h-7 items-center justify-center text-base text-zinc-700"
              >
                −
              </button>

              <div className="text-center text-xs font-semibold text-[var(--brand-ink)]">
                {quantity}
              </div>

              <button
                type="button"
                onClick={onAdd}
                aria-label={`Adicionar mais uma unidade de ${product.name}`}
                className="flex h-7 items-center justify-center bg-zinc-900 text-base text-white"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartBar({ totalItems, subtotal, onOpenCart }: CartBarProps) {
  if (totalItems <= 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white to-transparent px-3 pb-3 pt-6 md:hidden">
      <div className="mx-auto w-full max-w-[1220px]">
        <button
          onClick={onOpenCart}
          className="pointer-events-auto flex w-full items-center justify-between rounded-[12px] bg-zinc-900 px-4 py-3 text-left shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/20 text-xs font-semibold text-white">
              {totalItems}
            </div>
            <div className="text-sm font-semibold text-white">Ver carrinho e finalizar</div>
          </div>

          <div className="text-base font-semibold text-[var(--brand-accent)]">
            {formatBRL(subtotal)}
          </div>
        </button>
      </div>
    </div>
  );
}

function CartDrawer({
  open,
  items,
  cart,
  subtotal,
  deliveryFee,
  deliveryFeeToCombine = false,
  total,
  slug,
  onClose,
  onClear,
  onIncrease,
  onDecrease,
}: CartDrawerProps) {
  const itemCountLabel =
    items.length === 1 ? "1 item no pedido" : `${items.length} itens no pedido`;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[760px] rounded-t-[18px] border border-zinc-200 bg-white transition-transform duration-300 md:inset-y-0 md:left-auto md:right-0 md:mx-0 md:max-w-[420px] md:rounded-none md:border-l md:border-r-0 md:border-t-0 ${
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-full md:translate-y-0"
        }`}
      >
        <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <div className="text-lg font-semibold text-zinc-900">Seu carrinho</div>
            <div className="mt-1 text-sm text-zinc-500">
              {itemCountLabel}. Revise os itens antes de seguir para o checkout.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-base text-zinc-500"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[56vh] overflow-y-auto px-5 py-4 md:max-h-[calc(100vh-220px)]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3.5 border-b border-zinc-200 py-4 last:border-b-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-zinc-100 text-lg">
                {item.emoji}
              </div>

              <div className="flex-1">
                <div className="text-base font-medium leading-6 text-zinc-900">
                  {item.name}
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  {formatBRL(item.price)} cada
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDecrease(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-zinc-300 bg-white text-base text-zinc-700"
                >
                  −
                </button>

                <span className="min-w-5 text-center text-base font-semibold text-zinc-900">
                  {cart[item.id]}
                </span>

                <button
                  onClick={() => onIncrease(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-zinc-900 text-base text-white"
                >
                  +
                </button>
              </div>

              <div className="w-20 text-right text-base font-semibold text-zinc-900">
                {formatBRL(item.price * (cart[item.id] || 0))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-200 px-5 py-4">
          {items.length > 0 ? (
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Limpar carrinho
              </button>
            </div>
          ) : null}

          <div className="mb-1.5 flex justify-between text-sm text-zinc-500">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>

          <div className="mb-1.5 flex justify-between text-sm text-zinc-500">
            <span>Taxa de entrega</span>
            <span>{deliveryFeeToCombine ? "A combinar" : formatBRL(deliveryFee)}</span>
          </div>

          <div className="mb-4 flex justify-between text-xl font-semibold text-zinc-900">
            <span>{deliveryFeeToCombine ? "Total parcial" : "Total"}</span>
            <span className="text-zinc-900">{formatBRL(total)}</span>
          </div>

          <Link
            href={`/${slug}/checkout`}
            className="block w-full rounded-[12px] bg-zinc-900 px-4 py-3.5 text-center text-base font-semibold text-white transition hover:bg-zinc-800"
          >
            Continuar para checkout →
          </Link>
        </div>
      </div>
    </>
  );
}
