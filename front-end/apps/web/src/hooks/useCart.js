import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  changeQuantity,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
  removeItems,
  resetCart,
  selectCartProducts,
  replaceInCart,
  removeShopItem,
} from "../features/cart/cartReducer";
import { useTranslation } from "react-i18next";

const useCart = () => {
  const dispatch = useDispatch();
  const cartProducts = useSelector(selectCartProducts);
  const { t } = useTranslation();

  // Cart
  const addProduct = async (item, quantity) => {
    const { enqueueSnackbar } = await import("notistack");
    enqueueSnackbar(t("cart.add.success"), { variant: "success" });
    dispatch(
      addToCart({
        id: item.id,
        slug: item.slug,
        title: item.title,
        price: item.price,
        discount: item.discount,
        srcSet: item.srcSet,
        amount: item.amount,
        shopId: item.shopId,
        shopName: item.shopName,
        quantity,
      })
    );
  };
  const replaceProduct = (item) => {
    dispatch(
      replaceInCart({
        id: item.id,
        slug: item.slug,
        title: item.title,
        price: item.price,
        discount: item.discount,
        srcSet: item.srcSet,
        amount: item.amount,
        shopId: item.shopId,
        shopName: item.shopName,
      })
    );
  };
  const increaseAmount = (id) => dispatch(increaseQuantity(id));
  const decreaseAmount = (id) => dispatch(decreaseQuantity(id));
  const changeAmount = ({ id, quantity }) => dispatch(changeQuantity({ id, quantity }));
  const removeProduct = (id) => dispatch(removeItem(id));
  const removeProducts = (ids) => dispatch(removeItems(ids));
  const removeShopProduct = (id) => dispatch(removeShopItem(id));
  const clearCart = () => dispatch(resetCart());

  return {
    cartProducts,
    addProduct,
    replaceProduct,
    decreaseAmount,
    increaseAmount,
    changeAmount,
    removeProduct,
    removeProducts,
    removeShopProduct,
    clearCart,
  };
};

export default useCart;
