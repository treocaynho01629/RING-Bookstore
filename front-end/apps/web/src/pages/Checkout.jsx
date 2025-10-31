import styled from "@emotion/styled";
import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import { Navigate, NavLink, useLocation, useNavigate } from "react-router";
import { useGetMyAddressQuery } from "../features/addresses/addressesApiSlice";
import {
  useCalculateMutation,
  useCheckoutMutation,
} from "../features/orders/ordersApiSlice";
import { isEqual } from "lodash-es";
import { PHONE_REGEX } from "@ring/shared/utils/regex";
import { getShippingType } from "@ring/shared/enums/shipping";
import { PaymentType } from "@ring/shared/models/paymentType";
import useTitle from "@ring/shared/useTitle";
import useDeepEffect from "@ring/shared/useDeepEffect";
import useAuth from "../hooks/useAuth";
import useReCaptcha from "@ring/auth/useReCaptcha";
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

const PendingModal = lazy(() => import("@ring/ui/PendingModal"));
const ReCaptcha = lazy(() => import("@ring/auth/ReCaptcha"));
const CouponDialog = lazy(() => import("../components/coupon/CouponDialog"));
const ShippingSelectDialog = lazy(
  () => import("../components/address/ShippingSelectDialog")
);
const PaymentSelect = lazy(() => import("../components/cart/PaymentSelect"));
const ConfirmDialog = lazy(() => import("@ring/shared/ConfirmDialog"));

//#region styled
const Wrapper = styled.div``;

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
`;

const MiniTitle = styled.h4`
  margin: ${({ theme }) => `${theme.spacing(1.5)} ${theme.spacing(1)}`};
  font-weight: 420;
