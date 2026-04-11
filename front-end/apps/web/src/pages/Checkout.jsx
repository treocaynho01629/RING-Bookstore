import styled from "@emotion/styled";
import { useEffect, useRef, useState, lazy, Suspense, useCallback, useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useGetMyAddressQuery } from "../features/addresses/addressesApiSlice";
import { useCalculateMutation, useCheckoutMutation } from "../features/orders/ordersApiSlice";
import { debounce, isEqual } from "lodash-es";
import { PHONE_REGEX } from "@ring/shared/utils/regex";
import { PaymentType } from "@ring/shared/models/paymentType";
import { useTranslation } from "react-i18next";
import { useColorScheme, useMediaQuery } from "@mui/material";
import { DEFAULT_SHIPPING_TYPE } from "@ring/shared/constants/appContants";
import useDeepEffect from "@ring/shared/useDeepEffect";
import useAuth from "../hooks/useAuth";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LocationOn from "@mui/icons-material/LocationOn";
import CreditCard from "@mui/icons-material/CreditCard";
import KeyboardDoubleArrowDown from "@mui/icons-material/KeyboardDoubleArrowDown";
import ShoppingCartCheckout from "@mui/icons-material/ShoppingCartCheckout";
import ProductionQuantityLimits from "@mui/icons-material/ProductionQuantityLimits";
import CustomBreadcrumbs from "../components/custom/CustomBreadcrumbs";
import AddressDisplay from "../components/address/AddressDisplay";
import AddressSelectDialog from "../components/address/AddressSelectDialog";
import PreviewDetailRow from "../components/cart/PreviewDetailRow";
import FinalCheckoutDialog from "../components/cart/FinalCheckoutDialog";
import useCart from "../hooks/useCart";
import useCheckout from "../hooks/useCheckout";
import useAddress from "../hooks/useAddress";

const PendingModal = lazy(() => import("@ring/ui/PendingModal"));
const Turnstile = lazy(() => import("@ring/auth/Turnstile"));
const CouponDialog = lazy(() => import("../components/coupon/CouponDialog"));
const ShippingSelectDialog = lazy(() => import("../components/address/ShippingSelectDialog"));
const PaymentSelect = lazy(() => import("../components/cart/PaymentSelect"));
const ConfirmDialog = lazy(() => import("@ring/ui/ConfirmDialog"));

//#region styled
const Wrapper = styled.div``;

const TurnstileContainer = styled.div`
  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    display: flex;
    justify-content: center;
  }
`;

const CheckoutContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  margin: 0;
  padding: 20px 0px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 20px 10px;
  }
