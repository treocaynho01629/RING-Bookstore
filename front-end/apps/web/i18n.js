import { initReactI18next } from "react-i18next";
import { locales } from "@ring/shared/enums/locales";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((lng, ns) => import(`../../packages/i18n/${ns}-${lng}.json`)))
  .on("failedLoading", (lng, ns, msg) => console.error(msg))
  .init({
    load: "currentOnly",
    fallbackLng: false,
    supportedLngs: locales,
    defaultNS: "client",
    fallbackNS: "common",
    ns: ["common", "validation", "client", "authenticated"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: [
        "querystring",
        "hash",
        "cookie",
        "localStorage",
        "sessionStorage",
        "navigator",
        "htmlTag",
        "path",
        "subdomain",
      ],
      caches: ["localStorage", "cookie"],
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
