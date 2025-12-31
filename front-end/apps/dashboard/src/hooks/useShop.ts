import { useAppSelector, useAppDispatch } from "@ring/redux/hooks";
import { selectShop } from "../features/shops/shopReducer";
import { setShop as setCurrShop } from "../features/shops/shopActions";

interface ShopState {
  shop: number | null;
  setShop: Function | null;
}

const useShop = (): ShopState => {
  const shop = useAppSelector(selectShop) ?? null;
  const dispatch = useAppDispatch();
  const setShop = (shop: number) => dispatch(setCurrShop(shop));

  return {
    shop,
    setShop,
  };
};
export default useShop;
