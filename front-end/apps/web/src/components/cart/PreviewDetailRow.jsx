import styled from "@emotion/styled";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { StyledItemTableRow, StyledTableRow, SpaceTableRow, StyledTableCell } from "../custom/TableComponents";
import { currencyFormat } from "@ring/shared/utils/convert";
import { getImageSrc } from "@ring/shared/enums/image";
import { getShippingType } from "@ring/shared/enums/shipping";
import { ShippingType } from "@ring/shared/models/shippingType";
import { iconList } from "@ring/shared/utils/icon";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import Inventory from "@mui/icons-material/Inventory";

//#region styled
const ItemContainer = styled.div`
  display: flex;
  width: 100%;
`;

const ItemSummary = styled.div`
  margin-left: 10px;
  width: 100%;
  max-height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemTitle = styled.p`
  font-size: 14px;
  font-weight: 400;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin: 0;

  @supports (-webkit-line-clamp: 2) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &.error {
    color: ${({ theme }) => theme.vars.palette.error.light};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 13px;

    @supports (-webkit-line-clamp: 1) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
  }
`;

const Shop = styled.span`
  font-size: 15px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.vars.palette.primary.dark};

  svg {
    font-size: 18px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
    margin: 8px 0;
  }
`;

const ShippingContainer = styled.div`
  text-align: right;
  cursor: pointer;
`;

const OptionButton = styled.b`
  font-size: 15px;
  white-space: nowrap;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  span {
    display: flex;
    align-items: center;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
    margin: 8px 0;
  }
`;

const ButtonLabel = styled.span`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    flex-direction: row-reverse;

    .hide-on-mobile {
      display: none;
    }
  }
`;

const ItemAction = styled.div`
  justify-content: space-between;
  align-items: flex-end;
  display: flex;
`;

const NoteInput = styled(TextField)`
  width: 100%;
  border-color: red;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    border: 0;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: ${({ theme }) => theme.spacing(0.5)} 0;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    justify-content: space-between;
  }
`;

const ShippingInfo = styled.p`
  white-space: nowrap;
  color: ${({ theme }) => theme.vars.palette.info.main};
