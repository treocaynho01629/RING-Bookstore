import { persistReducer } from "redux-persist";
import StoreProvider from "@ring/redux/provider";
import authReducer from "@ring/redux/authReducer";
import appReducer from "./features/app/appReducer";
import cartReducer from "./features/cart/cartReducer";
import addressReducer from "./features/addresses/addressReducer";
import couponReducer from "./features/coupons/couponReducer";
import storage from "redux-persist/lib/storage";

const appPersistConfig = {
  key: "app",
  version: 1,
  storage: storage.default,
};

const authPersistConfig = {
  key: "auth",
  version: 1,
  storage: storage.default,
};

const cartPersistConfig = {
  key: "cart",
  version: 1,
  storage: storage.default,
};

const addressPersistConfig = {
  key: "address",
  version: 1,
  storage: storage.default,
};

const couponPersistConfig = {
  key: "coupon",
  version: 1,
  storage: storage.default,
};

// Web reducers
const reducers = {
  app: persistReducer(appPersistConfig, appReducer),
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  address: persistReducer(addressPersistConfig, addressReducer),
  coupon: persistReducer(couponPersistConfig, couponReducer),
};

const devTools = import.meta.env.VITE_NODE_ENV === "development";
const baseUrl = import.meta.env.VITE_API_URL;

export default function ViteStoreProvider({ children }) {
  return (
    <StoreProvider
      {...{
        reducers,
        devTools,
        baseUrl
      }}
    >
      {children}
    </StoreProvider>
  );
}
