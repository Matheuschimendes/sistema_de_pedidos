import { notFound } from "next/navigation";
import { PublicMenuPageClient } from "@/src/components/public/menu/public-menu-page-client";
import { getPublicRestaurantMenuBySlug } from "@/src/lib/menu-data";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;
  const menu = await getPublicRestaurantMenuBySlug(slug);

  if (!menu) {
    notFound();
  }

  return (
    <PublicMenuPageClient
      slug={slug}
      restaurant={menu.restaurant}
      products={menu.products}
      categories={menu.categories}
    />
  );
}
