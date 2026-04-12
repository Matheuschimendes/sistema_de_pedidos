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
    "Seja para abastecer o fim de semana, um churrasco ou uma comemoração especial, estamos prontos para atender com eficiência, oferecendo bebidas de qualidade, preços justos e entrega garantida.",
  highlight: "Bebidas geladas para entrega e retirada no balcão",
  logoUrl: "/brand/default-restaurant-logo.svg",
  bannerImageUrl: "/brand/banner.svg",
  whatsappNumber: "5585982342161",
  timeZone: "America/Fortaleza",
  openingHours,
  deliveryFee: 0,
  deliveryTime: "Taxa de entrega a combinar",
  rating: 4.8,
  reviewCount: 312,
};

const restaurantSeed2 = {
  slug: "geladao-dos-fernandes-2",
  name: "Geladão dos Fernandes 2",
  description:
    "Cardápio espelho do Geladão dos Fernandes para testes e validação do fluxo administrativo.",
  highlight: "Catálogo espelho com os mesmos produtos e preços",
  logoUrl: "/brand/default-restaurant-logo.svg",
  bannerImageUrl: "/brand/banner.svg",
  whatsappNumber: "5585982342161",
  timeZone: "America/Fortaleza",
  openingHours,
  deliveryFee: 0,
  deliveryTime: "Taxa de entrega a combinar",
  rating: 4.8,
  reviewCount: 312,
};

