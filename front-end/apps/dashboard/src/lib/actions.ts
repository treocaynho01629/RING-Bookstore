"use server";

import { revalidateTag } from "next/cache";

export async function revalidateBook(bookId: number | string) {
  const id = String(bookId ?? "").trim();
  if (!id) return;

  revalidateTag(`book:${id}`, "max");
}
