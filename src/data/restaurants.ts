import { RestaurantOpeningHours, RestaurantProfile } from "@/src/types/restaurant";

const defaultRestaurantLogo = "/brand/default-restaurant-logo.svg";
const defaultBannerImage = "/brand/banner.svg";
const defaultTimeZone = "America/Fortaleza";
const defaultWhatsappNumber = "5585982342161";
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
      "Seja para abastecer o fim de semana, um churrasco ou uma comemoração especial, estamos prontos para atender com eficiência, oferecendo bebidas de qualidade, preços justos e entrega garantida.",
    highlight: "Bebidas geladas para entrega e retirada no balcão",
    logo: "https://s3-sa-east-1.amazonaws.com/assets.meucomercio.com.br/production/logos/4c77a37f2b524343c52c4c328a64ce39.png",
    bannerImage: defaultBannerImage,
    timeZone: defaultTimeZone,
    openingHours: defaultOpeningHours,
    deliveryFee: 0,
    deliveryTime: "Taxa de entrega a combinar",
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

export function hasRestaurantSlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(restaurants, normalizedSlug);
}

function formatRestaurantName(slug: string) {
  const formattedName = slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formattedName || "Seu restaurante";
}
