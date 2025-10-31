import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "@ring/i18n/locales";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  if (!hasLocale(locales, requested)) notFound();

  return {
    locale: requested,
    messages: (await import(`@ring/i18n/messages/common-${requested}`)).default,
  };
});
