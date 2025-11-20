import { ShippingType } from "../models/shippingType";

export interface ShippingTypeMeta {
  value: string;
  label: string;
  color: string;
  multiplier: number;
  icon: string;
  estimate: string;
}

export const getShippingType = (shippingType: ShippingType): ShippingTypeMeta => {
  switch (shippingType) {
    case ShippingType.ECONOMY:
      return {
        value: ShippingType.ECONOMY,
        label: "shipping.economy",
        color: "warning",
        multiplier: 1,
        icon: "LocalShippingOutlined",
        estimate: "2-4",
      };
    case ShippingType.STANDARD:
      return {
        value: ShippingType.STANDARD,
        label: "shipping.standard",
        color: "success",
        multiplier: 0.2,
        icon: "SavingsOutlined",
        estimate: "5-7",
      };
    case ShippingType.EXPRESS:
      return {
        value: ShippingType.EXPRESS,
        label: "shipping.express",
        color: "warning",
        multiplier: 1.5,
        icon: "RocketLaunchOutlined",
        estimate: "1-2",
      };
    default:
      return {
        value: "UNKNOWN",
        label: "unknown",
        color: "error",
        multiplier: 0,
        icon: "UnknownOutlined",
        estimate: "0",
      };
  }
};
