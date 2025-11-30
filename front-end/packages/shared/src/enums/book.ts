import { BookLanguage } from "../models/bookLanguage";
import { BookType } from "../models/bookType";

export interface BookLanguageMeta {
  label: string;
  value: string;
}

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

export interface BookTypeMeta {
  label: string;
  value: string;
}

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
