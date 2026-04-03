import { comboCategory } from "@/src/lib/menu-groups";
import { prisma } from "@/src/lib/prisma";
import { Product } from "@/src/types/menu";
import { RestaurantOpeningHours, RestaurantProfile } from "@/src/types/restaurant";

type ProductRecord = {
  id: number;
  name: string;
  description: string;
  price: { toNumber(): number } | number;
  imageUrl: string;
  category: string;
  additionalInfo: string | null;
  isAvailable: boolean;
  badge: string | null;
  featured: boolean;
  emoji: string | null;
};

type RestaurantRecord = {
  slug: string;
  name: string;
  description: string | null;
  highlight: string | null;
  logoUrl: string | null;
  bannerImageUrl: string | null;
  whatsappNumber: string | null;
  timeZone: string;
  openingHours: unknown;
  deliveryFee: { toNumber(): number } | number;
  deliveryTime: string | null;
  rating: number | null;
  reviewCount: number;
};

function toNumber(
  value: { toNumber(): number } | number | null | undefined,
) {
  if (value == null) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return value.toNumber();
}

export function buildMenuCategoriesFromProducts(products: Product[]) {
  const categorySet = new Set<string>();

  for (const product of products) {
    if (product.category.trim()) {
      categorySet.add(product.category.trim());
    }
  }

  const categories = Array.from(categorySet).sort((left, right) => {
    if (left === comboCategory) return -1;
    if (right === comboCategory) return 1;

    return left.localeCompare(right, "pt-BR");
  });

  return ["Todos", ...categories];
}

export function mapProductRecordToMenuProduct(product: ProductRecord): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: toNumber(product.price),
    category: product.category,
    additionalInfo: product.additionalInfo ?? undefined,
    isAvailable: product.isAvailable,
    emoji: product.emoji ?? undefined,
    image: product.imageUrl,
    badge: product.badge ?? undefined,
    featured: product.featured,
  };
}

export function mapRestaurantRecordToProfile(
  restaurant: RestaurantRecord,
): RestaurantProfile {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    description: restaurant.description ?? undefined,
    highlight: restaurant.highlight ?? undefined,
    logo: restaurant.logoUrl ?? undefined,
    bannerImage: restaurant.bannerImageUrl ?? undefined,
    whatsappNumber: restaurant.whatsappNumber ?? undefined,
    timeZone: restaurant.timeZone,
    openingHours:
      (restaurant.openingHours as RestaurantOpeningHours | null | undefined) ??
      undefined,
    deliveryFee: toNumber(restaurant.deliveryFee),
    deliveryTime: restaurant.deliveryTime ?? undefined,
    rating: restaurant.rating ?? undefined,
    reviewCount: restaurant.reviewCount,
  };
}

export async function getPublicRestaurantMenuBySlug(
  slug: string,
): Promise<{
  restaurant: RestaurantProfile;
  products: Product[];
  categories: string[];
} | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: [{ featured: "desc" }, { category: "asc" }, { name: "asc" }],
      },
    },
  });

  if (!restaurant) {
    return null;
  }

  const products = restaurant.products.map(mapProductRecordToMenuProduct);

  return {
    restaurant: mapRestaurantRecordToProfile(restaurant),
    products,
    categories: buildMenuCategoriesFromProducts(products),
  };
}

export async function getRestaurantProfileBySlug(
  slug: string,
): Promise<RestaurantProfile | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });

  if (!restaurant) {
    return null;
  }

  return mapRestaurantRecordToProfile(restaurant);
}

export async function getAdminProducts(restaurantId: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { restaurantId },
    orderBy: [{ category: "asc" }, { featured: "desc" }, { name: "asc" }],
  });

  return products.map(mapProductRecordToMenuProduct);
}

export async function getAdminProductById(
  productId: number,
  restaurantId: string,
): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      restaurantId,
    },
  });

  if (!product) {
    return null;
  }

  return mapProductRecordToMenuProduct(product);
}

export async function getRestaurantForAdmin(
  restaurantId: string,
): Promise<RestaurantProfile | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    return null;
  }

  return mapRestaurantRecordToProfile(restaurant);
}

export function getExistingCategories(products: Product[]) {
  return buildMenuCategoriesFromProducts(products).filter(
    (category) => category !== "Todos",
  );
}
