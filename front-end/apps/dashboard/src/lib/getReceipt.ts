import { getServerSession } from "next-auth";
import { options } from "@/lib/authOptions";
import type { ReceiptDTO } from "@ring/shared/models/receiptDTO";

/**
 * Fetch order receipt from the backend API.
 * Used for server-side pre-rendering of the order detail page.
 */
export async function getReceipt(id: string): Promise<ReceiptDTO | null> {
  if (!id) return null;

  const session = await getServerSession(options);
  const accessToken = session?.access;
  if (!accessToken) return null;

  try {
    const res = await fetch(`/api/orders/receipts/${id}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { tags: [`receipt:${id}`] },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
