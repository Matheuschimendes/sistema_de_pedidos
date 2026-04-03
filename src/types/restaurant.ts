export type RestaurantWeekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type RestaurantDailyHours = {
  open: string;
  close: string;
};

export type RestaurantOpeningHours = Partial<
  Record<RestaurantWeekday, RestaurantDailyHours>
>;

export type RestaurantBusinessTone = "open" | "closed" | "neutral";

export type RestaurantBusinessStatus = {
  label: string;
  detail: string;
  tone: RestaurantBusinessTone;
};

export type RestaurantProfile = {
  bannerImage?: string;
  slug: string;
  name: string;
  description?: string;
  highlight?: string;
  logo?: string;
  timeZone: string;
  openingHours?: RestaurantOpeningHours;
  deliveryFee?: number;
  deliveryTime?: string;
  rating?: number;
  reviewCount?: number;
  whatsappNumber?: string;
};
