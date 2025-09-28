import "./globals.css";
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeContextProvider } from "@ring/ui";
import { theme } from "../lib/theme";
import { getServerSession, Session } from "next-auth";
import localFont from "next/font/local";
import NextStoreProvider from "./NextStoreProvider";
import PageLayout from "../components/layout/PageLayout";
import AuthProvider from "./context/AuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "RING! - Dashboard",
  description: "Manage your book store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = (await getServerSession()) as Session;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextStoreProvider>
          <AuthProvider session={session}>
            <AppRouterCacheProvider>
              <ThemeContextProvider theme={theme}>
                <PageLayout>{children}</PageLayout>
              </ThemeContextProvider>
            </AppRouterCacheProvider>
          </AuthProvider>
        </NextStoreProvider>
      </body>
    </html>
  );
}
