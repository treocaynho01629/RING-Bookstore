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
          <CheckoutText color="error">Vui lòng chọn sản phẩm</CheckoutText>
        ) : (
          <PriceContainer>
            <CheckoutPrice>
              <b>Tổng:</b>
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
              <SavePrice>Tiết kiệm {currencyFormat.format(displayInfo.totalDiscount)}</SavePrice>
            )}
            <SubText>(Đã bao gồm VAT nếu có)</SubText>
          </PriceContainer>
        )}
      </CheckoutRow>
    </>
  );

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
                  {coupon && discount && numSelected > 0
                    ? `Đã giảm ${currencyFormat.format(discount)}`
                    : `Chọn mã giảm giá ${coupon != null ? "khác" : ""}`}
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
                  <CheckoutText color="error">Vui lòng chọn sản phẩm</CheckoutText>
                ) : (
                  <PriceContainer>
                    <CheckoutPrice>
                      <b>Tổng:</b>
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
                        Tiết kiệm&nbsp;
                        {currencyFormat.format(displayInfo.totalDiscount)}
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
                {loggedIn ? `Thanh toán (${numSelected})` : "Đăng nhập"}
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
                  {coupon && discount && numSelected > 0
                    ? `Đã giảm ${currencyFormat.format(discount)}`
                    : `Chọn mã giảm giá ${coupon != null ? "khác" : ""}`}
                </span>
                <MiniCouponContainer>
                  <Suspense fallback={null}>{coupon && numSelected > 0 && <CouponDisplay coupon={coupon} />}</Suspense>
                  <KeyboardArrowRight fontSize="small" />
                </MiniCouponContainer>
              </CouponButton>
            </CheckoutStack>
            <CheckoutStack>
              <CheckoutPriceContainer>
                <PriceContainer>
                  <CheckoutText>Tổng thanh toán: ({numSelected} Sản phẩm)&emsp;</CheckoutText>
                  {numSelected > 0 && <SubText>(Đã bao gồm VAT)</SubText>}
                </PriceContainer>
                <PriceContainer>
                  <CheckoutPrice onClick={() => toggleDrawer(true)}>
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
                    <SavePrice>Tiết kiệm {currencyFormat.format(displayInfo.totalDiscount)}</SavePrice>
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
                {loggedIn ? "Thanh toán" : "Đăng nhập"}
              </CheckoutButton>
            </CheckoutStack>
          </CheckoutBox>
        ) : (
          <>
            <CheckoutBox>
              <CheckoutTitle>
                KHUYẾN MÃI
                {coupon && numSelected > 0 && <span>Đã áp dụng</span>}
              </CheckoutTitle>
              <CheckoutRow>
                <Suspense fallback={null}>{coupon && numSelected > 0 && <CouponDisplay coupon={coupon} />}</Suspense>
              </CheckoutRow>
              <CouponButton onClick={() => handleOpenDialog()}>
                <span>
                  <LocalActivityOutlined color="error" />
                  &nbsp;
                  {coupon && discount && numSelected > 0
                    ? `Đã giảm ${currencyFormat.format(discount)}`
                    : `Chọn mã giảm giá ${coupon != null ? "khác" : ""}`}
                </span>
                <KeyboardArrowRight fontSize="small" />
              </CouponButton>
            </CheckoutBox>
            <CheckoutBox className="sticky">
              <CheckoutTitle>THANH TOÁN</CheckoutTitle>
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
                {loggedIn ? `Thanh toán (${numSelected})` : "Đăng nhập để Thanh toán"}
              </CheckoutButton>
            </CheckoutBox>
          </>
        )}
      </CheckoutContainer>
      <Suspense fallback={null}>
        {open != undefined && (
          <SwipeableDrawer
            anchor="bottom"
            open={open}
            onOpen={() => toggleDrawer(true)}
            onClose={() => toggleDrawer(false)}
            disableSwipeToOpen={true}
          >
            <CheckoutBox>
              <CheckoutTitle>THANH TOÁN</CheckoutTitle>
              {checkoutDetail}
            </CheckoutBox>
          </SwipeableDrawer>
        )}
      </Suspense>
    </>
  );
};

export default CheckoutDialog;
