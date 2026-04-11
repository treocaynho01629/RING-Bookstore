import { getServerSession } from "next-auth";
import { options } from "@/lib/authOptions";
import type { ShopDetailDTO } from "@ring/shared/models/shopDetailDTO";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetch shop detail from the backend API.
 * Used for server-side pre-rendering of the shop detail page.
 */
export async function getShop(id: string): Promise<ShopDetailDTO | null> {
  if (!id || !API_URL) return null;

  const session = await getServerSession(options);
  const accessToken = session?.access;
  if (!accessToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/shops/detail/${id}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60, tags: [`shop:${id}`] },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
