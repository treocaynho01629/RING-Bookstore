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
import useAuth from "./useAuth";
import {
  useClearCartServerMutation,
  useRemoveCartItemMutation,
  useRemoveCartItemsMutation,
  useUpdateCartItemQuantityMutation,
  useUpsertCartItemMutation,
} from "../features/cart/cartApiSlice";

const useCart = () => {
  const dispatch = useDispatch();
  const cartProducts = useSelector(selectCartProducts);
  const { t } = useTranslation();
  const { username } = useAuth();
  const [upsertCartItem] = useUpsertCartItemMutation();
  const [updateCartItemQuantity] = useUpdateCartItemQuantityMutation();
  const [removeCartItem] = useRemoveCartItemMutation();
  const [removeCartItems] = useRemoveCartItemsMutation();
  const [clearCartServer] = useClearCartServerMutation();

  /**
   * Add a product to the cart
   * @param {Object} item - The product to add
   * @param {number} quantity - The quantity of the product to add
   */
  const addProduct = (item, quantity) => {
    import("notistack")
      .then(({ enqueueSnackbar }) => enqueueSnackbar(t("cart.add.success"), { variant: "success" }))
      .catch((error) => console.error(error));
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

    // Update server cart
    if (username) {
      upsertCartItem({ productId: item.id, quantity: +quantity })
        .unwrap()
        .catch((error) => console.error(error));
    }
  };

  /**
   * Replace a product in the cart
   * @param {Object} item - The product to replace
   */
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
        quantity: item.quantity,
      })
    );
  };

  /**
   * Increase the quantity of a product in the cart
   * @param {number} id - The id of the product to increase
   * @param {boolean} updateServer - Whether to update the server cart
   */
  const increaseAmount = (id, updateServer = true) => {
    const item = cartProducts.find((product) => product.id === id);
    if (!item) return;

    dispatch(increaseQuantity(id));

    // Update server cart
    if (username && updateServer) {
      updateCartItemQuantity({
        productId: item.id,
        quantity: +item.quantity + 1,
      })
        .unwrap()
        .catch((error) => console.error(error));
    }
  };

  /**
   * Decrease the quantity of a product in the cart
   * @param {number} id - The id of the product to decrease
   * @param {boolean} updateServer - Whether to update the server cart
   */
  const decreaseAmount = (id, updateServer = true) => {
    const item = cartProducts.find((product) => product.id === id);
    if (!item) return;

    if (+item.quantity <= 1) {
      dispatch(removeItem(id));
    } else {
      dispatch(decreaseQuantity(id));
    }

    // Update server cart
    if (username && updateServer) {
      if (+item.quantity <= 1) {
        removeCartItem(item.id)
          .unwrap()
          .catch((error) => console.error(error));
      } else {
        updateCartItemQuantity({
          productId: item.id,
          quantity: +item.quantity - 1,
        })
          .unwrap()
          .catch((error) => console.error(error));
      }
    }
  };

  /**
   * Change the quantity of a product in the cart
   * @param {Object} item - The product to change
   * @param {number} quantity - The quantity of the product to change
   */
  const changeAmount = ({ id, quantity }) => {
    dispatch(changeQuantity({ id, quantity }));

    // Update server cart
    const item = cartProducts.find((product) => product.id === id);
    const validQuantity = Number(quantity);
    if (!username || !item || !Number.isFinite(validQuantity) || validQuantity < 1) return;

    updateCartItemQuantity({
      productId: item.id,
      quantity: validQuantity,
    })
      .unwrap()
      .catch((error) => console.error(error));
  };

  /**
   * Remove a product from the cart
   * @param {number} id - The id of the product to remove
   * @param {boolean} updateServer - Whether to update the server cart
   */
  const removeProduct = (id, updateServer = true) => {
    const item = cartProducts.find((product) => product.id === id);
    dispatch(removeItem(id));

    // Update server cart
    if (username && updateServer && item) {
      removeCartItem(item.id)
        .unwrap()
        .catch((error) => console.error(error));
    }
  };

  /**
   * Remove multiple products from the cart
   * @param {number[]} ids - The ids of the products to remove
   * @param {boolean} updateServer - Whether to update the server cart
   */
  const removeProducts = (ids, updateServer = true) => {
    dispatch(removeItems(ids));

    // Update server cart
    if (username && updateServer) {
      const serverProductIds = cartProducts
        .filter((item) => ids.includes(item.id))
        .map((item) => item.id)
        .filter(Boolean);
      if (serverProductIds.length) {
        removeCartItems(serverProductIds)
          .unwrap()
          .catch((error) => console.error(error));
      }
    }
  };

  /**
   * Remove a product from a shop
   * @param {number} id - The id of the shop to remove the product from
   * @param {boolean} updateServer - Whether to update the server cart
   */
  const removeShopProduct = (id, updateServer = true) => {
    dispatch(removeShopItem(id));

    // Update server cart
    if (username && updateServer) {
      const serverProductIds = cartProducts
        .filter((item) => item.shopId === id)
        .map((item) => item.id)
        .filter(Boolean);
      if (serverProductIds.length) {
        removeCartItems(serverProductIds)
          .unwrap()
          .catch((error) => console.error(error));
      }
    }
  };

  /**
   * Clear the cart
   * @param {boolean} updateServer - Whether to update the server cart
   */
  const clearCart = (updateServer = true) => {
    dispatch(resetCart());

    // Clear server cart
    if (username && updateServer) {
      clearCartServer()
        .unwrap()
        .catch((error) => console.error(error));
    }
  };

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
