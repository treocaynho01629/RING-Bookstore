import { PaymentType } from "../models/paymentType";
import { PaymentStatus } from "../models/paymentStatus";

export interface PaymentTypeMeta {
  value: string;
  label: string;
  description: string;
  summary: string;
  icon: string;
}

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

export interface PaymentStatusMeta {
  value: string;
  label: string;
  color: string;
}

export const getPaymentStatus = (paymentStatus: PaymentStatus): PaymentStatusMeta => {
  switch (paymentStatus) {
    case PaymentStatus.PENDING:
      return {
        value: PaymentStatus.PENDING,
        label: "payment.status.pending",
        color: "warning",
      };
    case PaymentStatus.PAID:
      return {
        value: PaymentStatus.PAID,
        label: "payment.status.paid",
        color: "success",
      };
    case PaymentStatus.CANCELED:
      return {
        value: PaymentStatus.CANCELED,
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
