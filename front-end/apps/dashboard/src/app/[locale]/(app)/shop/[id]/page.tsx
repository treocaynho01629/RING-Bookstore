import { notFound } from "next/navigation";
import { getShop } from "@/lib/getShop";
import DetailShopContent from "@/components/shop/DetailShopContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailShopPage({ params }: PageProps) {
  const { id } = await params;
  const shop = await getShop(id);

  if (!shop && id) {
    notFound();
  }

  return <DetailShopContent shop={shop} id={id} />;
}
