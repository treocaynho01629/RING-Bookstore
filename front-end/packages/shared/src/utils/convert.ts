export const numFormat = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  compactDisplay: "short",
});

export const currencyFormat = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  currencyDisplay: "narrowSymbol",
});

/**
 * Format the id with zeros padding.
 * @param id - The id to format.
 * @returns The formatted id string.
 */
export const idFormatter = (id: number): string => {
  return "#" + ("00000" + id).slice(-5);
};

/**
 * Format the date to ISO string.
 * @param date - The date to format.
 * @param locale - The locale to use.
 * @returns The formatted ISO string.
 */
export const dateFormatter = (date: Date, locale: string = "en-GB"): string => {
  return date.toLocaleDateString(locale);
};

/**
 * Format the date to time ISO string.
 * @param date - The date to format.
 * @param locale - The locale to use.
 * @returns The formatted time ISO string.
 */
export const timeFormatter = (date: Date, locale: string = "en-GB"): string => {
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