const productSeeds = [
  {
    name: "Skol Beats Red Mix",
    description: "Bebida beats pronta para consumo.",
    price: 6.0,
    category: "Beats",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍹",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Skol Beats Senses",
    description: "Bebida beats pronta para consumo.",
    price: 6.0,
    category: "Beats",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍹",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Amstel lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 4.0,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Bohemia lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 4.0,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Brahma duplo malte lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 4.5,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Budweiser lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 5.0,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    featured: true,
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Corona lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 6.5,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Devassa lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 3.5,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Heineken lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 6.0,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    featured: true,
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Itaipava lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 3.5,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Skol lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 4.0,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Spaten lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 5.0,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Stella lata",
    description: "Cerveja lata gelada para o seu pedido.",
    price: 6.0,
    category: "Cerveja Lata",
    imageUrl: "/products/beer-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Bally maçã verde",
    description: "Energético gelado para o seu pedido.",
    price: 20.0,
    category: "Energético",
    imageUrl: "/products/beer-can.svg",
    emoji: "⚡",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Bally pêssego e morango",
    description: "Energético gelado para o seu pedido.",
    price: 20.0,
    category: "Energético",
    imageUrl: "/products/beer-can.svg",
    emoji: "⚡",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Bally trocipacal",
    description: "Energético gelado para o seu pedido.",
    price: 20.0,
    category: "Energético",
    imageUrl: "/products/beer-can.svg",
    emoji: "⚡",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Monster",
    description: "Energético gelado para o seu pedido.",
    price: 10.0,
    category: "Energético",
    imageUrl: "/products/beer-can.svg",
    emoji: "⚡",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Night power 2l",
    description: "Energético gelado para o seu pedido.",
    price: 15.0,
    category: "Energético",
    imageUrl: "/products/beer-can.svg",
    emoji: "⚡",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Red bull",
    description: "Energético gelado para o seu pedido.",
    price: 11.0,
    category: "Energético",
    imageUrl: "/products/beer-can.svg",
    emoji: "⚡",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Gelo Cubo",
    description: "Saco de gelo para pedidos e combos.",
    price: 7.0,
    category: "Gelo",
    imageUrl: "/products/beer-small-can.svg",
    emoji: "🧊",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Gin Rocks",
    description: "Gin pronto para beber gelado.",
    price: 36.0,
    category: "Gin",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍸",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Gin Rocks Lemon",
    description: "Gin pronto para beber gelado.",
    price: 36.0,
    category: "Gin",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍸",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Gin Rocks Sunset",
    description: "Gin pronto para beber gelado.",
    price: 35.0,
    category: "Gin",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍸",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Tanqueray",
    description: "Garrafa de gin premium.",
    price: 105.0,
    category: "Gin",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍸",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Brahma Litrinho",
    description: "Cerveja litrinho gelada.",
    price: 3.7,
    category: "Litrinho",
    imageUrl: "/products/beer-small-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Skol litrinho",
    description: "Cerveja litrinho gelada.",
    price: 3.5,
    category: "Litrinho",
    imageUrl: "/products/beer-small-can.svg",
    emoji: "🍺",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Budweiser",
    description: "Long neck gelada.",
    price: 6.5,
    category: "Long neck",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍾",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Corona Long",
    description: "Long neck gelada.",
    price: 8.0,
    category: "Long neck",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍾",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Heineken",
    description: "Long neck gelada.",
    price: 7.0,
    category: "Long neck",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍾",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "stella",
    description: "Long neck gelada.",
    price: 7.0,
    category: "Long neck",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍾",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Coca cola 1L",
    description: "Refrigerante para acompanhar o pedido.",
    price: 8.0,
    category: "Refrigerante",
    imageUrl: "/products/beer-can.svg",
    emoji: "🥤",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Quinto do morgado",
    description: "Vinho de mesa para consumo imediato.",
    price: 17.0,
    category: "Vinho",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🍷",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Ballantines",
    description: "Whisky para pedidos premium.",
    price: 90.0,
    category: "Whisky",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🥃",
    featured: true,
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Black white",
    description: "Whisky para pedidos premium.",
    price: 68.0,
    category: "Whisky",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🥃",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Old par",
    description: "Whisky para pedidos premium.",
    price: 145.0,
    category: "Whisky",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🥃",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Red label",
    description: "Whisky para pedidos premium.",
    price: 95.0,
    category: "Whisky",
    imageUrl: "/products/beer-long-neck.svg",
    emoji: "🥃",
    featured: true,
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Água com gás",
    description: "Bebida complementar para pedidos.",
    price: 2.5,
    category: "Sem categoria",
    imageUrl: "/products/beer-can.svg",
    emoji: "🛒",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
  {
    name: "Coca cola 2L",
    description: "Bebida complementar para pedidos.",
    price: 12.0,
    category: "Sem categoria",
    imageUrl: "/products/beer-can.svg",
    emoji: "🛒",
    additionalInfo: "Consulte disponibilidade de estoque no momento do pedido.",
    isAvailable: true,
  },
] as const;

const categorySeeds = Array.from(
  new Set(productSeeds.map((product) => product.category.trim())),
).sort((left, right) => left.localeCompare(right, "pt-BR"));
const productIdentityFilters = productSeeds.map((product) => ({
  name: product.name,
  category: product.category,
}));

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

  const restaurant2 = await prisma.restaurant.upsert({
    where: { slug: restaurantSeed2.slug },
    update: restaurantSeed2,
    create: restaurantSeed2,
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

    await prisma.category.upsert({
      where: {
        restaurantId_name: {
          restaurantId: restaurant2.id,
          name: categoryName,
        },
      },
      update: {},
      create: {
        restaurantId: restaurant2.id,
        name: categoryName,
      },
    });
  }

  await prisma.product.deleteMany({
    where: {
      restaurantId: restaurant.id,
      NOT: {
        OR: productIdentityFilters,
      },
    },
  });

  await prisma.product.deleteMany({
    where: {
      restaurantId: restaurant2.id,
      NOT: {
        OR: productIdentityFilters,
      },
    },
  });

  await prisma.category.deleteMany({
    where: {
      restaurantId: restaurant.id,
      name: {
        notIn: categorySeeds,
      },
    },
  });

  await prisma.category.deleteMany({
    where: {
      restaurantId: restaurant2.id,
      name: {
        notIn: categorySeeds,
      },
    },
  });

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

    await prisma.product.upsert({
      where: {
        restaurantId_name_category: {
          restaurantId: restaurant2.id,
          name: product.name,
          category: product.category,
        },
      },
      update: product,
      create: {
        ...product,
        restaurantId: restaurant2.id,
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
