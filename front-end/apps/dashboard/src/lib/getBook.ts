import { getServerSession } from "next-auth";
import { options } from "@/lib/authOptions";
import type { BookDTO } from "@ring/shared/models/bookDTO";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetch book from the backend API.
 * Used for server-side pre-rendering of the product detail page.
 */
export async function getBook(id: string): Promise<BookDTO | null> {
  if (!id || !API_URL) return null;

  const session = await getServerSession(options);
  const accessToken = session?.access;
  if (!accessToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/books/detail/${id}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60, tags: [`book:${id}`] },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
