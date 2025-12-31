import { OrderStatus } from "../models/orderStatus";

export interface OrderStatusMeta {
  value: string;
  label: string;
  color: string;
}

export const getOrderStatus = (orderStatus: OrderStatus): OrderStatusMeta => {
  switch (orderStatus) {
    case OrderStatus.COMPLETED:
      return { value: OrderStatus.COMPLETED, label: "order.status.completed", color: "success" };
    case OrderStatus.PENDING_PAYMENT:
      return { value: OrderStatus.PENDING_PAYMENT, label: "order.status.pending.payment", color: "warning" };
    case OrderStatus.PENDING:
      return { value: OrderStatus.PENDING, label: "order.status.pending.seller", color: "warning" };
    case OrderStatus.SHIPPING:
      return { value: OrderStatus.SHIPPING, label: "order.status.shipping", color: "info" };
    case OrderStatus.CANCELED:
      return { value: OrderStatus.CANCELED, label: "order.status.canceled", color: "error" };
    case OrderStatus.PENDING_RETURN:
      return { value: OrderStatus.PENDING_RETURN, label: "order.status.pending.return", color: "warning" };
    case OrderStatus.PENDING_REFUND:
      return { value: OrderStatus.PENDING_REFUND, label: "order.status.pending.refund", color: "warning" };
    case OrderStatus.REFUNDED:
      return { value: OrderStatus.REFUNDED, label: "order.status.refunded", color: "error" };
    default:
      return { value: "UNKNOWN", label: "unknown", color: "error" };
  }
};
