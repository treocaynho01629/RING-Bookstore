import { currencyFormat, idFormatter } from "@ring/shared/utils/convert";
import { getPaymentType } from "@ring/shared/enums/payment";
import { OrderStatus } from "@ring/shared/models/orderStatus";
import { Link } from "react-router";
import {
  ItemTitle,
  Shop,
  ShopTag,
  ContentContainer,
  HeadContainer,
  BodyContainer,
  StyledLazyImage,
  StyledSkeleton,
  ToggleArrow,
  OrderItemContainer,
  StuffContainer,
  BotContainer,
  FinalPriceContainer,
  PriceRow,
  PriceText,
  Amount,
  PriceContainer,
  FinalPrice,
  Price,
  Discount,
} from "../custom/OrderComponents";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadContainer, PlaceholderContainer } from "../custom/ProfileComponents";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Storefront from "@mui/icons-material/Storefront";

const OrderDetailItems = ({ order, tabletMode }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const paymentMeta = getPaymentType(order?.paymentType);

  /**
   * Toggle the price collapse
   */
  const togglePrice = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div>
      <OrderItemContainer>
        <HeadContainer>
          {!order ? (
            <>
              <Shop>
                <Skeleton variant="text" width={200} />
              </Shop>
              <Typography variant="caption" color="secondary">
                <Skeleton variant="text" width={50} />
              </Typography>
            </>
          ) : (
            <>
              <Link to={`/shop/${order?.shopId}`}>
                <Shop>
                  {order?.shopVerified && <ShopTag>{t("partner")}</ShopTag>}
                  <Storefront />
                  &nbsp;{order?.shopName}
                  <KeyboardArrowRight fontSize="small" />
                </Shop>
              </Link>
              <Typography variant="caption" color="secondary">
                {idFormatter(order?.id)}
              </Typography>
            </>
          )}
        </HeadContainer>
        {!order ? (
          <PlaceholderContainer>
            <LoadContainer>
              <CircularProgress color="primary" />
            </LoadContainer>
          </PlaceholderContainer>
        ) : (
          order?.items?.map((item, itemIndex) => (
            <BodyContainer
              key={`item-${item?.id}-${itemIndex}`}
              className={
                order?.status == OrderStatus.CANCELED || order?.status == OrderStatus.REFUNDED ? "disabled" : ""
              }
            >
              <Link to={`/product/${item?.bookSlug}`}>
                <StyledLazyImage
                  src={item?.image}
                  alt={`${item?.bookTitle} Order item`}
                  placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
                />
              </Link>
              <ContentContainer>
                <Link to={`/product/${item?.bookSlug}`}>
                  <ItemTitle>{item?.bookTitle}</ItemTitle>
                </Link>
                <StuffContainer>
                  {order?.status == OrderStatus.COMPLETED ? (
                    <div>
                      <Amount>
                        {t("quantity.label")}: <b>{item?.quantity}</b>
                      </Amount>
                      <Link to={`/product/${item?.bookSlug}?review=true`}>
                        <Button variant="outlined" color="info" size="small" sx={{ mt: 0.5, minWidth: 100 }}>
                          {t("review.label")}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Amount>
                      {t("quantity.label")}: <b>{item?.quantity}</b>
                    </Amount>
                  )}
                  <div>
                    <Amount className="mobile">
                      {t("quantity.short")}: <b>{item?.quantity}</b>
                    </Amount>
                    <PriceContainer>
                      <Price>{currencyFormat.format(item.price * (1 - (item?.discount || 0)))}</Price>
                      <Discount>{item?.discount > 0 ? currencyFormat.format(item.price) : ""}</Discount>
                    </PriceContainer>
                  </div>
                </StuffContainer>
              </ContentContainer>
            </BodyContainer>
          ))
        )}
        <BotContainer>
          <FinalPriceContainer>
            <Collapse in={!tabletMode || open} timeout="auto" unmountOnExit>
              <PriceRow>
                <PriceText className="secondary">{t("cart.subtotal")}:</PriceText>
                <PriceText>
                  {!order ? <Skeleton variant="text" width={90} /> : currencyFormat.format(order?.totalPrice)}
                </PriceText>
              </PriceRow>
              <PriceRow>
                <PriceText className="secondary">{t("cart.shipping.fee")}:</PriceText>
                <PriceText>
                  {!order ? <Skeleton variant="text" width={85} /> : currencyFormat.format(order?.shippingFee)}
                </PriceText>
              </PriceRow>
              {order?.shippingDiscount > 0 && (
                <PriceRow>
                  <PriceText className="secondary">{t("cart.shipping.discount")}:</PriceText>
                  <PriceText className="discount">{currencyFormat.format(-order?.shippingDiscount)}</PriceText>
                </PriceRow>
              )}
              {order?.totalDiscount - order?.shippingDiscount > 0 && (
                <PriceRow>
                  <PriceText className="secondary">{t("cart.product.discount")}:</PriceText>
                  <PriceText className="discount">
                    {currencyFormat.format(-(order?.totalDiscount - order?.shippingDiscount))}
                  </PriceText>
                </PriceRow>
              )}
              <Divider sx={{ my: 1 }} />
            </Collapse>
            <PriceRow onClick={togglePrice}>
              <PriceText>{t("total")}:</PriceText>
              <FinalPrice color="primary">
                {!order ? (
                  <Skeleton variant="text" width={90} />
                ) : (
                  currencyFormat.format(order?.totalPrice + order?.shippingFee - order?.totalDiscount)
                )}
                <ToggleArrow>
                  {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                </ToggleArrow>
              </FinalPrice>
            </PriceRow>
            <Collapse in={!tabletMode || open} timeout="auto" unmountOnExit>
              <PriceRow>
                <PriceText className="secondary">{t("payment.label")}:</PriceText>
                <PriceText color="warning">
                  {!order ? <Skeleton variant="text" width={150} /> : t(paymentMeta?.label)}
                </PriceText>
              </PriceRow>
            </Collapse>
          </FinalPriceContainer>
        </BotContainer>
      </OrderItemContainer>
    </div>
  );
};

export default OrderDetailItems;