`;

const SemiTitle = styled.h4`
  font-size: 18px;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  color: inherit;

  &.end {
    text-align: end;
    direction: rtl;

    ${({ theme }) => theme.breakpoints.down("md_lg")} {
      display: none;
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 15px;
    font-weight: 450;

    svg {
      font-size: 21px;
    }
  }
`;

const StyledStepper = styled(Stepper)(({ theme }) => ({
  "marginTop": theme.spacing(1),
  "& .MuiStepLabel-root": {
    cursor: "pointer",
    [theme.breakpoints.down("sm")]: {
      marginLeft: theme.spacing(1),
    },
  },
  "& .MuiStepLabel-root .Mui-completed": {
    color: theme.vars.palette.success.main,
  },
  "& .MuiStepLabel-root .Mui-active": {
    color: theme.vars.palette.primary.main,
    textDecoration: "underline",
  },
  "& .MuiStepLabel-root .Mui-error": {
    color: theme.vars.palette.error.main,
    textDecoration: "underline",
  },
  "& .MuiStepLabel-root .Mui-active .MuiStepIcon-text": {
    fill: theme.vars.palette.text.main,
    fontWeight: "bold",
  },
}));

const StyledStepContent = styled(StepContent)(({ theme }) => ({
  paddingRight: 0,

  [theme.breakpoints.down("sm")]: {
    padding: 0,
    margin: 0,
    borderLeft: "none",
  },
}));
//#endregion

const MAX_STEPS = 3;

const Checkout = () => {
  //#region construct
  const { username } = useAuth();
  const { defaultAddress, setDefaultAddress } = useAddress();
  const { t, i18n } = useTranslation();
  const { mode } = useColorScheme();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  const scrollRef = useRef(null);
  const prevPayload = useRef();
  const calCount = useRef(0);

  const [activeStep, setActiveStep] = useState(0);
  const [payment, setPayment] = useState(Object.keys(PaymentType)[0]);
  const [pending, setPending] = useState(false);

  // Cart
  const { cartProducts, removeProducts } = useCart();
  const { estimateCart, syncCart } = useCheckout();
  const [openWarning, setOpenWarning] = useState(undefined);
  const location = useLocation();
  const checkoutState = location.state?.checkoutState;
  const selected = checkoutState?.selected;
  const totalSelected = selected?.length;

  // Coupon
  const [contextShop, setContextShop] = useState(null);
  const [openCoupon, setOpenCoupon] = useState(undefined);
  const [contextState, setContextState] = useState(null);
  const [contextCoupon, setContextCoupon] = useState(null);
  const [coupon, setCoupon] = useState(checkoutState?.coupon || "");
  const [shopCoupon, setShopCoupon] = useState(checkoutState?.shopCoupon || "");
  const [discount, setDiscount] = useState(0);
  const [shopDiscount, setShopDiscount] = useState([]);

  // Shipping
  const [openShipping, setOpenShipping] = useState(undefined);
  const [shopShipping, setShopShipping] = useState([]);
  const [shopNote, setShopNote] = useState([]);
  const [checkState, setCheckState] = useState(null);

  // Address
  const [openAddress, setOpenAddress] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [err, setErr] = useState([]);

  // Price
  const [estimated, setEstimated] = useState({
    deal: 0,
    subTotal: 0,
    shipping: 0,
    total: 0,
  });
  const [calculated, setCalculated] = useState(null);
  const [calculate, { isLoading: calculating }] = useCalculateMutation();

  // Turnstile
  const [token, setToken] = useState("");
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Checkout hook
  const [checkout, { isLoading }] = useCheckoutMutation();

  // Fetch current profile address
  const { data: addressData, isLoading: loadAddress } = useGetMyAddressQuery({}, { skip: defaultAddress });

  // Other
  const navigate = useNavigate();

  useDeepEffect(() => {
    if (calculating || !cartProducts?.length || cartProducts.length == 0 || activeStep == 0) {
      handleCalculate.cancel();
    }
    handleCartChange();
  }, [cartProducts, shopCoupon, coupon, defaultAddress, shopShipping, activeStep]);

  useEffect(() => {
    scrollToTop();
  }, [activeStep]);

  // Set default address
  useEffect(() => {
    if (!loadAddress && addressData) {
      setDefaultAddress(addressData);
    }
  }, [addressData]);

  /**
   * Handle cart change
   */
  const handleCartChange = () => {
    if (selected?.length > 0 && cartProducts.length > 0) {
      const checkoutCart = getCheckoutCart(); // Include address, shipping method, payment method ...
      handleEstimate(checkoutCart); // Estimate price
      handleCalculate(checkoutCart); // Calculate price
    } else {
      // Reset price state
      handleEstimate(null);
      handleCalculate(null);
      setCalculated(null);
    }

    // Reset error
    setErr(null);
    setErrMsg("");
  };

  /**
   * Get checkout cart
   * @returns {Object}
   */
  const getCheckoutCart = () => {
    if (selected?.length > 0 && cartProducts.length > 0) {
      // Reduce cart
      const checkoutCart = cartProducts.reduce(
        (result, item) => {
          const { id, shopId } = item;

          if (selected?.indexOf(id) !== -1) {
            // Get selected items in redux store
            // Find or create shop
            let detail = result.cart.find((shopItem) => shopItem.shopId === shopId);

            if (!detail) {
              const coupon = shopCoupon[shopId];
              detail = {
                shopId,
                items: [],
                note: shopNote[shopId],
                shippingType: shopShipping[shopId] || DEFAULT_SHIPPING_TYPE,
                coupon: coupon?.isUsable ? coupon?.code : null,
              };
              result.cart.push(detail);
            }

            // Add items for that shop
            detail.items.push(item);
          }

          return result;
        },
        {
          address: defaultAddress,
          paymentMethod: payment,
          coupon: coupon?.isUsable ? coupon?.code : null,
          cart: [],
        }
      );

      return checkoutCart;
    } else {
      return null;
    }
  };

  const handleEstimate = useCallback(
    (cart) => {
      const result = estimateCart(cart);
      setCheckState(result.checkState);
      setEstimated(result.estimated);
    },
    [cartProducts]
  );

  /**
   * Handle calculate cart on server side
   * @param {Object} cart
   */
  const handleCalculate = useCallback(
    debounce(async (cart) => {
      calCount.current++;

      const skipCalculate =
        calculating ||
        cart == null ||
        activeStep == 0 ||
        defaultAddress == null ||
        (activeStep > 0 && isEqual(prevPayload.current, cart)) ||
        calCount.current == 3;
      if (skipCalculate) return;

      calculate(cart)
        .unwrap()
        .then((data) => {
          setCalculated(data);
          handleSyncCart(data);
          prevPayload.current = cart;
        })
        .catch((err) => {
          console.error(err);
          setErr(err);
          if (!err?.status) {
            setErrMsg(t("error.server.response"));
          } else {
            setErrMsg(err?.data?.message);
          }
        });
    }, 500),
    [defaultAddress, activeStep]
  );

  /**
   * Sync checkout cart between client and server
   * @param {Object} cart
   */
  const handleSyncCart = (cart) => {
    syncCart(cart, setDiscount, setShopDiscount, coupon, setCoupon, shopCoupon, setShopCoupon, handleOpenWarning);
  };

  /**
   * Separate cart by shop
   * @returns {Object}
   */
  const reduceCart = () => {
    let selectedCart = cartProducts.filter((product) => selected?.includes(product.id));
    let resultCart = selectedCart.reduce((result, item) => {
      if (!result[item.shopId]) {
        // Check if not exists shop >> Add new one
        result[item.shopId] = { shopName: item.shopName, products: [] };
      }

      // Else push
      result[item.shopId].products.push(item);
      return result;
    }, {});

    return resultCart;
  };
  const reducedCart = useMemo(() => reduceCart(), [cartProducts]);
  const displayInfo = {
    deal: calculating || !calculated ? estimated?.deal : calculated?.dealDiscount,
    subTotal: calculating || !calculated ? estimated?.subTotal : calculated?.productsTotal,
    shipping: calculating || !calculated ? estimated?.shipping : calculated?.shippingFee,
    couponDiscount: calculated?.couponDiscount || 0,
    totalDiscount: calculated?.totalDiscount || 0,
    shippingDiscount: calculated?.shippingDiscount || 0,
    total: calculating || !calculated ? estimated?.total : calculated?.total - calculated?.totalDiscount,
  };

  /**
   * Scroll to top
   */
  const scrollToTop = useCallback(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /**
   * Handle next step
   */
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  /**
   * Handle open address dialog
   */
  const handleOpenDialog = () => {
    setOpenAddress(true);
  };

  /**
   * Handle close address dialog
   */
  const handleCloseDialog = () => {
    setOpenAddress(false);
  };

  /**
   * Handle back to first step
   */
  const editAddress = () => {
    setActiveStep(0);
    handleOpenDialog();
  };

  /**
   * Handle open coupon dialog
   * @param {string} shopId
   */
  const handleOpenCouponDialog = (shopId) => {
    setOpenCoupon(true);
    setContextShop(shopId);
    setContextState(
      shopId ? checkState?.details[shopId] : { value: checkState?.value, quantity: checkState?.quantity }
    );
    setContextCoupon(shopId ? shopCoupon[shopId] : coupon);
  };

  /**
   * Handle close coupon dialog
   */
  const handleCloseCouponDialog = () => {
    setOpenCoupon(false);
    setContextShop(null);
    setContextState(null);
    setContextCoupon(null);
  };

  /**
   * Handle open shipping dialog
   * @param {string} shopId
   */
  const handleOpenShippingDialog = (shopId) => {
    setOpenShipping(true);
    setContextShop(shopId);
  };

  /**
   * Handle close shipping dialog
   */
  const handleCloseShippingDialog = () => {
    setOpenShipping(false);
    setContextShop(null);
  };

  /**
   * Handle change coupon
   * @param {Object} coupon
   * @param {string} shopId
   */
  const handleChangeCoupon = (coupon, shopId) => {
    if (shopId) {
      setShopCoupon((prev) => ({ ...prev, [shopId]: coupon }));
    } else {
      setCoupon(coupon);
    }
  };

  /**
   * Handle change shipping
   * @param {string} value
   */
  const handleChangeShipping = (value) => {
    setShopShipping((prev) => ({ ...prev, [contextShop]: value }));
    setOpenShipping(false);
  };

  /**
   * Handle change payment method
   * @param {Event} e
   */
  const handleChangeMethod = (e) => {
    setPayment(e.target.value);
  };

  /**
   * Handle open warning dialog
   */
  const handleOpenWarning = () => {
    setOpenWarning(true);
  };

  /**
   * Handle close warning dialog
   */
  const handleCloseWarning = () => {
    setOpenWarning(false);
  };

  const validAddress = [
    defaultAddress?.name,
    defaultAddress?.phone,
    defaultAddress?.provinceId,
    defaultAddress?.districtId,
    defaultAddress?.wardCode,
    defaultAddress?.detail,
    PHONE_REGEX.test(defaultAddress?.phone),
    !loadAddress,
  ].every(Boolean);

  /**
   * Handle submit checkout
   * @param {Event} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || calculating || pending || !token) return;
    setPending(true);

    // Validation
    const valid = PHONE_REGEX.test(defaultAddress?.phone);

    if (!valid && defaultAddress?.phone) {
      setErrMsg(capitalize("validation.constraints.pattern", { ns: "validation", field: t("phone") }));
      return;
    } else if (
      !defaultAddress?.name ||
      !defaultAddress?.phone ||
      !defaultAddress?.detail ||
      !defaultAddress?.address ||
      !addressInfo?.provinceId ||
      !defaultAddress?.districtId ||
      !defaultAddress?.wardCode
    ) {
      setErrMsg(capitalize("validation.constraints.required", { ns: "validation", field: t("address") }));
      return;
    }

    const { enqueueSnackbar } = await import("notistack");
    const checkoutCart = getCheckoutCart();

    checkout({
      token,
      source: "turnstile",
      cart: checkoutCart,
    })
      .unwrap()
      .then((data) => {
        removeProducts(selected);
        if (payment == PaymentType.ONLINE_PAYMENT) {
          navigate(`/payment/${data?.id}`, { replace: true });
        } else {
          navigate("/payment?state=success", { replace: true });
        }
        setPending(false);
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(t("message.error", { action: t("order") }), { variant: "error" });
        setErr(err);
        if (!err?.status) {
          setErrMsg(t("error.server.response"));
        } else {
          setErrMsg(err?.data?.message);
        }
        setPending(false);
      });
  };

  const calculatedContextShop = calculated?.details?.find((detail) => detail?.shopId == contextShop);
  const breadcrumbItems = [
    { label: t("cart.title"), href: "/cart" },
    { label: t("cart.checkout"), href: "/checkout" },
  ];
  //#endregion

  if (selected?.length) {
    return (
      <Wrapper>
        {(isLoading || pending) && (
          <Suspense fallBack={null}>
            <PendingModal open={isLoading || pending} message={t("order.processing", { ns: "authenticated" })} />
          </Suspense>
        )}
        <CustomBreadcrumbs items={breadcrumbItems} type="transparent" />
        <CheckoutContainer>
          <Title ref={scrollRef}>
            <ShoppingCartCheckout />
            &nbsp;{t("cart.checkout")}
          </Title>
          <Grid container spacing={2} sx={{ position: "relative", mb: 10, justifyContent: "flex-end" }}>
            <Grid size={{ xs: 12, md_lg: 8 }} position="relative">
              <StyledStepper activeStep={activeStep} orientation="vertical" connector={null}>
                <Step key={0}>
                  <StepLabel
                    error={errMsg !== "" && err?.status === 400}
                    optional={
                      errMsg !== "" &&
                      err?.status === 400 && (
                        <Typography variant="caption" color="error">
                          {errMsg}
                        </Typography>
                      )
                    }
                  >
                    <SemiTitle
                      onClick={() => {
                        if (activeStep > 0) setActiveStep(0);
                      }}
                    >
                      <LocationOn />
                      &nbsp;{t("address.recipient", { ns: "authenticated" })}
                    </SemiTitle>
                  </StepLabel>
                  <StyledStepContent>
                    <AddressDisplay
                      {...{
                        address: defaultAddress,
                        isValid: validAddress,
                        handleOpen: handleOpenDialog,
                        loadAddress,
                      }}
                    />
                    <AddressSelectDialog
                      {...{
                        address: defaultAddress,
                        pending,
                        setPending,
                        setAddress: setDefaultAddress,
                        openDialog: openAddress,
                        handleCloseDialog,
                        err,
                      }}
                    />
                    <Button
                      disabled={!validAddress}
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      sx={{ my: 1, display: { xs: "none", sm: "flex" } }}
                      endIcon={<KeyboardDoubleArrowDown />}
                    >
                      {t("address.place", { ns: "authenticated" })}
                    </Button>
                  </StyledStepContent>
                </Step>
                <Step key={1}>
                  <StepLabel
                    error={errMsg !== "" && (err?.status == 409 || err?.status == 404)}
                    optional={
                      errMsg !== "" &&
                      (err?.status == 409 || err?.status == 404) && (
                        <Typography variant="caption" color="error">
                          {errMsg}
                        </Typography>
                      )
                    }
                  >
                    <SemiTitle
                      onClick={() => {
                        if (validAddress && activeStep > 1) setActiveStep(1);
                      }}
                    >
                      <ProductionQuantityLimits />
                      &nbsp;{t("checkout.review", { ns: "authenticated" })}
                    </SemiTitle>
                  </StepLabel>
                  <StyledStepContent slotProps={{ transition: { unmountOnExit: false } }}>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {Object.keys(reducedCart).map((shopId, index) => {
                            const shop = reducedCart[shopId];
                            const calculatedShop = calculated?.details?.find((detail) => detail?.shopId == shopId);
                            const estimatedShippingFee =
                              estimated?.shipping /
                              (checkState?.details ? Object.keys(checkState?.details).length || 1 : 1);
                            const shippingFee = calculatedShop?.shippingFee ?? estimatedShippingFee;
                            const shippingDiscount = calculatedShop?.shippingDiscount ?? 0;

                            return (
                              <PreviewDetailRow
                                key={`preview-${shop?.shopId}-${index}`}
                                {...{
                                  shop: { ...shop, id: shopId },
                                  coupon: shopCoupon[shopId],
                                  discount: shopDiscount[shopId],
                                  shopNote: shopNote[shopId],
                                  setShopNote,
                                  shipping: shopShipping[shopId],
                                  shippingFee,
                                  shippingDiscount,
                                  handleOpenCouponDialog,
                                  handleOpenShippingDialog,
                                }}
                              />
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Button
                      disabled={!validAddress}
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      sx={{ my: 1, display: { xs: "none", sm: "flex" } }}
                      endIcon={<KeyboardDoubleArrowDown />}
                    >
                      {t("continue")}
                    </Button>
                    <Suspense fallback={null}>
                      {openShipping !== undefined && (
                        <ShippingSelectDialog
                          {...{
                            open: openShipping,
                            handleClose: handleCloseShippingDialog,
                            selectedShipping: shopShipping[contextShop] || DEFAULT_SHIPPING_TYPE,
                            shippingFee: calculatedContextShop?.shippingFee,
                            shippingDiscount: calculatedContextShop?.shippingDiscount,
                            onSubmit: handleChangeShipping,
                          }}
                        />
                      )}
                    </Suspense>
                  </StyledStepContent>
                </Step>
                <Step key={2}>
                  <StepLabel
                    error={errMsg !== "" && (err?.status == 412 || err?.status == 403)}
                    optional={
                      errMsg !== "" &&
                      (err?.status == 412 || err?.status == 404) && (
                        <Typography variant="caption" color="error">
                          {errMsg}
                        </Typography>
                      )
                    }
                  >
                    <SemiTitle>
                      <CreditCard />
                      &nbsp;{t("checkout.payment.select", { ns: "authenticated" })}
                    </SemiTitle>
                  </StepLabel>
                  <StyledStepContent>
                    <Suspense fallback={null}>
                      {activeStep == 2 && (
                        <PaymentSelect
                          {...{
                            value: payment,
                            handleChange: handleChangeMethod,
                          }}
                        />
                      )}
                    </Suspense>
                    {activeStep === 2 && (
                      <Suspense fallback={null}>
                        <TurnstileContainer>
                          <Turnstile
                            siteKey={turnstileSiteKey}
                            onSuccess={(turnstileToken) => setToken(turnstileToken)}
                            onExpire={() => setToken("")}
                            action="checkout"
                            size="normal"
                            theme={resolvedMode}
                            lang={i18n.language}
                          />
                        </TurnstileContainer>
                      </Suspense>
                    )}
                  </StyledStepContent>
                </Step>
              </StyledStepper>
            </Grid>
            <Grid size={{ xs: 12, md_lg: 4 }} position={{ xs: "sticky", md_lg: "relative" }} bottom={0}>
              <Box py={2}>
                <SemiTitle className="end">{t("checkout.summary", { ns: "authenticated" })}</SemiTitle>
              </Box>
              <FinalCheckoutDialog
                {...{
                  totalSelected,
                  coupon,
                  shopCoupon,
                  discount,
                  calculating,
                  displayInfo,
                  isValid: validAddress,
                  activeStep,
                  maxSteps: MAX_STEPS,
                  changeCoupon: handleOpenCouponDialog,
                  address: defaultAddress,
                  editAddress,
                  handleNext,
                  handleSubmit,
                  token,
                  disableContinue: activeStep > 0 && !calculated,
                }}
              />
            </Grid>
          </Grid>
        </CheckoutContainer>
        <Suspense fallback={null}>
          {openCoupon !== undefined && (
            <CouponDialog
              {...{
                open: openCoupon,
                handleClose: handleCloseCouponDialog,
                shopId: contextShop,
                checkState: contextState,
                selectedCoupon: contextCoupon,
                numSelected: selected?.length,
                selectMode: true,
                loggedIn: username != null,
                onSubmit: handleChangeCoupon,
              }}
            />
          )}
        </Suspense>
        <Suspense fallback={null}>
          {openWarning !== undefined && (
            <ConfirmDialog
              {...{
                open: openWarning,
                title: t("cart.remove.title"),
                message: t("cart.remove.message"),
                handleConfirm: handleCloseWarning,
              }}
            />
          )}
        </Suspense>
      </Wrapper>
    );
  } else {
    return <Navigate to={"/cart"} />;
  }
};

export default Checkout;
