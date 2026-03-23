import { RestaurantOpeningHours, RestaurantProfile } from "@/src/types/restaurant";

const defaultRestaurantLogo = "/brand/default-restaurant-logo.svg";
const defaultTimeZone = "America/Fortaleza";
const defaultOpeningHours: RestaurantOpeningHours = {
  monday: { open: "08:00", close: "18:00" },
  tuesday: { open: "08:00", close: "22:00" },
  wednesday: { open: "08:00", close: "22:00" },
  thursday: { open: "08:00", close: "22:00" },
  friday: { open: "08:00", close: "23:00" },
  saturday: { open: "08:00", close: "23:00" },
  sunday: { open: "09:00", close: "18:00" },
};

const restaurants: Record<string, RestaurantProfile> = {
  "geladao-dos-fernandes": {
    slug: "geladao-dos-fernandes",
    name: "Geladão dos Fernandes",
    logo: defaultRestaurantLogo,
    timeZone: defaultTimeZone,
    openingHours: defaultOpeningHours,
  },
};

export function getRestaurantBySlug(slug: string): RestaurantProfile {
  const normalizedSlug = slug.trim().toLowerCase();
  const restaurant = restaurants[normalizedSlug];

  if (restaurant) {
    return {
      ...restaurant,
      timeZone: restaurant.timeZone ?? defaultTimeZone,
      openingHours: restaurant.openingHours ?? defaultOpeningHours,
    };
  }

  return {
    slug: normalizedSlug,
    name: formatRestaurantName(normalizedSlug),
    logo: defaultRestaurantLogo,
    timeZone: defaultTimeZone,
    openingHours: defaultOpeningHours,
  };
}

function formatRestaurantName(slug: string) {
  const formattedName = slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formattedName || "Seu restaurante";
}
