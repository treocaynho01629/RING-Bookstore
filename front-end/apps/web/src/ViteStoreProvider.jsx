import { persistReducer } from "redux-persist";
import StoreProvider from "@ring/redux/provider";
import enumReducer from "@ring/redux/enumReducer";
import authReducer from "@ring/redux/authReducer";
import appReducer from "./features/app/appReducer";
import cartReducer from "./features/cart/cartReducer";
import addressReducer from "./features/addresses/addressReducer";
import couponReducer from "./features/coupons/couponReducer";
import storage from "redux-persist/lib/storage";

const appPersistConfig = {
  key: "app",
  version: 1,
  storage,
};

const enumPersistConfig = {
  key: "enum",
  version: 1,
  storage,
};

const authPersistConfig = {
  key: "auth",
  version: 1,
  storage,
};

const cartPersistConfig = {
  key: "cart",
  version: 1,
  storage,
};

const addressPersistConfig = {
  key: "address",
  version: 1,
  storage,
};

const couponPersistConfig = {
  key: "coupon",
  version: 1,
  storage,
};

// Web reducers
const reducers = {
  app: persistReducer(appPersistConfig, appReducer), //APP
  enum: persistReducer(enumPersistConfig, enumReducer), //ENUM
  auth: persistReducer(authPersistConfig, authReducer), //AUTH
  cart: persistReducer(cartPersistConfig, cartReducer), //CART
  address: persistReducer(addressPersistConfig, addressReducer), //ADDRESS
  coupon: persistReducer(couponPersistConfig, couponReducer), //COUPON
};

const devTools = import.meta.env.VITE_NODE_ENV === "development";

export default function ViteStoreProvider({ children }) {
  return (
    <StoreProvider
      {...{
        reducers,
        devTools,
      }}
    >
      {children}
    </StoreProvider>
  );
}
