import styled from "@emotion/styled";
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
import { lazy, Suspense, useRef, useState } from "react";
import { getAddressType } from "@ring/shared/enums/address";
import { currencyFormat } from "@ring/shared/utils/convert";
import useMediaQuery from "@mui/material/useMediaQuery";
import Edit from "@mui/icons-material/Edit";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowDown from "@mui/icons-material/KeyboardDoubleArrowDown";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import CouponDisplay from "../coupon/CouponDisplay";
import PriceDisplay from "./PriceDisplay";
import NumberFlow from "@number-flow/react";
import useOffset from "../../hooks/useOffset";

const SwipeableDrawer = lazy(() => import("@mui/material/SwipeableDrawer"));

//#region styled
const UserInfo = styled.b`
  font-size: 14px;
  margin: ${({ theme }) => theme.spacing(1)} 0;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 13px;
  }
`;

const AddressContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const AddressContent = styled.div`
  width: 100%;
  display: flex;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-right: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
`;

const Address = styled.span`
  font-size: 14px;
  line-height: 1.75em;
  margin-top: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;

const AddressTag = styled.span`
  font-size: 12px;
  font-weight: bold;
  margin-right: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1)}`};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.primary.main};
  color: ${({ theme }) => theme.vars.palette.primary.main};

  &.info {
    color: ${({ theme }) => theme.vars.palette.info.main};
    border-color: ${({ theme }) => theme.vars.palette.info.main};
  }
`;

const EditButton = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.vars.palette.info.main};
  display: flex;
  align-items: center;
  cursor: pointer;

  svg {
    font-size: 16px;
    margin-right: ${({ theme }) => theme.spacing(0.5)};
  }

  &:hover {
    color: ${({ theme }) => theme.vars.palette.info.light};
  }
`;

const AddressDivider = styled.div`
  width: 100%;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  border-bottom: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
