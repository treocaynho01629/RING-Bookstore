import { isEqual } from "lodash-es";
import useCart from "./useCart";

const tempShippingFee = 10000;

const useCheckout = () => {
  const { cartProducts, replaceProduct, removeProduct, removeShopProduct } = useCart();

  /**
   * Estimate cart total price
   * @param {Object} cart - Cart object
   * @returns {Object} - Estimated cart object
   */
  const estimateCart = (cart) => {
    let estimated = { deal: 0, subTotal: 0, shipping: 0, total: 0 }; //Initial value
    let checkState = { value: 0, quantity: 0, details: [] };
    let cartDetails = {};

    if (cart?.cart?.length) {
      let totalDeal = 0;
      let subTotal = 0;
      let totalQuantity = 0;
      const shipping = tempShippingFee * (cart?.cart?.length || 0);

      // Loop through cart and calculate
      cart?.cart?.forEach((detail) => {
        let deal = 0;
        let productTotal = 0;
        let quantity = 0;

        detail?.items?.forEach((item) => {
          const discount = Math.round(item.price * item.discount);

          // Calculate deal and total price
          deal += item.quantity * discount;
          productTotal += item.quantity * item.price;
          quantity += item.quantity;
        });

        // Set value and cart state
        totalDeal += deal;
        subTotal += productTotal;
        totalQuantity += quantity;
        cartDetails[detail?.shopId] = { value: productTotal - deal, quantity };
      });

      // Set values
      estimated = {
        deal: totalDeal,
        subTotal,
        shipping,
        total: subTotal + shipping - totalDeal,
      };

      // Set cart state
      checkState = {
        value: subTotal - totalDeal,
        quantity: totalQuantity,
        details: cartDetails,
      };
    }

    return { checkState, estimated };
  };

  /**
   * Sync client cart with server
   * @param {Object} cart - Cart object
   * @param {Function} setDiscount - Function to set discount
   * @param {Function} setShopDiscount - Function to set shop discount
   * @param {Object} coupon - Coupon object
   * @param {Function} setCoupon - Function to set coupon
   * @param {Object} shopCoupon - Shop coupon object
   * @param {Function} setShopCoupon - Function to set shop coupon
   * @param {Function} onWarning - Function to handle warning
   * @param {Function} generateErrorMessage - Function to generate error message
   * @param {Function} handleClearSelect - Function to handle clear select items
   * @returns {void}
   */
  const syncCart = (
    cart,
    setDiscount,
    setShopDiscount,
    coupon,
    setCoupon,
    shopCoupon,
    setShopCoupon,
    onWarning,
    generateErrorMessage,
    handleClearSelect
  ) => {
    if (!cartProducts?.length) return;
    const details = cart?.details;
    let isWarning = false;
    let shopsDiscountValue = 0;
    let errorMsg = "";

    details.forEach((detail) => {
      // Shop name exist => Replace all items from the shop
      if (detail.shopName != null) {
        const items = detail?.items;

        items.forEach((item) => {
          // Item title exist => Replace old item in cart with new item info from server
          if (item.title != null) {
            const newItem = {
              ...item,
              shopId: detail.shopId,
              shopName: detail.shopName,
            };

            replaceProduct(newItem);
            // Item title not exist => Remove invalid item and add to error message
          } else {
            // Generate error message
            errorMsg += generateErrorMessage(null, item.id);

            // Remove items from cart
            handleClearSelect();
            removeProduct(item.id);

            // Warning dialog flag
            isWarning = true;
          }
        }); // End of items loop

        // Replace recommended coupons
        const discountValue = detail?.couponDiscount + detail?.shippingDiscount;
        shopsDiscountValue += discountValue;
        setShopDiscount((prev) => ({
          ...prev,
          [detail?.shopId]: discountValue,
        }));
        if (
          detail?.coupon != null &&
          shopCoupon[detail?.shopId] !== null &&
          !isEqual(shopCoupon[detail?.shopId], detail.coupon)
        ) {
          setShopCoupon((prev) => ({
            ...prev,
            [detail?.shopId]: detail.coupon,
          }));
        }

        // Remove shop if shopName is null
      } else {
        // Generate error message
        errorMsg += generateErrorMessage(detail.shopId, null);

        // Remove all items of the invalid shop
        handleClearSelect();
        removeShopProduct(detail.shopId);

        // Warning dialog flag
        isWarning = true;
      }
    });

    // Replace recommended coupon from server
    const discountValue = cart?.couponDiscount + cart?.shippingDiscount - shopsDiscountValue;
    setDiscount(discountValue);
    if (cart?.coupon != null && coupon !== null && !isEqual(coupon !== cart.coupon)) {
      setCoupon(cart.coupon);
    }

    // Show warning dialog
    if (isWarning && onWarning) onWarning(errorMsg);
  };

  return { estimateCart, syncCart };
};

export default useCheckout;
