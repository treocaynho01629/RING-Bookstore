import { CouponCriteria } from "../models/couponCriteria";
import { CouponType } from "../models/couponType";
import { currencyFormat, numFormat } from "../utils/convert";

export interface CouponTypeMeta {
  icon: string;
  label: string;
  value: string;
  color: string;
  summary: string;
  summaryFull: string;
}

export interface CouponCriteriaMeta {
  label: string;
  value: string;
  condition: string;
  conditionAll: string;
  formatter: (value: number) => string;
  unit: string;
}

/**
 * Get coupon type meta
 * @param {CouponType} couponType
 * @returns {CouponTypeMeta}
 */
export const getCouponType = (couponType: CouponType): CouponTypeMeta => {
  switch (couponType) {
    case CouponType.SHIPPING:
      return {
        icon: "LocalShipping",
        label: "coupon.shipping.label",
        value: CouponType.SHIPPING,
        color: "primary",
        summary: "coupon.shipping.summary.default",
        summaryFull: "coupon.shipping.summary.full",
      };
    case CouponType.PRODUCT:
      return {
        icon: "LocalActivity",
        label: "coupon.product.label",
        value: CouponType.PRODUCT,
        color: "error",
        summary: "coupon.product.summary.default",
        summaryFull: "coupon.product.summary.full",
      };
    default:
      return {
        icon: "Help",
        label: "unknown",
        value: "UNKNOWN",
        color: "default",
        summary: "coupon.product.summary.default",
        summaryFull: "coupon.product.summary.full",
      };
  }
};

/**
 * Get coupon type options
 */
export const couponTypeOptions: CouponTypeMeta[] = (Object.keys(CouponType) as (keyof typeof CouponType)[]).map((k) =>
  getCouponType(CouponType[k])
);

/**
 * Get coupon criteria meta
 * @param {CouponCriteria} couponCriteria
 * @returns {CouponCriteriaMeta}
 */
export const getCouponCriteria = (couponCriteria: CouponCriteria): CouponCriteriaMeta => {
  switch (couponCriteria) {
    case CouponCriteria.VALUE:
      return {
        label: "coupon.value.label",
        value: CouponCriteria.VALUE,
        condition: "coupon.condition.default",
        conditionAll: "coupon.condition.all",
        formatter: (value: number) => currencyFormat.format(value),
        unit: "",
      };
    case CouponCriteria.QUANTITY:
      return {
        label: "coupon.quantity.label",
        value: CouponCriteria.QUANTITY,
        condition: "coupon.condition.default",
        conditionAll: "coupon.condition.all",
        formatter: (value: number) => numFormat.format(value),
        unit: "items",
      };
    default:
      return {
        label: "unknown",
        value: "UNKNOWN",
        condition: "unknown",
        conditionAll: "coupon.condition.all",
        formatter: (value: number) => currencyFormat.format(value),
        unit: "",
      };
  }
};

/**
 * Get coupon criteria options
 */
export const couponCriteriaOptions: CouponCriteriaMeta[] = (
  Object.keys(CouponCriteria) as (keyof typeof CouponCriteria)[]
).map((k) => getCouponCriteria(CouponCriteria[k]));
