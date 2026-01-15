import { createAction } from "@reduxjs/toolkit";

export const setShop = createAction<{ id?: number | null; name?: string | null }>("shop/setShop");
export const clearShop = createAction("shop/clearShop");
