import { createSlice } from "@reduxjs/toolkit";

const initialState = { addresses: [] };

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
  },
});

export const { addAddress, removeStateAddress } = addressSlice.actions;
export const selectAddresses = (state) => state.address.addresses;

export default addressSlice.reducer;
