import { useDispatch, useSelector } from "react-redux";
import { selectShop } from "../features/shops/shopReducer";
import { setShop as setCurrShop } from "../features/shops/shopActions";

const useShop = () => {
  const shop = useSelector(selectShop);
  const dispatch = useDispatch();
  const setShop = (shop) => dispatch(setCurrShop(shop));

  return {
    shop,
    setShop,
  };
};
export default useShop;
