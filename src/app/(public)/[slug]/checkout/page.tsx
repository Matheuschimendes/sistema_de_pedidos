import { notFound } from "next/navigation";
import { CheckoutPageClient } from "@/src/components/public/checkout/checkout-page-client";
import { getPublicRestaurantMenuBySlug } from "@/src/lib/menu-data";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const menu = await getPublicRestaurantMenuBySlug(slug);

  if (!menu) {
    notFound();
  }

  return (
    <CheckoutPageClient
      slug={slug}
      restaurant={menu.restaurant}
      products={menu.products}
    />
  );
}
