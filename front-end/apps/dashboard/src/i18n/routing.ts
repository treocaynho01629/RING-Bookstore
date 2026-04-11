import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "@ring/shared/enums/locales";
import { LocaleType } from "@ring/shared/enums/locales";

export const routing = defineRouting({
  locales: locales,
  defaultLocale: defaultLocale,
  pathnames: {
    "/": "/",
    "/pathnames": {
      [LocaleType.VI.value]: "/duong-dan",
    },
  },
});
