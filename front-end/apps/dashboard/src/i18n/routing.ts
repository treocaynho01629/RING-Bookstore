import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "@ring/i18n/locales";

export const routing = defineRouting({
  locales: locales,
  defaultLocale: defaultLocale,
});
