"use client";

import Image from "next/image";
import { Search, Star, Clock3, Truck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createOrderAction } from "@/src/app/(public)/[slug]/checkout/actions";
import { getRestaurantBusinessStatus } from "@/src/lib/get-restaurant-business-status";
import { matchesProductSearch } from "@/src/lib/menu-groups";
import { useCart } from "@/src/hooks/use-cart";
import { Cart, Product } from "@/src/types/menu";
import { DeliveryType, PaymentMethod } from "@/src/types/checkout";
import { RestaurantProfile } from "@/src/types/restaurant";
import { getCartStorageKey } from "@/src/lib/storage-keys";
import { formatBRL } from "@/src/lib/format";
import { getNameInitials } from "@/src/lib/get-name-initials";
import { normalizePhoneNumber } from "@/src/lib/order-presentation";

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

type SidebarStep = "cart" | "address" | "checkout" | "success";
type DrawerCustomerField = "name" | "phone" | "address";
type DrawerCustomerErrors = Partial<Record<DrawerCustomerField, string>>;

type DrawerCustomer = {
  name: string;
  phone: string;
  address: string;
  notes: string;
};

const EMPTY_DRAWER_CUSTOMER: DrawerCustomer = {
  name: "",
  phone: "",
  address: "",
  notes: "",
};

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateDrawerCustomer(
  customer: DrawerCustomer,
  deliveryType: DeliveryType,
) {
  const errors: DrawerCustomerErrors = {};

  if (customer.name.trim().length < 2) {
    errors.name = "Informe seu nome completo.";
  }

  const normalizedPhone = normalizePhoneNumber(customer.phone);
  const hasValidWhatsapp =
    normalizedPhone.startsWith("55") &&
    (normalizedPhone.length === 12 || normalizedPhone.length === 13);

  if (!hasValidWhatsapp) {
    errors.phone = "Informe um WhatsApp valido com DDD.";
  }

  if (deliveryType === "delivery" && customer.address.trim().length < 8) {
    errors.address = "Preencha o endereco de entrega.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

function getFirstDrawerErrorField(errors: DrawerCustomerErrors) {
  if (errors.name) {
    return "name";
  }

  if (errors.phone) {
    return "phone";
  }

  if (errors.address) {
    return "address";
  }

  return null;
}

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
            <div className="text-sm font-semibold text-white">Ver sacola e avancar</div>
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
  const [step, setStep] = useState<SidebarStep>("cart");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [customer, setCustomer] = useState<DrawerCustomer>(EMPTY_DRAWER_CUSTOMER);
  const [customerErrors, setCustomerErrors] = useState<DrawerCustomerErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  const checkoutItems = useMemo(() => {
    return items
      .map((item) => ({
        id: item.id,
        quantity: cart[item.id] || 0,
      }))
      .filter((item) => item.quantity > 0);
  }, [cart, items]);

  const uniqueItemsLabel =
    checkoutItems.length === 1
      ? "1 produto na sacola"
      : `${checkoutItems.length} produtos na sacola`;
  const totalUnits = checkoutItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalUnitsLabel = totalUnits === 1 ? "1 item" : `${totalUnits} itens`;
  const stepTitle =
    step === "address"
      ? "Endereco"
      : step === "checkout"
      ? "Finalizar pedido"
      : step === "success"
        ? "Pedido confirmado"
        : "Sua Sacola";
  const sidebarDeliveryFee = deliveryType === "delivery" ? deliveryFee : 0;
  const sidebarTotal = subtotal + sidebarDeliveryFee;
  const checkoutFlowSteps: Array<{ id: "address" | "checkout"; label: string }> = [
    { id: "address", label: "Endereco" },
    { id: "checkout", label: "Dados e pagamento" },
  ];
  const currentCheckoutStepIndex = checkoutFlowSteps.findIndex((flowStep) => {
    return flowStep.id === step;
  });

  const paymentOptions: Array<{ value: PaymentMethod; label: string }> = [
    { value: "pix", label: "Pix" },
    { value: "credit", label: "Credito" },
    { value: "debit", label: "Debito" },
    { value: "cash", label: "Dinheiro" },
  ];

  const resetDrawerState = () => {
    setStep("cart");
    setDeliveryType("delivery");
    setPaymentMethod("pix");
    setCustomer(EMPTY_DRAWER_CUSTOMER);
    setSubmitError(null);
    setCustomerErrors({});
    setIsSubmitting(false);
    setSuccessOrder(null);
  };

  const handleCloseDrawer = () => {
    resetDrawerState();
    onClose();
  };

  useEffect(() => {
    if (!open || step !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      resetDrawerState();
      onClose();
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onClose, open, step]);

  const updateCustomer = (field: keyof DrawerCustomer, value: string) => {
    const nextValue = field === "phone" ? formatPhoneInput(value) : value;

    setCustomer((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
    setSubmitError(null);
    setCustomerErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAdvanceToCheckoutDetails = () => {
    if (checkoutItems.length === 0) {
      setSubmitError("Adicione itens na sacola para continuar.");
      setStep("cart");
      return;
    }

    if (deliveryType === "delivery" && customer.address.trim().length < 8) {
      setCustomerErrors((prev) => ({
        ...prev,
        address: "Preencha o endereco de entrega.",
      }));
      setSubmitError("Revise os dados do endereco para continuar.");
      return;
    }

    setSubmitError(null);
    setCustomerErrors((prev) => ({ ...prev, address: undefined }));
    setStep("checkout");
  };

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    if (checkoutItems.length === 0) {
      setSubmitError("Adicione itens na sacola para confirmar o pedido.");
      setStep("cart");
      return;
    }

    const validation = validateDrawerCustomer(customer, deliveryType);

    if (!validation.isValid) {
      setCustomerErrors(validation.errors);
      setSubmitError("Revise os dados obrigatorios para continuar.");

      if (validation.errors.address) {
        setStep("address");
        return;
      }

      const firstErrorField = getFirstDrawerErrorField(validation.errors);
      const invalidInput = firstErrorField
        ? document.getElementById(`sidebar-checkout-${firstErrorField}`)
        : null;

      invalidInput?.focus();
      return;
    }

    setCustomerErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    const normalizedPhone = normalizePhoneNumber(customer.phone);

    try {
      const result = await createOrderAction({
        slug,
        deliveryType,
        paymentMethod,
        customer: {
          name: customer.name.trim(),
          phone: normalizedPhone || customer.phone.trim(),
          address: customer.address.trim(),
          notes: customer.notes.trim(),
        },
        items: checkoutItems,
      });

      if (!result.ok) {
        setSubmitError(result.message);
        setIsSubmitting(false);
        return;
      }

      onClear();
      setSuccessOrder(result.orderNumber);
      setStep("success");
      setIsSubmitting(false);
    } catch {
      setSubmitError("Nao foi possivel confirmar agora. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={handleCloseDrawer}
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] transition ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed inset-y-0 left-0 right-0 z-50 mx-auto flex h-screen max-h-screen w-full max-w-[760px] flex-col overflow-hidden rounded-t-[18px] border border-zinc-200 bg-white transition-transform duration-300 supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:max-h-[100dvh] md:inset-y-0 md:left-auto md:right-0 md:mx-0 md:max-w-[560px] md:rounded-none md:border-l md:border-r-0 md:border-t-0 ${
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-full md:translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100"
              aria-label="Fechar sacola"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-[22px] font-semibold tracking-tight text-zinc-900">{stepTitle}</div>
          </div>
          {step === "cart" ? (
            <button
              type="button"
              onClick={onClear}
              disabled={items.length === 0}
              className="text-[13px] font-medium text-zinc-500 transition hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpar sacola
            </button>
          ) : step === "address" ? (
            <button
              type="button"
              onClick={() => setStep("cart")}
              className="text-[13px] font-medium text-zinc-500 transition hover:text-zinc-800"
            >
              Voltar
            </button>
          ) : step === "checkout" ? (
            <button
              type="button"
              onClick={() => setStep("address")}
              className="text-[13px] font-medium text-zinc-500 transition hover:text-zinc-800"
            >
              Voltar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="text-[13px] font-medium text-zinc-500 transition hover:text-zinc-800"
            >
              Fechar
            </button>
          )}
        </div>

        {(step === "address" || step === "checkout") && currentCheckoutStepIndex >= 0 ? (
          <div className="border-b border-zinc-200 px-5 py-3">
            <div className="mb-1.5 flex items-center justify-between text-[12px] text-zinc-500">
              <span>
                Passo {currentCheckoutStepIndex + 1} de {checkoutFlowSteps.length}
              </span>
              <span>{checkoutFlowSteps[currentCheckoutStepIndex]?.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {checkoutFlowSteps.map((flowStep, index) => (
                <div
                  key={flowStep.id}
                  className={`h-1.5 rounded-full transition ${
                    index <= currentCheckoutStepIndex ? "bg-zinc-900" : "bg-zinc-200"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === "cart" ? (
          <>
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5">
              <div className="text-[18px] font-semibold text-zinc-900">{totalUnitsLabel}</div>
              <div className="text-[18px] font-semibold text-zinc-900">
                Total: {formatBRL(total)}
              </div>
            </div>

            <div className="border-b border-zinc-100 px-5 py-2 text-[12px] text-zinc-500">
              {uniqueItemsLabel}
            </div>

            <div className="max-h-[56vh] overflow-y-auto md:max-h-[calc(100vh-235px)]">
              {items.length === 0 ? (
                <div className="px-5 py-8 text-sm text-zinc-500">
                  Sua sacola esta vazia no momento.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 border-b border-zinc-200 px-5 py-4"
                  >
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-50">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{item.emoji || "🍽️"}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-[15px] font-medium leading-5 text-zinc-900">
                        {item.name}
                      </div>
                      <div className="mt-0.5 text-[12px] text-zinc-500">
                        Codigo: {String(item.id).padStart(6, "0")}-1
                      </div>
                      <div className="mt-2 text-[16px] font-semibold text-zinc-900">
                        {formatBRL(item.price * (cart[item.id] || 0))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDecrease(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-base text-zinc-700"
                      >
                        −
                      </button>

                      <span className="min-w-5 text-center text-[15px] font-medium text-zinc-900">
                        {cart[item.id]}
                      </span>

                      <button
                        type="button"
                        onClick={() => onIncrease(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-base text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-zinc-200 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
              <button
                type="button"
                onClick={() => setStep("address")}
                disabled={items.length === 0}
                className="block w-full rounded-[28px] bg-zinc-950 px-4 py-3 text-center text-[20px] font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Avancar: {formatBRL(total)}
              </button>

              <div className="mt-2 text-center text-[12px] text-zinc-500">
                Subtotal {formatBRL(subtotal)}{" "}
                {deliveryFeeToCombine
                  ? "+ entrega a combinar"
                  : `+ entrega ${formatBRL(deliveryFee)}`}
              </div>
              {deliveryFeeToCombine ? (
                <div className="mt-2 text-center text-[12px] text-zinc-500">
                  Taxa de entrega definida no atendimento.
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {step === "address" ? (
          <>
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5">
              <div className="text-[15px] font-medium text-zinc-600">{totalUnitsLabel}</div>
              <div className="text-[17px] font-semibold text-zinc-900">
                Total: {formatBRL(sidebarTotal)}
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
              <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-zinc-500">
                  Endereco
                </div>
                <div className="mt-1 text-[12px] text-zinc-500">
                  Defina como o cliente vai receber o pedido.
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType("delivery");
                      setSubmitError(null);
                      setCustomerErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                      deliveryType === "delivery"
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 bg-white text-zinc-600"
                    }`}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType("pickup");
                      setSubmitError(null);
                      setCustomerErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                      deliveryType === "pickup"
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 bg-white text-zinc-600"
                    }`}
                  >
                    Retirada
                  </button>
                </div>

                {deliveryType === "delivery" ? (
                  <div className="mt-2 text-[12px] text-zinc-500">
                    {deliveryFeeToCombine
                      ? "Taxa definida no atendimento."
                      : `Taxa de entrega: ${formatBRL(deliveryFee)}`}
                  </div>
                ) : (
                  <div className="mt-2 text-[12px] text-zinc-500">
                    Sem taxa de entrega na retirada.
                  </div>
                )}
              </div>

              <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-3">
                {deliveryType === "delivery" ? (
                  <div className="mt-3 space-y-2">
                    <label className="block text-xs font-medium text-zinc-600" htmlFor="sidebar-address-step">
                      Endereco de entrega
                    </label>
                    <input
                      id="sidebar-address-step"
                      value={customer.address}
                      onChange={(event) => updateCustomer("address", event.target.value)}
                      placeholder="Rua, numero, bairro"
                      className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition ${
                        customerErrors.address
                          ? "border-red-400 focus:border-red-500"
                          : "border-zinc-300 focus:border-zinc-900"
                      }`}
                    />
                    {customerErrors.address ? (
                      <div className="text-[12px] text-red-500">{customerErrors.address}</div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-1 text-[12px] text-zinc-500">
                    Nao e necessario informar endereco para retirada.
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-200 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
              <div className="mb-2 flex items-center justify-between text-sm text-zinc-600">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm text-zinc-600">
                <span>Entrega</span>
                <span>
                  {deliveryType === "pickup"
                    ? "Gratis"
                    : deliveryFeeToCombine
                      ? "A combinar"
                      : formatBRL(deliveryFee)}
                </span>
              </div>
              <div className="mb-3 flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
                <span>Total</span>
                <span>{formatBRL(sidebarTotal)}</span>
              </div>

              <button
                type="button"
                onClick={handleAdvanceToCheckoutDetails}
                disabled={checkoutItems.length === 0}
                className="block w-full rounded-[12px] bg-zinc-950 px-4 py-3 text-center text-[16px] font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuar para dados ({formatBRL(sidebarTotal)})
              </button>

              {submitError ? (
                <div className="mt-2 text-[12px] text-red-500">{submitError}</div>
              ) : (
                <div className="mt-2 text-[12px] text-zinc-500">
                  Etapa 1 do checkout: endereco.
                </div>
              )}
            </div>
          </>
        ) : null}

        {step === "checkout" ? (
          <>
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5">
              <div className="text-[15px] font-medium text-zinc-600">{totalUnitsLabel}</div>
              <div className="text-[17px] font-semibold text-zinc-900">
                Total: {formatBRL(sidebarTotal)}
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
              <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-3">
                <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-zinc-500">
                  Endereco
                </div>
                {deliveryType === "delivery" ? (
                  <div className="space-y-2">
                    <div className="text-sm text-zinc-700">
                      {customer.address || "Endereco nao informado."}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("address")}
                      className="text-xs font-medium text-zinc-600 underline underline-offset-2"
                    >
                      Alterar endereco
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-700">Retirada no balcao.</div>
                )}
              </div>

              <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-zinc-500">
                  Seus dados
                </div>

                <div className="mt-2 space-y-2">
                  <label className="block text-xs font-medium text-zinc-600" htmlFor="sidebar-checkout-name">
                    Nome completo
                  </label>
                  <input
                    id="sidebar-checkout-name"
                    value={customer.name}
                    onChange={(event) => updateCustomer("name", event.target.value)}
                    placeholder="Seu nome"
                    className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition ${
                      customerErrors.name
                        ? "border-red-400 focus:border-red-500"
                        : "border-zinc-300 focus:border-zinc-900"
                    }`}
                  />
                  {customerErrors.name ? (
                    <div className="text-[12px] text-red-500">{customerErrors.name}</div>
                  ) : null}
                </div>

                <div className="mt-3 space-y-2">
                  <label className="block text-xs font-medium text-zinc-600" htmlFor="sidebar-checkout-phone">
                    WhatsApp
                  </label>
                  <input
                    id="sidebar-checkout-phone"
                    value={customer.phone}
                    onChange={(event) => updateCustomer("phone", event.target.value)}
                    placeholder="(00) 00000-0000"
                    className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition ${
                      customerErrors.phone
                        ? "border-red-400 focus:border-red-500"
                        : "border-zinc-300 focus:border-zinc-900"
                    }`}
                  />
                  {customerErrors.phone ? (
                    <div className="text-[12px] text-red-500">{customerErrors.phone}</div>
                  ) : null}
                </div>

                <div className="mt-3 space-y-2">
                  <label className="block text-xs font-medium text-zinc-600" htmlFor="sidebar-checkout-notes">
                    Observacoes (opcional)
                  </label>
                  <textarea
                    id="sidebar-checkout-notes"
                    value={customer.notes}
                    onChange={(event) => updateCustomer("notes", event.target.value)}
                    placeholder="Ex.: sem gelo, troco para 100..."
                    className="min-h-[76px] w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-zinc-500">
                  Pagamento
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPaymentMethod(option.value)}
                      className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                        paymentMethod === option.value
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 bg-white text-zinc-600"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
              <div className="mb-2 flex items-center justify-between text-sm text-zinc-600">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm text-zinc-600">
                <span>Entrega</span>
                <span>
                  {deliveryType === "pickup"
                    ? "Gratis"
                    : deliveryFeeToCombine
                      ? "A combinar"
                      : formatBRL(deliveryFee)}
                </span>
              </div>
              <div className="mb-3 flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
                <span>Total</span>
                <span>{formatBRL(sidebarTotal)}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleConfirm();
                }}
                disabled={isSubmitting || checkoutItems.length === 0}
                className="block w-full rounded-[12px] bg-zinc-950 px-4 py-3 text-center text-[16px] font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Confirmando pedido..." : `Confirmar pedido (${formatBRL(sidebarTotal)})`}
              </button>

              {submitError ? (
                <div className="mt-2 text-[12px] text-red-500">{submitError}</div>
              ) : (
                <div className="mt-2 text-[12px] text-zinc-500">
                  Etapa 2 do checkout: dados e pagamento.
                </div>
              )}
            </div>
          </>
        ) : null}

        {step === "success" ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
              ✓
            </div>
            <h3 className="text-xl font-semibold text-zinc-900">Pedido enviado com sucesso</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Numero do pedido: {successOrder ?? "-"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Pedido feito. Voltando para o sistema...
            </p>

            <button
              type="button"
              onClick={handleCloseDrawer}
              className="mt-6 rounded-[12px] bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Voltar ao cardapio
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