`;

const Price = styled.p`
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  color: ${({ theme }) => theme.vars.palette.primary.main};
  margin: 0;
  margin-right: ${({ theme }) => theme.spacing(1)};

  &.total {
    color: ${({ theme }) => theme.vars.palette.warning.light};
    text-align: right;
    margin: 0;
  }

  &.final {
    color: ${({ theme }) => theme.vars.palette.error.light};
    font-weight: 450;
    font-size: 16px;
    text-align: right;
    margin: 0;
  }

  &.shipping {
    font-size: 13px;
    text-align: right;
    font-weight: 450;
    margin: 0;
    margin-left: ${({ theme }) => theme.spacing(1)};
    color: ${({ theme }) => theme.vars.palette.text.primary};
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

const Amount = styled.span`
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
`;

const StyledLazyImage = styled(LazyLoadImage)`
  display: inline-block;
  height: 50px;
  width: 50px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 45px;
    width: 45px;
  }
`;

const StyledSkeleton = styled(Skeleton)`
  display: inline-block;
  height: 50px;
  width: 50px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 45px;
    width: 45px;
  }
`;
//#endregion

function ItemRow({ product, index }) {
  const { t } = useTranslation();
  const isDisabled = !product || product.amount < 1;

  return (
    <StyledItemTableRow tabIndex={-1} key={`item-${product.id}-${index}`} className={isDisabled ? "error" : ""}>
      <StyledTableCell className="preview" component="th" scope="row">
        <ItemContainer>
          <StyledLazyImage
            src={getImageSrc(product?.srcSet, 50)}
            alt={`${t("order.item")} ${product.title}`}
            placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
          />
          <ItemSummary>
            <ItemTitle className={isDisabled ? "error" : ""}>{product.title}</ItemTitle>
            <ItemAction>
              <Box display={{ xs: "flex", md: "none", md_lg: "flex", lg: "none" }}>
                <Price>{currencyFormat.format(product.price * (1 - (product?.discount || 0)))}</Price>
                <Discount>{product?.discount > 0 ? currencyFormat.format(product.price) : ""}</Discount>
              </Box>
              <Box display={{ xs: "flex", sm: "none" }}>x{product.quantity}</Box>
            </ItemAction>
          </ItemSummary>
        </ItemContainer>
      </StyledTableCell>
      <StyledTableCell
        className="preview"
        align="right"
        sx={{
          display: {
            xs: "none",
            md: "table-cell",
            md_lg: "none",
            lg: "table-cell",
          },
        }}
      >
        <Price>{currencyFormat.format(product.price * (1 - (product?.discount || 0)))}</Price>
        {product?.discount > 0 && <Discount>{currencyFormat.format(product.price)}</Discount>}
      </StyledTableCell>
      <StyledTableCell className="preview" align="center" sx={{ display: { xs: "none", sm: "table-cell" } }}>
        <Amount>
          {t("quantity.short")}: {product.quantity}
        </Amount>
      </StyledTableCell>
      <StyledTableCell className="preview" align="right" sx={{ display: { xs: "none", md: "table-cell" } }}>
        <Price className="total">
          {currencyFormat.format(product.price * (1 - (product?.discount || 0)) * product.quantity)}
        </Price>
      </StyledTableCell>
    </StyledItemTableRow>
  );
}

const PreviewDetailRow = ({
  shop,
  coupon,
  shipping,
  discount,
  shippingFee,
  shippingDiscount,
  shopNote,
  setShopNote,
  handleOpenCouponDialog,
  handleOpenShippingDialog,
}) => {
  const { t } = useTranslation();

  // Calculated price for display
  let total = 0;
  let totalQuantity = 0;
  const shippingMeta = getShippingType(shipping || Object.keys(ShippingType)[0]);
  const Icon = iconList[shippingMeta?.icon];

  for (const product of shop?.products) {
    total += product.quantity * product.price * (1 - (product?.discount || 0));
    totalQuantity += product.quantity;
  }

  const getCouponText = () => {
    return coupon
      ? // Have coupon
        discount
        ? // Discount applied
          isGroupSelected
          ? // Group selected
            coupon?.isUsable
            ? // Coupon is usable
              t("cart.coupon.saved", {
                discount: currencyFormat.format(discount),
              })
            : t("cart.coupon.criteria", { criteria: coupon?.summary }) // Coupon is not usable
          : t("cart.coupon.change") // Group not selected
        : // Discount not applied
          coupon?.isUsed
          ? t("cart.coupon.change") // Coupon is used
          : t("cart.coupon.criteria", { criteria: coupon?.summary }) // Coupon is not usable
      : t("cart.coupon.add"); // No coupon
  };

  return (
    <>
      <SpaceTableRow />
      <StyledTableRow className="top" tabIndex={-1}>
        <StyledTableCell className="preview" align="left" colSpan={5} component="th" scope="row">
          <Shop>
            <Inventory />
            &nbsp;{t("address.from", { ns: "authenticated" })} {shop.shopName}
          </Shop>
        </StyledTableCell>
      </StyledTableRow>
      {shop.products?.map((product, index) => (
        <ItemRow key={`item-${product.id}-${index}`} {...{ product, index }} />
      ))}
      <StyledTableRow className="top" role="coupon-row">
        <StyledTableCell align="left" colSpan={6}>
          <OptionButton onClick={() => handleOpenCouponDialog(shop?.id)}>
            <span>
              &nbsp;
              <LocalActivityOutlined color="error" />
              &nbsp;{getCouponText()}
            </span>
            <KeyboardArrowRight fontSize="small" />
          </OptionButton>
        </StyledTableCell>
      </StyledTableRow>
      <StyledTableRow className="center" role="shipping-row">
        <StyledTableCell className="option" align="left" colSpan={6}>
          <Box display="flex" width="100%" flexDirection={{ xs: "column", sm: "row" }}>
            <NoteInput
              placeholder={t("checkout.note.placeholder", { ns: "authenticated" })}
              onChange={(e) =>
                setShopNote((prev) => ({
                  ...prev,
                  [shop?.id]: e.targget.value,
                }))
              }
              value={shopNote}
              size="small"
              fullWidth
              sx={{ mr: 1 }}
            />
            <ShippingContainer onClick={() => handleOpenShippingDialog(shop?.id)}>
              <OptionButton>
                <ButtonLabel>
                  &nbsp;{t("shipping.label")}:&emsp;
                  <Icon color="primary" />
                  &nbsp;
                  <span className="hide-on-mobile">&emsp;{t("edit")}</span>
                </ButtonLabel>
                <KeyboardArrowRight fontSize="small" />
              </OptionButton>
              <Box display="flex" justifyContent="space-between">
                <p>&nbsp;{t(shippingMeta?.label)}&emsp;</p>
                <span>
                  <ShippingInfo>{t("shipping.estimate", { date: shippingMeta?.estimate })}</ShippingInfo>
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    <Discount>{shippingDiscount > 0 ? currencyFormat.format(shippingDiscount) : ""}</Discount>
                    <Price className="shipping">{currencyFormat.format(shippingFee - (shippingDiscount || 0))}</Price>
                  </Box>
                </span>
              </Box>
            </ShippingContainer>
          </Box>
        </StyledTableCell>
      </StyledTableRow>
      <StyledTableRow className="bottom" role="total-row">
        <StyledTableCell align="right" colSpan={6}>
          <PriceContainer>
            &nbsp;{t("checkout.total", { ns: "authenticated", quantity: totalQuantity })}&emsp;
            <Price className="final">{currencyFormat.format(total)}</Price>
          </PriceContainer>
        </StyledTableCell>
      </StyledTableRow>
    </>
  );
};

export default PreviewDetailRow;