`;

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginTop: theme.spacing(1),
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

const ShippingType = getShippingType();

const Checkout = () => {
  //#region construct
  const scrollRef = useRef(null);
  const prevPayload = useRef();
  const { username } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [payment, setPayment] = useState(Object.keys(PaymentType)[0]);
  const [pending, setPending] = useState(false);
  const maxSteps = 3;

  // Cart
  const { cartProducts, removeProducts } = useCart();
  const { estimateCart, syncCart } = useCheckout();
  const [openWarning, setOpenWarning] = useState(undefined);
  const location = useLocation();
  const checkoutState = location.state?.checkoutState;
  const selected = checkoutState?.selected;

  // Coupon
  const [contextShop, setContextShop] = useState(null);
  const [openCoupon, setOpenCoupon] = useState(false);
  const [contextState, setContextState] = useState(null);
  const [contextCoupon, setContextCoupon] = useState(null);
  const [coupon, setCoupon] = useState(checkoutState?.coupon || "");
  const [shopCoupon, setShopCoupon] = useState(checkoutState?.shopCoupon || "");
  const [discount, setDiscount] = useState(0);
  const [shopDiscount, setShopDiscount] = useState([]);

  // Shipping
  const [openShipping, setOpenShipping] = useState(false);
  const [shopShipping, setShopShipping] = useState([]);
  const [shopNote, setShopNote] = useState([]);
  const [checkState, setCheckState] = useState(null);

  // Address
  const [openAddress, setOpenAddress] = useState(false);
  const [addressInfo, setAddressInfo] = useState(null);
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
  const [calculate, { isLoading: calculating, isError }] =
    useCalculateMutation();

  // Recaptcha v2
  const [challenge, setChallenge] = useState(false); //Toggle if marked suspicious by v3
  const [token, setToken] = useState("");

  // Recaptcha
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const recaptchaV3SiteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
  const { reCaptchaLoaded, generateReCaptchaToken, hideBadge } =
    useReCaptcha(recaptchaV3SiteKey);

  // Checkout hook
  const [checkout, { isLoading }] = useCheckoutMutation();

  // Fetch current profile address
  const { data: address, isLoading: loadAddress } = useGetMyAddressQuery();

  // Other
  const navigate = useNavigate();

  useDeepEffect(() => {
    handleCartChange();
  }, [cartProducts, shopCoupon, coupon, addressInfo, shopShipping]);

  useEffect(() => {
    scrollToTop();
  }, [activeStep]);

  useEffect(() => {
    hideBadge();
  }, [reCaptchaLoaded]); // Hide badge cuz it's in the way of stepper

  // Set title
  useTitle("Thanh toán");

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

  // Filter out unusable coupons
  const getCheckoutCart = () => {
    if (selected?.length > 0 && cartProducts.length > 0) {
      // Reduce cart
      const checkoutCart = cartProducts.reduce(
        (result, item) => {
          const { id, shopId } = item;

          if (selected?.indexOf(id) !== -1) {
            // Get selected items in redux store
            // Find or create shop
            let detail = result.cart.find(
              (shopItem) => shopItem.shopId === shopId
            );

            if (!detail) {
              const coupon = shopCoupon[shopId];
              detail = {
                shopId,
                items: [],
                note: shopNote[shopId],
                shippingType:
                  shopShipping[shopId] || Object.keys(ShippingType)[0],
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
          address: addressInfo
            ? {
                name: addressInfo.name,
                companyName: addressInfo.companyName,
                phone: addressInfo.phone,
                city: addressInfo.city + ", " + addressInfo.ward,
                address: addressInfo.address,
                type: addressInfo.type,
              }
            : null,
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

  // Calculate server side
  const handleCalculate = useCallback(
    async (cart) => {
      if (
        isLoading ||
        address == null ||
        cart == null ||
        cart.length == 0 ||
        isEqual(prevPayload.current, cart)
      )
        return;

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
            setErrMsg("Server không phản hồi");
          } else {
            setErrMsg(err?.data?.message);
          }
        });
    },
    [addressInfo]
  );

  // Sync checkout cart between client and server
  const handleSyncCart = (cart) => {
    syncCart(
      cart,
      setDiscount,
      setShopDiscount,
      coupon,
      setCoupon,
      shopCoupon,
      setShopCoupon,
      handleOpenWarning
    );
  };

  // Separate by shop
  const reduceCart = () => {
    let selectedCart = cartProducts.filter((product) =>
      selected?.includes(product.id)
    );
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
    deal:
      calculating || !calculated ? estimated?.deal : calculated?.dealDiscount,
    subTotal:
      calculating || !calculated
        ? estimated?.subTotal
        : calculated?.productsTotal,
    shipping:
      calculating || !calculated
        ? estimated?.shipping
        : calculated?.shippingFee,
    couponDiscount: calculated?.couponDiscount || 0,
    totalDiscount: calculated?.totalDiscount || 0,
    shippingDiscount: calculated?.shippingDiscount || 0,
    total:
      calculating || !calculated
        ? estimated?.total
        : calculated?.total - calculated?.totalDiscount,
  };

  const scrollToTop = useCallback(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const backFirstStep = () => {
    setActiveStep(0);
  };

  const handleOpenDialog = () => {
    setOpenAddress(true);
  };
  const handleCloseDialog = () => {
    setOpenAddress(false);
  };

  const handleOpenCouponDialog = (shopId) => {
    setOpenCoupon(true);
    setContextShop(shopId);
    setContextState(
      shopId
        ? checkState?.details[shopId]
        : { value: checkState?.value, quantity: checkState?.quantity }
    );
    setContextCoupon(shopId ? shopCoupon[shopId] : coupon);
  };
  const handleCloseCouponDialog = () => {
    setOpenCoupon(false);
    setContextShop(null);
    setContextState(null);
    setContextCoupon(null);
  };

  const handleOpenShippingDialog = (shopId) => {
    setOpenShipping(true);
    setContextShop(shopId);
  };
  const handleCloseShippingDialog = () => {
    setOpenShipping(false);
    setContextShop(null);
  };

  const handleChangeCoupon = (coupon, shopId) => {
    if (shopId) {
      setShopCoupon((prev) => ({ ...prev, [shopId]: coupon }));
    } else {
      setCoupon(coupon);
    }
  };

  const handleChangeShipping = (value) => {
    setShopShipping((prev) => ({ ...prev, [contextShop]: value }));
    setOpenShipping(false);
  };

  const handleChangeMethod = (e) => {
    setPayment(e.target.value);
  };

  const handleOpenWarning = () => {
    setOpenWarning(true);
  };
  const handleCloseWarning = () => {
    setOpenWarning(false);
  };

  const validAddressInfo = [
    addressInfo?.name,
    addressInfo?.phone,
    addressInfo?.city,
    addressInfo?.address,
    PHONE_REGEX.test(addressInfo?.phone),
    !loadAddress,
  ].every(Boolean);

  // Submit checkout
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || calculating || pending) return;
    setPending(true);

    // Validation
    const valid = PHONE_REGEX.test(addressInfo?.phone);

    if (!valid && addressInfo?.phone) {
      setErrMsg("Sai định dạng số điện thoại!");
      return;
    } else if (
      !addressInfo?.name ||
      !addressInfo?.phone ||
      !addressInfo?.city ||
      !addressInfo?.address
    ) {
      setErrMsg("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    const { enqueueSnackbar } = await import("notistack");
    const checkoutCart = getCheckoutCart();

    const recaptchaToken = challenge
      ? token
      : await generateReCaptchaToken("checkout");
    checkout({
      token: recaptchaToken,
      source: challenge ? "v2" : "v3",
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
        setChallenge(false);
        setPending(false);
      })
      .catch((err) => {
        enqueueSnackbar("Đặt hàng thất bại!", { variant: "error" });
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setErrMsg("Server không phản hồi!");
        } else if (err?.status === 409) {
          setErrMsg(err?.data?.message);
        } else if (err?.status === 403) {
          setErrMsg("Bạn không có quyền làm điều này!");
        } else if (err?.status === 412) {
          setChallenge(true);
          setErrMsg("Yêu cầu của bạn cần xác thực lại!");
        } else if (err?.status === 400) {
          setErrMsg("Sai định dạng thông tin!");
        } else {
          setErrMsg("Đặt hàng thất bại!");
        }
        setPending(false);
      });
  };

  const calculatedContextShop = calculated?.details?.find(
    (detail) => detail?.shopId == contextShop
  );
  //#endregion

  if (selected?.length) {
    return (
      <Wrapper>
        {(isLoading || pending) && (
          <Suspense fallBack={null}>
            <PendingModal
              open={isLoading || pending}
              message="Đang xử lý đơn hàng..."
            />
          </Suspense>
        )}
        <CustomBreadcrumbs
          separator="›"
          maxItems={4}
          aria-label="breadcrumb"
          className="transparent"
        >
          <NavLink to={"/cart"}>Giỏ hàng</NavLink>
          <NavLink to={"/checkout"}>Thanh toán</NavLink>
        </CustomBreadcrumbs>
        <CheckoutContainer>
          <Title ref={scrollRef}>
            <ShoppingCartCheckout />
            &nbsp;THANH TOÁN
          </Title>
          <Grid
            container
            spacing={2}
            sx={{ position: "relative", mb: 10, justifyContent: "flex-end" }}
          >
            <Grid size={{ xs: 12, md_lg: 8 }} position="relative">
              <StyledStepper
                activeStep={activeStep}
                orientation="vertical"
                connector={null}
              >
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
                      &nbsp;Địa chỉ người nhận
                    </SemiTitle>
                  </StepLabel>
                  <StyledStepContent>
                    <AddressDisplay
                      {...{
                        addressInfo,
                        isValid: validAddressInfo,
                        handleOpen: handleOpenDialog,
                        loadAddress,
                      }}
                    />
                    <AddressSelectDialog
                      {...{
                        address,
                        pending,
                        setPending,
                        setAddressInfo,
                        openDialog: openAddress,
                        handleCloseDialog,
                        err,
                      }}
                    />
                    <Button
                      disabled={!validAddressInfo}
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      sx={{ my: 1, display: { xs: "none", sm: "flex" } }}
                      endIcon={<KeyboardDoubleArrowDown />}
                    >
                      Vận chuyển đến địa chỉ này
                    </Button>
                  </StyledStepContent>
                </Step>
                <Step key={1}>
                  <StepLabel
                    error={
                      errMsg !== "" &&
                      (err?.status == 409 || err?.status == 404)
                    }
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
                        if (validAddressInfo && activeStep > 1)
                          setActiveStep(1);
                      }}
                    >
                      <ProductionQuantityLimits />
                      &nbsp;Kiểm tra lại sản phẩm
                    </SemiTitle>
                  </StepLabel>
                  <StyledStepContent
                    slotProps={{ transition: { unmountOnExit: false } }}
                  >
                    <TableContainer>
                      <Table aria-label="checkout-table">
                        <TableBody>
                          {Object.keys(reducedCart).map((shopId, index) => {
                            const shop = reducedCart[shopId];
                            const calculatedShop = calculated?.details?.find(
                              (detail) => detail?.shopId == shopId
                            );
                            const shippingFee =
                              calculatedShop?.shippingFee ??
                              estimated?.shipping;
                            const shippingDiscount =
                              calculatedShop?.shippingDiscount ?? 0;

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
                      disabled={!validAddressInfo || calculating}
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      sx={{ my: 1, display: { xs: "none", sm: "flex" } }}
                      endIcon={<KeyboardDoubleArrowDown />}
                    >
                      Tiếp tục
                    </Button>
                    <Suspense fallback={null}>
                      {openCoupon !== undefined && (
                        <ShippingSelectDialog
                          {...{
                            open: openShipping,
                            handleClose: handleCloseShippingDialog,
                            selectedShipping:
                              shopShipping[contextShop] ||
                              Object.keys(ShippingType)[0],
                            shippingFee: calculatedContextShop?.shippingFee,
                            shippingDiscount:
                              calculatedContextShop?.shippingDiscount,
                            onSubmit: handleChangeShipping,
                          }}
                        />
                      )}
                    </Suspense>
                  </StyledStepContent>
                </Step>
                <Step key={2}>
                  <StepLabel
                    error={
                      errMsg !== "" &&
                      (err?.status == 412 || err?.status == 403)
                    }
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
                      &nbsp;Chọn hình thức thanh toán
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
                    {reCaptchaLoaded && challenge && (
                      <Suspense fallback={null}>
                        <ReCaptcha
                          onVerify={(token) => setToken(token)}
                          recaptchaSiteKey={recaptchaSiteKey}
                        />
                      </Suspense>
                    )}
                  </StyledStepContent>
                </Step>
              </StyledStepper>
            </Grid>
            <Grid
              size={{ xs: 12, md_lg: 4 }}
              position={{ xs: "sticky", md_lg: "relative" }}
              bottom={0}
            >
              <Box py={2}>
                <SemiTitle className="end">Tổng quan</SemiTitle>
              </Box>
              <FinalCheckoutDialog
                {...{
                  coupon,
                  shopCoupon,
                  discount,
                  calculating,
                  displayInfo,
                  isValid: validAddressInfo,
                  activeStep,
                  maxSteps,
                  handleOpenDialog: handleOpenCouponDialog,
                  addressInfo,
                  backFirstStep,
                  handleNext,
                  handleSubmit,
                  reCaptchaLoaded,
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
                title: "Đã gỡ các sản phẩm!",
                message: "Một số sản phẩm đã bị gỡ khỏi trang!",
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
