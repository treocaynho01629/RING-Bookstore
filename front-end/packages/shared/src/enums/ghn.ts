export const GHNReturnStatus = {
  WAITING_FOR_RETURN: "waiting_for_return",
  RETURN: "return",
  RETURN_TRANSPORTING: "return_transporting",
  RETURN_SORTING: "return_sorting",
  RETURNING: "returning",
  RETURNED: "returned",
} as const;

export const GHNCancelStatus = {
  CANCEL: "cancel",
} as const;

export const GHNFailStatus = {
  RETURN_FAILED: "return_failed",
  DELIVERY_FAILED: "delivery_failed",
  DAMAGE: "damage",
  LOST: "lost",
  EXCEPTION: "exception",
} as const;

export const GHNTransportStatus = {
  STORING: "storing",
  TRANSPORTING: "transporting",
  SORTING: "sorting",
  DELIVERING: "delivering",
  MONEY_COLLECT_DELIVERING: "money_collect_delivering",
  DELIVERED: "delivered",
} as const;

export const GHNPickupStatus = {
  READY_TO_PICK: "ready_to_pick",
  PICKING: "picking",
  MONEY_COLLECT_PICKING: "money_collect_picking",
  PICKED: "picked",
} as const;

export const GHNStatus = {
  ...GHNReturnStatus,
  ...GHNTransportStatus,
  ...GHNPickupStatus,
  ...GHNFailStatus,
} as const;

export interface GHNStatusMeta {
  value: string;
  label: string;
  color: string;
}

/**
 * Get GHN order status meta
 * @param {string} status
 * @returns {GHNStatusMeta}
 */
export const getGHNStatus = (status: string): GHNStatusMeta => {
  switch (status) {
    case GHNReturnStatus.WAITING_FOR_RETURN:
      return {
        value: GHNReturnStatus.WAITING_FOR_RETURN,
        label: "order.status.pending.return.waiting",
        color: "warning",
      };
    case GHNReturnStatus.RETURN:
      return { value: GHNReturnStatus.RETURN, label: "order.status.return", color: "warning" };
    case GHNReturnStatus.RETURN_TRANSPORTING:
      return {
        value: GHNReturnStatus.RETURN_TRANSPORTING,
        label: "order.status.pending.return.transporting",
        color: "warning",
      };
    case GHNReturnStatus.RETURN_SORTING:
      return { value: GHNReturnStatus.RETURN_SORTING, label: "order.status.pending.return.sorting", color: "warning" };
    case GHNReturnStatus.RETURNING:
      return { value: GHNReturnStatus.RETURNING, label: "order.status.pending.return.returning", color: "warning" };
    case GHNReturnStatus.RETURNED:
      return { value: GHNReturnStatus.RETURNED, label: "order.status.completed.returned", color: "info" };
    case GHNCancelStatus.CANCEL:
      return { value: GHNCancelStatus.CANCEL, label: "order.status.cancel", color: "error" };
    case GHNFailStatus.RETURN_FAILED:
      return { value: GHNFailStatus.RETURN_FAILED, label: "order.status.failed.return", color: "error" };
    case GHNFailStatus.DELIVERY_FAILED:
      return { value: GHNFailStatus.DELIVERY_FAILED, label: "order.status.failed.delivery", color: "error" };
    case GHNFailStatus.DAMAGE:
      return { value: GHNFailStatus.DAMAGE, label: "order.status.failed.damage", color: "error" };
    case GHNFailStatus.LOST:
      return { value: GHNFailStatus.LOST, label: "order.status.failed.lost", color: "error" };
    case GHNFailStatus.EXCEPTION:
      return { value: GHNFailStatus.EXCEPTION, label: "order.status.failed.exception", color: "error" };
    case GHNTransportStatus.STORING:
      return { value: GHNTransportStatus.STORING, label: "order.status.pending.storing", color: "warning" };
    case GHNTransportStatus.TRANSPORTING:
      return { value: GHNTransportStatus.TRANSPORTING, label: "order.status.pending.transporting", color: "warning" };
    case GHNTransportStatus.SORTING:
      return { value: GHNTransportStatus.SORTING, label: "order.status.pending.sorting", color: "warning" };
    case GHNTransportStatus.DELIVERING:
      return { value: GHNTransportStatus.DELIVERING, label: "order.status.pending.delivering", color: "info" };
    case GHNTransportStatus.MONEY_COLLECT_DELIVERING:
      return {
        value: GHNTransportStatus.MONEY_COLLECT_DELIVERING,
        label: "order.status.pending.cod",
        color: "warning",
      };
    case GHNTransportStatus.DELIVERED:
      return { value: GHNTransportStatus.DELIVERED, label: "order.status.completed.delivered", color: "success" };
    case GHNPickupStatus.READY_TO_PICK:
      return { value: GHNPickupStatus.READY_TO_PICK, label: "order.status.ready", color: "warning" };
    case GHNPickupStatus.PICKING:
      return { value: GHNPickupStatus.PICKING, label: "order.status.pending.picking", color: "warning" };
    case GHNPickupStatus.MONEY_COLLECT_PICKING:
      return { value: GHNPickupStatus.MONEY_COLLECT_PICKING, label: "order.status.pending.money", color: "warning" };
    case GHNPickupStatus.PICKED:
      return { value: GHNPickupStatus.PICKED, label: "order.status.completed.picked", color: "warning" };
    default:
      return { value: "UNKNOWN", label: "unknown", color: "default" };
  }
};
