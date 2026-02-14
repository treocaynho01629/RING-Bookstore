import { BookLanguage } from "../models/bookLanguage";
import { BookType } from "../models/bookType";

export interface BookLanguageMeta {
  label: string;
  value: string;
}

export interface BookTypeMeta {
  label: string;
  value: string;
}

/**
 * Get book language meta
 * @param {BookLanguage} bookLanguage
 * @returns {BookLanguageMeta}
 */
export const getBookLanguage = (bookLanguage: BookLanguage): BookLanguageMeta => {
  switch (bookLanguage) {
    case BookLanguage.VN:
      return {
        label: "language.vi",
        value: "VN",
      };
    case BookLanguage.EN:
      return {
        label: "language.en",
        value: "EN",
      };
    case BookLanguage.JP:
      return {
        label: "language.jp",
        value: "JP",
      };
    case BookLanguage.CN:
      return {
        label: "language.cn",
        value: "CN",
      };
    default:
      return {
        label: "unknown",
        value: "UNKNOWN",
      };
  }
};

/**
 * Get book language options
 */
export const bookLanguageOptions: BookLanguageMeta[] = (Object.keys(BookLanguage) as (keyof typeof BookLanguage)[]).map(
  (k) => getBookLanguage(BookLanguage[k])
);

/**
 * Get book type meta
 * @param {BookType} bookType
 * @returns {BookTypeMeta}
 */
export const getBookType = (bookType: BookType): BookTypeMeta => {
  switch (bookType) {
    case BookType.HARD_COVER:
      return {
        label: "product.type.hard",
        value: "HARD_COVER",
      };
    case BookType.SOFT_COVER:
      return {
        label: "product.type.soft",
        value: "SOFT_COVER",
      };
    case BookType.WOOD_COVER:
      return {
        label: "product.type.wood",
        value: "WOOD_COVER",
      };
    case BookType.SLIP_COVER:
      return {
        label: "product.type.slip",
        value: "SLIP_COVER",
      };
    case BookType.OTHERS:
      return {
        label: "other",
        value: "OTHERS",
      };
    default:
      return {
        label: "unknown",
        value: "UNKNOWN",
      };
  }
};

/**
 * Get book type options
 */
export const bookTypeOptions: BookTypeMeta[] = (Object.keys(BookType) as (keyof typeof BookType)[]).map((k) =>
  getBookType(BookType[k])
);
