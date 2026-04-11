import { notFound } from "next/navigation";
import { getBook } from "@/lib/getBook";
import DetailProductContent from "@/components/product/DetailProductContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getBook(id);

  if (!product && id) {
    notFound();
  }

  return <DetailProductContent product={product} id={id} />;
}
