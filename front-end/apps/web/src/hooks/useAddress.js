import { useDispatch, useSelector } from "react-redux";
import {
  addAddress,
  removeStateAddress,
  selectAddresses,
  selectDefaultAddress,
  clearStateDefaultAddress,
  setStateDefaultAddress,
} from "../features/addresses/addressReducer";

const useAddress = () => {
  const dispatch = useDispatch();
  const addresses = useSelector(selectAddresses);
  const defaultAddress = useSelector(selectDefaultAddress);

  const addNewAddress = (address) => {
    dispatch(addAddress(address));
  };
  const removeAddress = (id) => dispatch(removeStateAddress(id));
  const clearDefaultAddress = () => dispatch(clearStateDefaultAddress());
  const setDefaultAddress = (address) => dispatch(setStateDefaultAddress(address));

  return { addresses, defaultAddress, addNewAddress, removeAddress, clearDefaultAddress, setDefaultAddress };
};

export default useAddress;
