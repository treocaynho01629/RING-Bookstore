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
import { useTranslation } from "react-i18next";
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
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
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

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme }) => theme.vars.palette.info.light};
    }
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
  token,
}) => {
  const { t } = useTranslation();
  const overlapRef = useRef(null);
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md_lg"));
  const fullAddress = [addressInfo?.city, addressInfo?.address].join(", ");
  const [open, setOpen] = useState(undefined);

  /**
   * Handle toggle drawer
   * @param {boolean} newOpen
   */
  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };
  const address = addressInfo?.type ? AddressType[addressInfo.type] : null;

  // Prevent overlap with scroll to top button
  useOffset(overlapRef);

  // Component stuff
  let checkoutDetail = (
    <>
      <PriceDisplay displayInfo={displayInfo} loggedIn={true} />
      <CheckoutRow>
        <PriceContainer>
          <CheckoutPrice>
            <b>{t("total", { ns: "common" })}:</b>
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
              {t("saved", { ns: "common" })} {currencyFormat.format(displayInfo.totalDiscount)}
            </SavePrice>
          )}
          <SubText>({t("checkout.vat.description", { ns: "authenticated" })})</SubText>
        </PriceContainer>
      </CheckoutRow>
    </>
  );

  const couponText =
    coupon && discount
      ? t("cart.coupon.saved", { discount: currencyFormat.format(discount) })
      : !coupon
        ? t("cart.coupon.add")
        : t("cart.coupon.change");

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
                      {t("total")}: ({activeStep + 1}/{maxSteps})
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
                    <SavePrice>
                      {t("cart.saved", { discount: currencyFormat.format(displayInfo.totalDiscount) })}
                    </SavePrice>
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
                  {t("continue")}
                </CheckoutButton>
              ) : (
                <CheckoutButton
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ maxWidth: "42%" }}
                  disabled={calculating || !token}
                  onClick={handleSubmit}
                >
                  {t("checkout.order", { ns: "authenticated" })}
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
                  {couponText}
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
                  <CheckoutText>{t("cart.total")}:</CheckoutText>
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
                      {t("cart.saved", { discount: currencyFormat.format(displayInfo.totalDiscount) })}
                    </SavePrice>
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
                  {t("continue")} ({activeStep + 1}/{maxSteps})
                </CheckoutButton>
              ) : (
                <CheckoutButton
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ maxWidth: "35%" }}
                  disabled={calculating || !token}
                  onClick={handleSubmit}
                >
                  {t("checkout.order", { ns: "authenticated" })}
                </CheckoutButton>
              )}
            </CheckoutStack>
          </CheckoutBox>
        ) : (
          <>
            {activeStep > 0 && addressInfo && (
              <CheckoutBox>
                <CheckoutTitle>
                  {t("address.to", { ns: "authenticated" })}
                  {coupon && (
                    <EditButton onClick={backFirstStep}>
                      <Edit /> {t("edit")}
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
                      {fullAddress.length > 2 ? fullAddress : t("unknown")}
                    </Address>
                  </AddressContainer>
                </CheckoutRow>
              </CheckoutBox>
            )}
            {activeStep > 0 && (
              <CheckoutBox>
                <CheckoutTitle>
                  {t("cart.discount")}
                  {coupon && <span>{t("cart.coupon.applied")}</span>}
                </CheckoutTitle>
                <CheckoutRow>{coupon && <CouponDisplay coupon={coupon} />}</CheckoutRow>
                <CouponButton onClick={() => handleOpenDialog()}>
                  <span>
                    <LocalActivityOutlined color="error" />
                    &nbsp;
                    {couponText}
                  </span>
                  <KeyboardArrowRight fontSize="small" />
                </CouponButton>
              </CheckoutBox>
            )}
            <CheckoutBox className="sticky">
              <CheckoutTitle>{t("order.receipt")}</CheckoutTitle>
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
                  {t("continue")} ({activeStep + 1}/{maxSteps})
                </CheckoutButton>
              ) : (
                <CheckoutButton
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ padding: "11px", mt: 1 }}
                  disabled={calculating || !token}
                  onClick={handleSubmit}
                >
                  {t("checkout.order", { ns: "authenticated" })}
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
                    {t("address.to", { ns: "authenticated" })}
                    {coupon && (
                      <EditButton
                        onClick={() => {
                          backFirstStep();
                          toggleDrawer(false);
                        }}
                      >
                        <Edit /> {t("edit")}
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
                        {fullAddress.length > 2 ? fullAddress : t("unknown")}
                      </Address>
                    </AddressContainer>
                  </CheckoutRow>
                  <AddressDivider />
                </>
              )}
              <CheckoutTitle>{t("checkout.order", { ns: "authenticated" })}</CheckoutTitle>
              {checkoutDetail}
            </CheckoutBox>
          </SwipeableDrawer>
        )}
      </Suspense>
    </>
  );
};

export default FinalCheckoutDialog;
