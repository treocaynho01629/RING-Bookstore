import { getRequestConfig } from "next-intl/server";
import { locales } from "@ring/shared/enums/locales";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  if (!hasLocale(locales, requested)) notFound();

  // Load all locales as one object
  const common = await import(`@ring/i18n/common-${requested}.json`);
  // const dashboard = await import(`@ring/i18n/dashboard-${requested}.json`);
  const authenticated = await import(`@ring/i18n/authenticated-${requested}.json`);
  const uncommon = await import(`@ring/i18n/uncommon-${requested}.json`);
  const validation = await import(`@ring/i18n/validation-${requested}.json`);

  return {
    locale: requested,
    messages: {
      ...common.default,
      // ...dashboard.default,
      ...authenticated.default,
      ...uncommon.default,
      ...validation.default,
    },
  };
});
