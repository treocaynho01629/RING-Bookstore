import { useAppSelector, useAppDispatch } from "@ring/redux/hooks";
import { selectShop } from "../features/shops/shopReducer";
import { clearShop as clearCurrShop, setShop as setCurrShop } from "../features/shops/shopActions";

export interface Shop {
  id: number | null;
  name: string | null;
}

interface ShopState {
  shop: Shop | null;
  setShop: Function | null;
  clearShop: Function | null;
}

const useShop = (): ShopState => {
  const shop = useAppSelector(selectShop) ?? null;
  const dispatch = useAppDispatch();
  const setShop = (shop: Shop) => dispatch(setCurrShop(shop));
  const clearShop = () => dispatch(clearCurrShop());
  return {
    shop,
    setShop,
    clearShop,
  };
};
export default useShop;
