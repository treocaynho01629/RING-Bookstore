import { createSlice } from "@reduxjs/toolkit";
import { clearAuth } from "@ring/redux/authActions";

const initialState = { addresses: [], defaultAddress: null };

// TODO: Update default address on fetch addresses, and clear all addresses when logout
export const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    // Add address
    addAddress: (state, action) => {
      const item = state.addresses.find((item) => item.id === action.payload.id);
      if (item) {
        // Update old address
        item.name = action.payload.name;
        item.company = action.payload.company;
        item.phone = action.payload.phone;
        item.city = action.payload.city;
        item.address = action.payload.address;
        item.type = action.payload.type;
      } else {
        // Add if not exists
        const address = action.payload;
        // Id increament
        const id = state.addresses.length ? state.addresses[state.addresses.length - 1].id.substring(2) + 1 : 0;
        address.id = `s-${id}`;
        state.addresses.push(address);
      }
    },
    removeStateAddress: (state, action) => {
      state.addresses = state.addresses.filter((item) => item.id !== action.payload);
    },
    clearStateDefaultAddress: (state) => {
      state.defaultAddress = null;
    },
    setStateDefaultAddress: (state, action) => {
      state.defaultAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearAuth, () => initialState);
  },
});

export const { addAddress, removeStateAddress, clearStateDefaultAddress, setStateDefaultAddress } =
  addressSlice.actions;
export const selectAddresses = (state) => state.address.addresses;
export const selectDefaultAddress = (state) => state.address.defaultAddress;

export default addressSlice.reducer;
