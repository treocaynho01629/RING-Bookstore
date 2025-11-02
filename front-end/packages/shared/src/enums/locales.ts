export const locales = ["en", "vi"] as const;

export const LocaleType = Object.freeze({
  EN: { value: "en", label: "English" },
  VI: { value: "vi", label: "Tiếng Việt" },
});

export const defaultLocale = "en";
