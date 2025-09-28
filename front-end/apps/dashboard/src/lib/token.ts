"use server";

// import { deleteCookie, setCookie } from "cookies-next";
import { cookies } from "next/headers";

const AUTH_KEY = "authToken";

export const setAuthCookie = async (token: string) => {
  const toBase64 = Buffer.from(token).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_KEY,
    value: toBase64,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
};

export const clearAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_KEY);
};
