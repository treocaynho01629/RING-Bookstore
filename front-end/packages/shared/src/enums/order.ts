import { OrderStatus } from "../models/orderStatus";

export interface OrderStatusMeta {
  value: string;
  label: string;
  color: string;
}

export interface OrderTrackingStepContent {
  step: number;
  summary: string;
  date?: Date;
  price?: number;
}

/**
 * Get order status meta
 * @param {OrderStatus} orderStatus
 * @returns {OrderStatusMeta}
 */
export const getOrderStatus = (orderStatus: OrderStatus): OrderStatusMeta => {
  switch (orderStatus) {
    case OrderStatus.COMPLETED:
      return { value: OrderStatus.COMPLETED, label: "order.status.completed.done", color: "success" };
    case OrderStatus.PENDING_PAYMENT:
      return { value: OrderStatus.PENDING_PAYMENT, label: "order.status.pending.payment", color: "warning" };
    case OrderStatus.PENDING:
      return { value: OrderStatus.PENDING, label: "order.status.pending.picking", color: "warning" };
    case OrderStatus.SHIPPING:
      return { value: OrderStatus.SHIPPING, label: "order.status.pending.delivering", color: "primary" };
    case OrderStatus.CANCELED:
      return { value: OrderStatus.CANCELED, label: "order.status.completed.cancelled", color: "error" };
    case OrderStatus.PENDING_RETURN:
      return { value: OrderStatus.PENDING_RETURN, label: "order.status.pending.return.returning", color: "warning" };
    case OrderStatus.PENDING_REFUND:
      return { value: OrderStatus.PENDING_REFUND, label: "order.status.pending.refund", color: "warning" };
    case OrderStatus.REFUNDED:
      return { value: OrderStatus.REFUNDED, label: "order.status.completed.refunded", color: "info" };
    default:
      return { value: "UNKNOWN", label: "unknown", color: "default" };
  }
};

/**
 * Get order status options
 */
export const orderStatusOptions: OrderStatusMeta[] = (Object.keys(OrderStatus) as (keyof typeof OrderStatus)[]).map(
  (k) => getOrderStatus(OrderStatus[k])
);
