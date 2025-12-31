import styled from "@emotion/styled";
import { currencyFormat } from "@ring/shared/utils/convert";
import { OrderStatus } from "@ring/shared/models/orderStatus";
import { getOrderStatus } from "@ring/shared/enums/order";
import { Link } from "react-router";
import {
  ItemTitle,
  Shop,
  ShopTag,
  DetailText,
  ContentContainer,
  HeadContainer,
  BodyContainer,
  StyledLazyImage,
  StyledSkeleton,
  StatusTag,
} from "../custom/OrderComponents";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeliveryDiningOutlined from "@mui/icons-material/DeliveryDiningOutlined";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Payment from "@mui/icons-material/Payment";
import Storefront from "@mui/icons-material/Storefront";

//#region styled
const Amount = styled.span`
  font-size: 14px;
  font-weight: 450;
  margin-right: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.vars.palette.text.secondary};

  b {
    color: ${({ theme }) => theme.vars.palette.warning.main};
  }
`;

const StuffContainer = styled.div`
  display: flex;
  justify-content: space-between;

  ${({ theme }) => theme.breakpoints.down("md")} {
    align-items: flex-end;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    flex-direction: row-reverse;
  }
`;

const PriceContainer = styled.div``;

const Price = styled.p`
  font-size: 16px;
  font-weight: 450;
  text-align: left;
  color: ${({ theme }) => theme.vars.palette.primary.main};
  margin: 0;

  &.total {
    color: ${({ theme }) => theme.vars.palette.warning.light};
  }
`;

const Discount = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.vars.palette.text.disabled};
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  text-decoration: line-through;
`;

const OrderItemContainer = styled.div`
  border: 0.5px solid;
  border-color: ${({ theme }) => theme.vars.palette.action.focus};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const BotContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)};
  border-top: 0.5px solid;
  border-color: ${({ theme }) => theme.vars.palette.action.focus};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(1)};
    font-size: 14px;
    align-items: flex-start;
  }
`;

const MainButton = styled(Button)`
  min-width: 200px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    min-width: 150px;
  }
`;
//#endregion

const OrderItem = ({ order, handleAddToCart, handleCancelOrder }) => {
  const { t } = useTranslation();
  const detailStatus = getOrderStatus(order?.status);

  return (
    <OrderItemContainer>
      <HeadContainer>
        <Link to={`/shops/${order?.shopId}`}>
          <Shop>
            <ShopTag>{t("partner")}</ShopTag>
            <Storefront />
            &nbsp;{order?.shopName}
            <KeyboardArrowRight fontSize="small" />
          </Shop>
        </Link>
        <Link to={`/profile/order/detail/${order?.id}`}>
          <StatusTag color={detailStatus?.color}>{t(detailStatus?.label)}</StatusTag>
        </Link>
      </HeadContainer>
      {order?.items?.map((item, itemIndex) => (
        <Link key={`item-${item?.id}-${itemIndex}`} to={`/profile/order/detail/${order?.id}`}>
          <BodyContainer
            className={order?.status == OrderStatus.CANCELED || order?.status == OrderStatus.REFUNDED ? "disabled" : ""}
          >
            <StyledLazyImage
              src={item?.image}
              alt={`${t("order.item")} ${item?.bookTitle}`}
              placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
            />
            <ContentContainer>
              <ItemTitle>{item?.bookTitle}</ItemTitle>
              <StuffContainer>
                <Amount>
                  {t("quantity.label")}: <b>{item?.quantity}</b>
                </Amount>
                <PriceContainer>
                  <Price>{currencyFormat.format(item.price * (1 - (item?.discount || 0)))}</Price>
                  <Discount>{item?.discount > 0 ? currencyFormat.format(item.price) : ""}</Discount>
                </PriceContainer>
              </StuffContainer>
            </ContentContainer>
          </BodyContainer>
        </Link>
      ))}
      <BotContainer>
        {order?.status == OrderStatus.PENDING_PAYMENT ? (
          <Link
            to={`/profile/order/checkout/${order?.orderId}`}
            style={{ color: "inherit", display: "flex", alignItems: "center" }}
          >
            <DetailText>
              <Payment />
              &nbsp;{t("order.checkout")}
            </DetailText>
          </Link>
        ) : (
          <Link
            to={`/profile/order/detail/${order?.id}`}
            style={{ color: "inherit", display: "flex", alignItems: "center" }}
          >
            <DetailText>
              <DeliveryDiningOutlined />
              &nbsp;{t("order.detail")}
            </DetailText>
          </Link>
        )}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginBottom: "5px",
            }}
          >
            <p style={{ margin: 0 }}>{t("order.total", { ns: "authenticated" })}:</p>
            <Price className="total">
              &nbsp;
              {currencyFormat.format(order?.totalPrice + order?.shippingFee - order?.totalDiscount)}
            </Price>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {order?.status == OrderStatus.PENDING ? (
              <MainButton variant="outlined" color="error" onClick={() => handleCancelOrder(order)}>
                {t("order.cancel.label", { ns: "authenticated" })}
              </MainButton>
            ) : order?.status == OrderStatus.PENDING_PAYMENT ? (
              <Link to={`/payment/${order?.orderId}`}>
                <MainButton variant="contained" color="info">
                  {t("order.pay", { ns: "authenticated" })}
                </MainButton>
              </Link>
            ) : (
              <MainButton variant="contained" color="primary" onClick={() => handleAddToCart(order)}>
                {t("order.again", { ns: "authenticated" })}
              </MainButton>
            )}
          </Box>
        </Box>
      </BotContainer>
    </OrderItemContainer>
  );
};

export default OrderItem;
