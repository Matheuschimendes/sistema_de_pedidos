import {
  RestaurantBusinessStatus,
  RestaurantOpeningHours,
  RestaurantProfile,
  RestaurantWeekday,
} from "@/src/types/restaurant";

const weekdayOrder: RestaurantWeekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const weekdayLabels: Record<RestaurantWeekday, string> = {
  sunday: "dom.",
  monday: "seg.",
  tuesday: "ter.",
  wednesday: "qua.",
  thursday: "qui.",
  friday: "sex.",
  saturday: "sab.",
};

const weekdayByShortLabel: Record<string, RestaurantWeekday> = {
  Sun: "sunday",
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
};

export function getRestaurantBusinessStatus(
  restaurant: RestaurantProfile,
  now = new Date()
): RestaurantBusinessStatus {
  if (!restaurant.openingHours || Object.keys(restaurant.openingHours).length === 0) {
    return {
      label: "Sem horario",
      detail: "Cadastre o horario de funcionamento",
      tone: "neutral",
    };
  }

  const { weekday, currentMinutes } = getCurrentTimeInfo(now, restaurant.timeZone);
  const todayHours = restaurant.openingHours[weekday];

  if (!todayHours) {
    const nextOpening = getNextOpeningLabel(restaurant.openingHours, weekday);

    return {
      label: "Fechado",
      detail: nextOpening ?? "Fechado hoje",
      tone: "closed",
    };
  }

  const openMinutes = parseTimeToMinutes(todayHours.open);
  const closeMinutes = parseTimeToMinutes(todayHours.close);

  if (currentMinutes < openMinutes) {
    return {
      label: "Fechado",
      detail: `Abre hoje as ${todayHours.open}`,
      tone: "closed",
    };
  }

  if (currentMinutes < closeMinutes) {
    return {
      label: "Aberto",
      detail: `Fecha as ${todayHours.close}`,
      tone: "open",
    };
  }

  const nextOpening = getNextOpeningLabel(restaurant.openingHours, weekday);

  return {
    label: "Fechado",
    detail: nextOpening ?? "Encerrado por hoje",
    tone: "closed",
  };
}

function getCurrentTimeInfo(now: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(now);
  const weekdayLabel = parts.find((part) => part.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return {
    weekday: weekdayByShortLabel[weekdayLabel] ?? "sunday",
    currentMinutes: hour * 60 + minute,
  };
}

function getNextOpeningLabel(
  openingHours: RestaurantOpeningHours,
  currentWeekday: RestaurantWeekday
) {
  const currentIndex = weekdayOrder.indexOf(currentWeekday);

  for (let offset = 1; offset <= weekdayOrder.length; offset += 1) {
    const nextWeekday = weekdayOrder[(currentIndex + offset) % weekdayOrder.length];
    const nextHours = openingHours[nextWeekday];

    if (!nextHours) {
      continue;
    }

    if (offset === 1) {
      return `Abre amanha as ${nextHours.open}`;
    }

    return `Abre ${weekdayLabels[nextWeekday]} as ${nextHours.open}`;
  }

  return null;
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
