import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL nao configurada para o seed.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const openingHours = {
  monday: { open: "10:00", close: "22:00" },
  tuesday: { open: "10:00", close: "22:00" },
  wednesday: { open: "10:00", close: "22:00" },
  thursday: { open: "10:00", close: "22:00" },
  friday: { open: "10:00", close: "23:00" },
  saturday: { open: "10:00", close: "23:00" },
  sunday: { open: "10:00", close: "18:00" },
};

const restaurantSeed = {
  slug: "geladao-dos-fernandes",
  name: "Geladão dos Fernandes",
  description:
    "Distribuidora com foco em cerveja gelada, combos prontos e pedido rápido pelo celular.",
  highlight: "Operação piloto pronta para validar pedidos online",
  logoUrl: "/brand/default-restaurant-logo.svg",
  bannerImageUrl: "/brand/banner.svg",
  whatsappNumber: "5585991223506",
  timeZone: "America/Fortaleza",
  openingHours,
  deliveryFee: 5,
  deliveryTime: "20-35 min",
  rating: 4.8,
  reviewCount: 312,
};

const productSeeds = [
  {
    name: "Combo Black & White + Night Power",
    description: "Whisky Black & White com Night Power e gelo.",
    price: 39.9,
    category: "Combos",
    imageUrl: "/promotions/black-white-night-power.png",
    badge: "Combo",
    featured: true,
    emoji: "🥃",
    additionalInfo: "Ideal para dividir e pedir com gelo extra.",
    isAvailable: true,
  },
  {
    name: "Combo Red Label + Night Power",
    description: "Whisky Red Label com Night Power e gelo.",
    price: 59.9,
    category: "Combos",
    imageUrl: "/promotions/red-label-night-power.png",
    badge: "Combo",
    featured: true,
    emoji: "🥃",
    additionalInfo: "Combo premium pronto para sair rápido.",
    isAvailable: true,
  },
  {
    name: "Itaipava",
    description: "Cerveja gelada",
    price: 3.5,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Skol",
    description: "Cerveja gelada",
    price: 4,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Amstel",
    description: "Cerveja gelada",
    price: 4,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Bohemia",
    description: "Cerveja gelada",
    price: 4,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Brahma Duplo Malte",
    description: "Cerveja gelada",
    price: 4.5,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Spaten",
    description: "Cerveja gelada",
    price: 5,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Budweiser",
    description: "Cerveja gelada",
    price: 5,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Stella Artois",
    description: "Cerveja premium gelada",
    price: 6,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Heineken",
    description: "Cerveja premium gelada",
    price: 6,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Corona",
    description: "Cerveja premium gelada",
    price: 6.5,
    category: "Cervejas",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 350ml.",
    isAvailable: true,
  },
  {
    name: "Budweiser Long Neck",
    description: "Garrafa long neck",
    price: 6.5,
    category: "Long Neck",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍾",
    additionalInfo: "Garrafa 330ml.",
    isAvailable: true,
  },
  {
    name: "Heineken Long Neck",
    description: "Garrafa long neck",
    price: 7,
    category: "Long Neck",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍾",
    additionalInfo: "Garrafa 330ml.",
    isAvailable: true,
  },
  {
    name: "Corona Long Neck",
    description: "Garrafa long neck",
    price: 8,
    category: "Long Neck",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍾",
    additionalInfo: "Garrafa 330ml.",
    isAvailable: true,
  },
  {
    name: "Skol Buchudinha",
    description: "Versão pequena gelada",
    price: 3.5,
    category: "Buchudinha",
    imageUrl: "/products/beer-small-can.svg",
    emoji: "🍺",
    additionalInfo: "Lata 269ml.",
    isAvailable: true,
  },
  {
    name: "Monster",
    description: "Energético gelado",
    price: 10,
    category: "Energéticos",
    imageUrl: "/products/beer-can.svg",
    emoji: "⚡",
    additionalInfo: "Lata 473ml.",
    isAvailable: true,
  },
  {
    name: "Night Power",
    description: "Energético gelado",
    price: 15,
    category: "Energéticos",
    imageUrl: "/products/beer-can.svg",
    emoji: "⚡",
    additionalInfo: "Lata 473ml.",
    isAvailable: true,
  },
] as const;

const categorySeeds = Array.from(
  new Set(productSeeds.map((product) => product.category.trim())),
).sort((left, right) => left.localeCompare(right, "pt-BR"));

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: restaurantSeed.slug },
    update: restaurantSeed,
    create: restaurantSeed,
  });

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@mesa.app")
    .trim()
    .toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: "Administrador",
      passwordHash: hashPassword(adminPassword),
      restaurantId: restaurant.id,
    },
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      restaurantId: restaurant.id,
    },
  });

  for (const categoryName of categorySeeds) {
    await prisma.category.upsert({
      where: {
        restaurantId_name: {
          restaurantId: restaurant.id,
          name: categoryName,
        },
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        name: categoryName,
      },
    });
  }

  for (const product of productSeeds) {
    await prisma.product.upsert({
      where: {
        restaurantId_name_category: {
          restaurantId: restaurant.id,
          name: product.name,
          category: product.category,
        },
      },
      update: product,
      create: {
        ...product,
        restaurantId: restaurant.id,
      },
    });
  }

  console.log("");
  console.log("Banco inicializado com sucesso.");
  console.log(`Restaurante: ${restaurant.name}`);
  console.log(`Admin: ${adminEmail}`);
  console.log(`Senha seed: ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
