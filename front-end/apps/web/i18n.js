import { initReactI18next } from "react-i18next";
import { locales, defaultLocale } from "@ring/i18n/locales";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en_common from "@ring/i18n/messages/common-en";
import vi_common from "@ring/i18n/messages/common-vi";

const resources = {
  en: {
    common: en_common,
  },
  vi: {
    common: vi_common,
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: defaultLocale,
    supportedLngs: locales,
    defaultNS: "common",
    ns: ["common"],
    resources,

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },

    detection: {
      // Order and from where user language should be detected
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

      // Cache user language on
      caches: ["localStorage", "cookie"],
    },
  });

export default i18n;
