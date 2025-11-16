import { AddressType } from "../models/addressType";

export interface AddressTypeMeta {
  label: string;
  value: string;
  color: string;
}

export const getAddressType = (addressType: AddressType): AddressTypeMeta => {
  switch (addressType) {
    case AddressType.HOME:
      return {
        label: "address.type.home",
        value: AddressType.HOME,
        color: "primary",
      };
    case AddressType.OFFICE:
      return {
        label: "address.type.office",
        value: AddressType.OFFICE,
        color: "info",
      };
    default:
      return {
        label: "unknown",
        value: "UNKNOWN",
        color: "default",
      };
  }
};