import { getReceipt } from "@/lib/getReceipt";
import DetailOrderContent from "@/components/order/DetailOrderContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailOrderPage({ params }: PageProps) {
  const { id } = await params;
  const receipt = await getReceipt(id);

  return <DetailOrderContent receipt={receipt} id={id} />;
}

