import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "@ring/shared/enums/locales";

export const routing = defineRouting({
  locales: locales,
  defaultLocale: defaultLocale,
  pathnames: {
    "/": "/",
    "/pathnames": "/pathnames",
    "/order": "/order",
    "/order/[id]": "/order/[id]",
    "/user": "/user",
    "/user/[id]": "/user/[id]",
    "/product": "/product",
    "/product/[id]": "/product/[id]",
    "/shop": "/shop",
    "/shop/[id]": "/shop/[id]"
  },
});