`;
//#endregion

const AddressType = getAddressType();

const FinalCheckoutDialog = ({
  coupon,
  discount,
  displayInfo,
  calculating,
  addressInfo,
  isValid,
  handleNext,
  activeStep,
  maxSteps,
  backFirstStep,
  handleOpenDialog,
  handleSubmit,
  reCaptchaLoaded,
}) => {
  const overlapRef = useRef(null);
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md_lg"));
  const fullAddress = [addressInfo?.city, addressInfo?.address].join(", ");
  const [open, setOpen] = useState(undefined);

  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };
  const address = addressInfo?.type ? AddressType[addressInfo.type] : null;

  //Prevent overlap
  useOffset(overlapRef);

  //Component stuff
  let checkoutDetail = (
    <>
      <PriceDisplay displayInfo={displayInfo} loggedIn={true} />
      <CheckoutRow>
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
          <SubText>(Giá này đã bao gồm thuế GTGT, phí đóng gói, phí vận chuyển và các chi phí phát sinh khác)</SubText>
        </PriceContainer>
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
                  {coupon && discount
                    ? `Đã giảm ${currencyFormat.format(discount)}`
                    : `Chọn mã giảm giá ${coupon != null ? "khác" : ""}`}
                </span>
                <MiniCouponContainer>
                  {coupon && <CouponDisplay coupon={coupon} />}
                  <KeyboardArrowRight fontSize="small" />
                </MiniCouponContainer>
              </CouponButton>
            </CheckoutStack>
            <CheckoutStack>
              <AltCheckoutBox onClick={() => toggleDrawer(true)}>
                <PriceContainer>
                  <CheckoutPrice>
                    <b>
                      Tổng: ({activeStep + 1}/{maxSteps})
                    </b>
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
                </PriceContainer>
              </AltCheckoutBox>
              {activeStep < 2 ? (
                <CheckoutButton
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ maxWidth: "42%" }}
                  onClick={handleNext}
                  disabled={!isValid || calculating}
                  endIcon={<KeyboardDoubleArrowDown />}
                >
                  Tiếp tục
                </CheckoutButton>
              ) : (
                <CheckoutButton
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ maxWidth: "42%" }}
                  disabled={calculating || !reCaptchaLoaded}
                  onClick={handleSubmit}
                >
                  Đặt hàng
                </CheckoutButton>
              )}
            </CheckoutStack>
          </div>
        ) : tabletMode ? (
          <CheckoutBox className="sticky" ref={overlapRef}>
            <CheckoutStack>
              <CouponButton onClick={() => handleOpenDialog()}>
                <span>
                  <LocalActivityOutlined color="error" />
                  &nbsp;
                  {coupon && discount
                    ? `Đã giảm ${currencyFormat.format(discount)}`
                    : `Chọn mã giảm giá ${coupon != null ? "khác" : ""}`}
                </span>
                <MiniCouponContainer>
                  <Suspense fallback={null}>{coupon && <CouponDisplay coupon={coupon} />}</Suspense>
                  <KeyboardArrowRight fontSize="small" />
                </MiniCouponContainer>
              </CouponButton>
            </CheckoutStack>
            <CheckoutStack>
              <CheckoutPriceContainer onClick={() => toggleDrawer(true)}>
                <PriceContainer className="row">
                  <CheckoutText>Tổng thanh toán:</CheckoutText>
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
                    <SavePrice>Tiết kiệm {currencyFormat.format(displayInfo.totalDiscount)}</SavePrice>
                  )}
                </PriceContainer>
              </CheckoutPriceContainer>
              {activeStep < 2 ? (
                <CheckoutButton
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ maxWidth: "35%" }}
                  onClick={handleNext}
                  disabled={!isValid || calculating}
                  endIcon={<KeyboardDoubleArrowDown />}
                >
                  Tiếp tục ({activeStep + 1}/{maxSteps})
                </CheckoutButton>
              ) : (
                <CheckoutButton
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ maxWidth: "35%" }}
                  disabled={calculating || !reCaptchaLoaded}
                  onClick={handleSubmit}
                >
                  Đặt hàng
                </CheckoutButton>
              )}
            </CheckoutStack>
          </CheckoutBox>
        ) : (
          <>
            {activeStep > 0 && addressInfo && (
              <CheckoutBox>
                <CheckoutTitle>
                  GIAO TỚI
                  {coupon && (
                    <EditButton onClick={backFirstStep}>
                      <Edit /> Thay đổi
                    </EditButton>
                  )}
                </CheckoutTitle>
                <CheckoutRow>
                  <AddressContainer>
                    <AddressContent>
                      <UserInfo>{addressInfo?.companyName ?? addressInfo?.name}&nbsp;</UserInfo>
                      {addressInfo?.phone && <UserInfo>{`(+84) ${addressInfo.phone}`}</UserInfo>}
                    </AddressContent>
                    <Address>
                      {address && <AddressTag className={address.color}>{address.label}</AddressTag>}
                      {fullAddress.length > 2 ? fullAddress : "Không xác định"}
                    </Address>
                  </AddressContainer>
                </CheckoutRow>
              </CheckoutBox>
            )}
            {activeStep > 0 && (
              <CheckoutBox>
                <CheckoutTitle>
                  KHUYẾN MÃI
                  {coupon && <span>Đã áp dụng</span>}
                </CheckoutTitle>
                <CheckoutRow>{coupon && <CouponDisplay coupon={coupon} />}</CheckoutRow>
                <CouponButton onClick={() => handleOpenDialog()}>
                  <span>
                    <LocalActivityOutlined color="error" />
                    &nbsp;
                    {coupon && discount
                      ? `Đã giảm ${currencyFormat.format(discount)}`
                      : `Chọn mã giảm giá ${coupon != null ? "khác" : ""}`}
                  </span>
                  <KeyboardArrowRight fontSize="small" />
                </CouponButton>
              </CheckoutBox>
            )}
            <CheckoutBox className="sticky">
              <CheckoutTitle>ĐƠN HÀNG</CheckoutTitle>
              {checkoutDetail}
              {activeStep < 2 ? (
                <CheckoutButton
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ padding: "11px", mt: 1 }}
                  onClick={handleNext}
                  disabled={!isValid || calculating}
                  endIcon={<KeyboardDoubleArrowDown />}
                >
                  Tiếp tục ({activeStep + 1}/{maxSteps})
                </CheckoutButton>
              ) : (
                <CheckoutButton
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ padding: "11px", mt: 1 }}
                  disabled={calculating || !reCaptchaLoaded}
                  onClick={handleSubmit}
                >
                  Đặt hàng
                </CheckoutButton>
              )}
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
            disabled={calculating}
          >
            <CheckoutBox className="drawer">
              {activeStep > 0 && addressInfo && (
                <>
                  <CheckoutTitle>
                    GIAO TỚI
                    {coupon && (
                      <EditButton
                        onClick={() => {
                          backFirstStep();
                          toggleDrawer(false);
                        }}
                      >
                        <Edit /> Thay đổi
                      </EditButton>
                    )}
                  </CheckoutTitle>
                  <CheckoutRow>
                    <AddressContainer>
                      <AddressContent>
                        <UserInfo>{addressInfo?.companyName ?? addressInfo?.name}&nbsp;</UserInfo>
                        {addressInfo?.phone && <UserInfo>{`(+84) ${addressInfo.phone}`}</UserInfo>}
                      </AddressContent>
                      <Address>
                        {address && <AddressTag className={address.color}>{address.label}</AddressTag>}
                        {fullAddress.length > 2 ? fullAddress : "Không xác định"}
                      </Address>
                    </AddressContainer>
                  </CheckoutRow>
                  <AddressDivider />
                </>
              )}
              <CheckoutTitle>ĐẶT HÀNG</CheckoutTitle>
              {checkoutDetail}
            </CheckoutBox>
          </SwipeableDrawer>
        )}
      </Suspense>
    </>
  );
};

export default FinalCheckoutDialog;
