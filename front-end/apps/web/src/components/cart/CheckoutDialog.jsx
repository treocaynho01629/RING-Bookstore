import { lazy, useState, Suspense, useRef } from "react";
import {
  AltCheckoutBox,
  CheckoutBox,
  CheckoutButton,
  CheckoutContainer,
  CheckoutPrice,
  CheckoutPriceContainer,
  CheckoutRow,
  CheckoutStack,
  CheckoutText,
  CheckoutTitle,
  CouponButton,
  MiniCouponContainer,
  PriceContainer,
  SavePrice,
  SubText,
} from "../custom/CartComponents";
import { currencyFormat } from "@ring/shared/utils/convert";
import { capitalize } from "lodash-es";
import { useTranslation } from "react-i18next";
import NumberFlow from "@number-flow/react";
import PriceDisplay from "./PriceDisplay";
import useOffset from "../../hooks/useOffset";
import ShoppingCartCheckout from "@mui/icons-material/ShoppingCartCheckout";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

const SwipeableDrawer = lazy(() => import("@mui/material/SwipeableDrawer"));
const CouponDisplay = lazy(() => import("../coupon/CouponDisplay"));

const CheckoutDialog = ({
  coupon,
  shopCoupon,
  discount,
  selected,
  navigate,
  handleOpenDialog,
  calculating,
  displayInfo,
  loggedIn,
  mobileMode,
  tabletMode,
}) => {
  const overlapRef = useRef(null);
  const { t } = useTranslation();
  const [open, setOpen] = useState(undefined);
  const numSelected = selected?.length;
  const checkoutCart = {
    selected,
    coupon,
    shopCoupon,
  };

  // Prevent overlap
  useOffset(overlapRef);

  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };

  // Component stuff
  let checkoutDetail = (
    <>
      <PriceDisplay displayInfo={displayInfo} loggedIn={loggedIn} />
      <CheckoutRow>
        {!numSelected ? (
          <CheckoutText color="error">{t("required.select", { ns: "client" })}</CheckoutText>
        ) : (
          <PriceContainer>
            <CheckoutPrice>
              <b>{t("total")}:</b>
              <NumberFlow
                value={displayInfo.total}
                format={{ style: "currency", currency: "VND" }}
                locales={"vi-VN"}
                aria-hidden="true"
                respectMotionPreference={false}
                willChange
              />
            </CheckoutPrice>
            {!calculating && displayInfo.totalDiscount > 0 && (
              <SavePrice>
                {t("cart.saved", { ns: "client", discount: currencyFormat.format(displayInfo.totalDiscount) })}
              </SavePrice>
            )}
            <SubText>{t("cart.vat.included", { ns: "client" })}</SubText>
          </PriceContainer>
        )}
      </CheckoutRow>
    </>
  );

  const couponText =
    coupon && discount && numSelected > 0
      ? t("cart.coupon.saved", { ns: "client", discount: currencyFormat.format(discount) })
      : !coupon
        ? t("cart.coupon.add", { ns: "client" })
        : t("cart.coupon.change", { ns: "client" });

  return (
    <>
      <CheckoutContainer>
        {mobileMode ? (
          <div ref={overlapRef}>
            <CheckoutStack>
              <CouponButton onClick={() => handleOpenDialog()}>
                <span>
                  <LocalActivityOutlined color="error" />
                  &nbsp;
                  {couponText}
                </span>
                <MiniCouponContainer>
                  <Suspense fallback={null}>{coupon && numSelected > 0 && <CouponDisplay coupon={coupon} />}</Suspense>
                  <KeyboardArrowRight fontSize="small" />
                </MiniCouponContainer>
              </CouponButton>
            </CheckoutStack>
            <CheckoutStack>
              <AltCheckoutBox onClick={() => toggleDrawer(true)}>
                {!numSelected ? (
                  <CheckoutText color="error">{t("required.select", { ns: "client" })}</CheckoutText>
                ) : (
                  <PriceContainer>
                    <CheckoutPrice>
                      <b>{t("total")}:</b>
                      <NumberFlow
                        value={displayInfo.total}
                        format={{ style: "currency", currency: "VND" }}
                        locales={"vi-VN"}
                        aria-hidden="true"
                        respectMotionPreference={false}
                        willChange
                      />
                    </CheckoutPrice>
                    {!calculating && displayInfo.totalDiscount > 0 && (
                      <SavePrice>
                        {t("cart.saved", {
                          ns: "client",
                          discount: currencyFormat.format(displayInfo.totalDiscount),
                        })}
                      </SavePrice>
                    )}
                  </PriceContainer>
                )}
              </AltCheckoutBox>
              <CheckoutButton
                variant="contained"
                size="large"
                fullWidth
                sx={{ maxWidth: "42%" }}
                disabled={!numSelected}
                onClick={() =>
                  navigate("/checkout", {
                    state: { checkoutState: checkoutCart },
                  })
                }
              >
                {loggedIn ? `${t("cart.checkout", { ns: "client" })} (${numSelected})` : t("login")}
              </CheckoutButton>
            </CheckoutStack>
          </div>
        ) : tabletMode ? (
          <CheckoutBox className="sticky" ref={overlapRef}>
            <CheckoutStack>
              <CouponButton onClick={() => handleOpenDialog()}>
                <span>
                  <LocalActivityOutlined color="error" />
                  &nbsp;
                  {couponText}
                </span>
                <MiniCouponContainer>
                  <Suspense fallback={null}>{coupon && numSelected > 0 && <CouponDisplay coupon={coupon} />}</Suspense>
                  <KeyboardArrowRight fontSize="small" />
                </MiniCouponContainer>
              </CouponButton>
            </CheckoutStack>
            <CheckoutStack>
              <CheckoutPriceContainer onClick={() => toggleDrawer(true)}>
                <PriceContainer className="row">
                  <CheckoutText>{t("cart.total", { ns: "client", quantity: numSelected })}&emsp;</CheckoutText>
                  {numSelected > 0 && <SubText>{t("cart.vat.included", { ns: "client" })}</SubText>}
                </PriceContainer>
                <PriceContainer className="row">
                  <CheckoutPrice>
                    <NumberFlow
                      value={displayInfo.total}
                      format={{ style: "currency", currency: "VND" }}
                      locales={"vi-VN"}
                      aria-hidden="true"
                      respectMotionPreference={false}
                      willChange
                    />
                  </CheckoutPrice>
                  &emsp;
                  {!calculating && displayInfo.totalDiscount > 0 && (
                    <SavePrice>
                      {t("cart.saved", {
                        ns: "client",
                        discount: currencyFormat.format(displayInfo.totalDiscount),
                      })}
                    </SavePrice>
                  )}
                </PriceContainer>
              </CheckoutPriceContainer>
              <CheckoutButton
                variant="contained"
                size="large"
                fullWidth
                sx={{ maxWidth: "35%" }}
                disabled={!numSelected}
                onClick={() =>
                  navigate("/checkout", {
                    state: { checkoutState: checkoutCart },
                  })
                }
                startIcon={<ShoppingCartCheckout />}
              >
                {loggedIn ? t("cart.checkout", { ns: "client" }) : t("login")}
              </CheckoutButton>
            </CheckoutStack>
          </CheckoutBox>
        ) : (
          <>
            <CheckoutBox>
              <CheckoutTitle>
                {t("cart.discount", { ns: "client" })}
                {coupon && numSelected > 0 && <span>{t("cart.coupon.applied", { ns: "client" })}</span>}
              </CheckoutTitle>
              <CheckoutRow>
                <Suspense fallback={null}>{coupon && numSelected > 0 && <CouponDisplay coupon={coupon} />}</Suspense>
              </CheckoutRow>
              <CouponButton onClick={() => handleOpenDialog()}>
                <span>
                  <LocalActivityOutlined color="error" />
                  &nbsp;
                  {couponText}
                </span>
                <KeyboardArrowRight fontSize="small" />
              </CouponButton>
            </CheckoutBox>
            <CheckoutBox className="sticky">
              <CheckoutTitle>{t("cart.checkout", { ns: "client" })}</CheckoutTitle>
              {checkoutDetail}
              <CheckoutButton
                variant="contained"
                size="large"
                fullWidth
                sx={{ padding: "11px", mt: 1 }}
                disabled={!numSelected}
                onClick={() =>
                  navigate("/checkout", {
                    state: { checkoutState: checkoutCart },
                  })
                }
                startIcon={<ShoppingCartCheckout />}
              >
                {loggedIn
                  ? `${t("cart.checkout", { ns: "client" })} (${numSelected})`
                  : capitalize(t("required.login", { ns: "client", action: t("cart.checkout", { ns: "client" }) }))}
              </CheckoutButton>
            </CheckoutBox>
          </>
        )}
      </CheckoutContainer>
      <Suspense fallback={null}>
        {tabletMode && (
          <SwipeableDrawer
            anchor="bottom"
            open={open}
            onOpen={() => toggleDrawer(true)}
            onClose={() => toggleDrawer(false)}
            disableSwipeToOpen={true}
          >
            <CheckoutBox className="drawer">
              <CheckoutTitle>{t("cart.checkout", { ns: "client" })}</CheckoutTitle>
              {checkoutDetail}
            </CheckoutBox>
          </SwipeableDrawer>
        )}
      </Suspense>
    </>
  );
};

export default CheckoutDialog;
