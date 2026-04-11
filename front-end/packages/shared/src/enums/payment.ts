import { PaymentType } from "../models/paymentType";
import { PaymentStatus } from "../models/paymentStatus";

export interface PaymentTypeMeta {
  value: string;
  label: string;
  description: string;
  summary: string;
  icon: string;
}

export interface PaymentStatusMeta {
  value: string;
  label: string;
  color: string;
}

/**
 * Get payment type meta
 * @param {PaymentType} paymentType
 * @returns {PaymentTypeMeta}
 */
export const getPaymentType = (paymentType: PaymentType): PaymentTypeMeta => {
  switch (paymentType) {
    case PaymentType.CASH:
      return {
        value: PaymentType.CASH,
        label: "payment.cash.label",
        description: "",
        summary: "payment.cash.summary",
        icon: "LocalAtm",
      };
    case PaymentType.ONLINE_PAYMENT:
      return {
        value: PaymentType.ONLINE_PAYMENT,
        label: "payment.online.label",
        description: "payment.online.description",
        summary: "payment.online.summary",
        icon: "BookOnline",
      };
    default:
      return {
        value: "UNKNOWN",
        label: "unknown",
        description: "",
        summary: "",
        icon: "Help",
      };
  }
};

/**
 * Get payment type options
 */
export const paymentTypeOptions: PaymentTypeMeta[] = (Object.keys(PaymentType) as (keyof typeof PaymentType)[]).map(
  (k) => getPaymentType(PaymentType[k])
);

/**
 * Get payment status meta
 * @param {PaymentStatus} paymentStatus
 * @returns {PaymentStatusMeta}
 */
export const getPaymentStatus = (paymentStatus: PaymentStatus): PaymentStatusMeta => {
  switch (paymentStatus) {
    case PaymentStatus.PENDING:
      return {
        value: PaymentStatus.PENDING,
        label: "payment.status.pending.payment",
        color: "warning",
      };
    case PaymentStatus.PAID:
      return {
        value: PaymentStatus.PAID,
        label: "payment.status.paid",
        color: "success",
      };
    case PaymentStatus.CANCELLED:
      return {
        value: PaymentStatus.CANCELLED,
        label: "payment.status.canceled",
        color: "error",
      };
    case PaymentStatus.PENDING_REFUND:
      return {
        value: PaymentStatus.PENDING_REFUND,
        label: "payment.status.pending.refund",
        color: "warning",
      };
    case PaymentStatus.REFUNDED:
      return {
        value: PaymentStatus.REFUNDED,
        label: "payment.status.refunded",
        color: "error",
      };
    default:
      return {
        value: "UNKNOWN",
        label: "unknown",
        color: "default",
      };
  }
};

/**
 * Get payment status options
 */
export const paymentStatusOptions: PaymentStatusMeta[] = (
  Object.keys(PaymentStatus) as (keyof typeof PaymentStatus)[]
).map((k) => getPaymentStatus(PaymentStatus[k]));
