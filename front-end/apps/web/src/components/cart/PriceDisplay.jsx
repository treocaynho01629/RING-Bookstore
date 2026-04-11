import { Collapse } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { CheckoutRow, CheckoutText, DetailContainer } from "../custom/CartComponents";
import { currencyFormat } from "@ring/shared/utils/convert";
import { useTranslation } from "react-i18next";

const PriceDisplay = ({ displayInfo, hideAdditionalInfo = false, loggedIn = false }) => {
  const { t } = useTranslation();

  return (
    <DetailContainer>
      <CheckoutRow>
        <CheckoutText>{t("cart.subtotal")}:</CheckoutText>
        <CheckoutText>{currencyFormat.format(displayInfo.subTotal)}</CheckoutText>
      </CheckoutRow>
      {!hideAdditionalInfo && (
        <>
          <CheckoutRow>
            <CheckoutText>{t("cart.shipping.fee")}:</CheckoutText>
            <CheckoutText>{currencyFormat.format(displayInfo.shipping)}</CheckoutText>
          </CheckoutRow>
          <TransitionGroup>
            {displayInfo.shippingDiscount > 0 && (
              <Collapse key={"shipping-discount"}>
                <CheckoutRow>
                  <CheckoutText>{t("cart.shipping.discount")}:</CheckoutText>
                  <CheckoutText>-{currencyFormat.format(displayInfo.shippingDiscount)}</CheckoutText>
                </CheckoutRow>
              </Collapse>
            )}
            {displayInfo.deal > 0 && (
              <Collapse key={"product-discount"}>
                <CheckoutRow>
                  <CheckoutText>{t("cart.product.discount")}:</CheckoutText>
                  <CheckoutText>-{currencyFormat.format(displayInfo.deal)}</CheckoutText>
                </CheckoutRow>
              </Collapse>
            )}
            {displayInfo.couponDiscount > 0 && (
              <Collapse key={"coupon-discount"}>
                <CheckoutRow>
                  <CheckoutText>{t("cart.coupon.discount")}:</CheckoutText>
                  <CheckoutText>-{currencyFormat.format(displayInfo.couponDiscount)}</CheckoutText>
                </CheckoutRow>
              </Collapse>
            )}
            {!loggedIn && displayInfo.subTotal > 0 && (
              <Collapse key={"disclaimer"}>
                <CheckoutRow>
                  <CheckoutText></CheckoutText>
                  <CheckoutText color="warning">
                    &nbsp;
                    <br />
                    {t("required.login", { action: t("cart.coupon.apply") })}
                  </CheckoutText>
                </CheckoutRow>
              </Collapse>
            )}
          </TransitionGroup>
        </>
      )}
    </DetailContainer>
  );
};

export default PriceDisplay;
