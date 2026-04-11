import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { options } from "@/lib/authOptions";

interface RevalidateBookBody {
  id?: number | string;
  path?: string;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RevalidateBookBody;
  try {
    body = (await request.json()) as RevalidateBookBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const id = String(body?.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Book id is required" }, { status: 400 });
  }

  revalidateTag(`book:${id}`);

  const path = typeof body?.path === "string" ? body.path.trim() : "";
  if (path.startsWith("/")) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true });
}
