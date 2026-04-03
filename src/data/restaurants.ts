import { RestaurantOpeningHours, RestaurantProfile } from "@/src/types/restaurant";

const defaultRestaurantLogo = "/brand/default-restaurant-logo.svg";
const defaultBannerImage = "/brand/banner.svg";
const defaultTimeZone = "America/Fortaleza";
const defaultWhatsappNumber = "5585991223506";
const defaultOpeningHours: RestaurantOpeningHours = {
  monday: { open: "10:00", close: "22:00" },
  tuesday: { open: "10:00", close: "22:00" },
  wednesday: { open: "10:00", close: "22:00" },
  thursday: { open: "10:00", close: "22:00" },
  friday: { open: "10:00", close: "23:00" },
  saturday: { open: "10:00", close: "23:00" },
  sunday: { open: "10:00", close: "18:00" },
};

const restaurants: Record<string, RestaurantProfile> = {
  "geladao-dos-fernandes": {
    slug: "geladao-dos-fernandes",
    name: "Geladão dos Fernandes",
    description:
      "Distribuidora com foco em cerveja gelada, combos prontos e pedido rápido pelo celular.",
    highlight: "Operação piloto pronta para validar pedidos online",
    logo: defaultRestaurantLogo,
    bannerImage: defaultBannerImage,
    timeZone: defaultTimeZone,
    openingHours: defaultOpeningHours,
    deliveryFee: 5,
    deliveryTime: "20-35 min",
    rating: 4.8,
    reviewCount: 312,
    whatsappNumber: defaultWhatsappNumber,
  },
};

function normalizeRestaurant(restaurant: RestaurantProfile): RestaurantProfile {
  return {
    ...restaurant,
    logo: restaurant.logo ?? defaultRestaurantLogo,
    bannerImage: restaurant.bannerImage ?? defaultBannerImage,
    timeZone: restaurant.timeZone ?? defaultTimeZone,
    openingHours: restaurant.openingHours ?? defaultOpeningHours,
    deliveryFee: restaurant.deliveryFee ?? 5,
    deliveryTime: restaurant.deliveryTime ?? "20-35 min",
    rating: restaurant.rating ?? 4.8,
    reviewCount: restaurant.reviewCount ?? 0,
    whatsappNumber: restaurant.whatsappNumber ?? defaultWhatsappNumber,
  };
}

export function getRestaurants(): RestaurantProfile[] {
  return Object.values(restaurants).map(normalizeRestaurant);
}

export function getRestaurantBySlug(slug: string): RestaurantProfile {
  const normalizedSlug = slug.trim().toLowerCase();
  const restaurant = restaurants[normalizedSlug];

  if (restaurant) {
    return normalizeRestaurant(restaurant);
  }

  return normalizeRestaurant({
    slug: normalizedSlug,
    name: formatRestaurantName(normalizedSlug),
    description:
      "Ative seu cardápio digital, receba pedidos no celular e valide o fluxo do MVP rapidamente.",
    highlight: "Restaurante ainda sem configuração completa",
    logo: defaultRestaurantLogo,
    bannerImage: defaultBannerImage,
    timeZone: defaultTimeZone,
    openingHours: defaultOpeningHours,
    deliveryFee: 5,
    deliveryTime: "20-35 min",
    rating: 5,
    reviewCount: 0,
    whatsappNumber: defaultWhatsappNumber,
  });
}

function formatRestaurantName(slug: string) {
  const formattedName = slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formattedName || "Seu restaurante";
}
