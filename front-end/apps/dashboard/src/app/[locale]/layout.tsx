import "./globals.css";
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { getServerSession, Session } from "next-auth";
import { locales } from "@ring/shared/enums/locales";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { options } from "@/lib/authOptions";
import ThemeContextProvider from "@ring/ui/ThemeContextProvider";
import localFont from "next/font/local";
import NextStoreProvider from "../NextStoreProvider";
import PageLayout from "../../components/layout/PageLayout";
import AuthProvider from "../context/AuthProvider";

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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: Readonly<RootLayoutProps>) {
  const { locale } = await params;
  const session = (await getServerSession(options)) as Session;
  const messages = await getMessages();

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <NextStoreProvider>
            <AuthProvider session={session}>
              <AppRouterCacheProvider>
                <ThemeContextProvider>
                  <PageLayout>{children}</PageLayout>
                </ThemeContextProvider>
              </AppRouterCacheProvider>
            </AuthProvider>
          </NextStoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
