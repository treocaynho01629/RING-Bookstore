import styled from "@emotion/styled";
import { useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router";
import {
  ActionTableCell,
  StyledItemTableRow,
  StyledTableRow,
  SpaceTableRow,
  StyledTableCell,
} from "../custom/TableComponents";
import { currencyFormat } from "@ring/shared/utils/convert";
import { getImageSize } from "@ring/shared/enums/image";
import { StyledCheckbox } from "../custom/CartComponents";
import { useTranslation } from "react-i18next";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Storefront from "@mui/icons-material/Storefront";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import AmountInput from "../custom/AmountInput";

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
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin: 5px 0px;

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

  &:hover {
    color: ${({ theme }) => theme.vars.palette.info.main};
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

const Shop = styled.b`
  font-size: 15px;
  white-space: nowrap;
  display: flex;
  align-items: center;

  svg {
    color: ${({ theme }) => theme.vars.palette.text.secondary};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
    margin: 8px 0;
  }
`;

const CouponButton = styled.b`
  font-size: 15px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  span {
    max-width: 90vw;
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

const ShopTag = styled.span`
  background-color: ${({ theme }) => theme.vars.palette.primary.main};
  color: ${({ theme }) => theme.vars.palette.primary.contrastText};
  padding: 2px 10px;
  margin-right: 8px;
`;

const ItemAction = styled.div`
  justify-content: space-between;
  align-items: flex-end;
  display: flex;
`;

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

const AmountLeft = styled.span`
  font-size: 12px;
  text-align: center;
  color: ${({ theme }) => theme.vars.palette.error.light};
`;

const StyledLazyImage = styled(LazyLoadImage)`
  display: inline-block;
  height: 90px;
  width: 90px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 80px;
    width: 80px;
  }
`;

const StyledSkeleton = styled(Skeleton)`
  display: inline-block;
  height: 90px;
  width: 90px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 80px;
    width: 80px;
  }
`;

const StyledIconButton = styled(IconButton)`
  position: absolute;
  right: 4px;
  top: 4px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    right: 0;
    bottom: 0;
    top: auto;
  }
`;
//#endregion

const ImageSize = getImageSize();
const MIN_VALUE = 1;
const MAX_VALUE = 199;

function ItemRow({
  product,
  handleSelect,
  handleDeselect,
  isItemSelected,
  handleDecrease,
  increaseAmount,
  handleChangeQuantity,
  handleClick,
}) {
  const { t } = useTranslation();
  const labelId = `item-checkbox-${product?.id}`;
  const isDisabled = !product || product.amount < 1;

  useEffect(() => {
    if (product.amount < 1 || product.quantity > product.amount) handleDeselect(product.id);
  }, [product.amount]);

  return (
    <StyledItemTableRow role="checkbox" tabIndex={-1} key={`item-${product.id}`} className={isDisabled ? "error" : ""}>
      <StyledTableCell padding="checkbox">
        <StyledCheckbox
          disabled={isDisabled}
          disableRipple
          disableFocusRipple
          color="primary"
          checked={isItemSelected}
          slotProps={{
            input: {
              "aria-labelledby": labelId,
            },
          }}
          onClick={() => handleSelect(product.id)}
        />
      </StyledTableCell>
      <StyledTableCell component="th" id={labelId} scope="row">
        <ItemContainer>
          <Link to={`/product/${product.slug}`}>
            <StyledLazyImage
              src={product?.image?.srcSet[ImageSize?.SMALL?.value]}
              alt={`${product.title} Cart item`}
              placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
            />
          </Link>
          <ItemSummary>
            <Link to={`/product/${product.slug}`}>
              <ItemTitle className={isDisabled ? "error" : ""}>{product.title}</ItemTitle>
            </Link>
            <ItemAction>
              <Box
                display={{
                  xs: "block",
                  md: "none",
                  md_lg: "block",
                  lg: "none",
                }}
              >
                <Price>{currencyFormat.format(product.price * (1 - (product?.discount || 0)))}</Price>
                <Discount>{product?.discount > 0 ? currencyFormat.format(product.price) : ""}</Discount>
              </Box>
              <Box display={{ xs: "flex", sm: "none" }} mr={3}>
                <AmountInput
                  disabled={isDisabled}
                  size="small"
                  min={MIN_VALUE}
                  max={product.amount ?? MAX_VALUE}
                  value={product.quantity}
                  error={1 > product.quantity > (product.amount ?? MAX_VALUE)}
                  onChange={(e) => handleChangeQuantity(e.target.valueAsNumber, product.id)}
                  handleDecrease={() => handleDecrease(product.quantity, product.id)}
                  handleIncrease={() => increaseAmount(product.id)}
                />
              </Box>
            </ItemAction>
          </ItemSummary>
        </ItemContainer>
      </StyledTableCell>
      <StyledTableCell
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
      <StyledTableCell align="center" sx={{ display: { xs: "none", sm: "table-cell" } }}>
        <AmountInput
          disabled={isDisabled}
          size="small"
          min={MIN_VALUE}
          max={product.amount ?? MAX_VALUE}
          value={product.quantity}
          error={1 > product.quantity > (product.amount ?? MAX_VALUE)}
          onChange={(e) => handleChangeQuantity(e.target.valueAsNumber, product.id)}
          handleDecrease={() => handleDecrease(product.quantity, product.id)}
          handleIncrease={() => increaseAmount(product.id)}
        />
        <AmountLeft>
          {product.amount > 0
            ? t("cart.items.left", { quantity: product.amount, ns: "client" })
            : t("cart.items.out", { ns: "client" })}
        </AmountLeft>
      </StyledTableCell>
      <StyledTableCell align="right" sx={{ display: { xs: "none", md: "table-cell" } }}>
        <Price className="total">
          {currencyFormat.format(product.price * (1 - (product?.discount || 0)) * product.quantity)}
        </Price>
      </StyledTableCell>
      <ActionTableCell>
        <StyledIconButton onClick={(e) => handleClick(e, product)}>
          <MoreHoriz />
        </StyledIconButton>
      </ActionTableCell>
    </StyledItemTableRow>
  );
}

const CartDetailRow = ({
  shop,
  coupon,
  isSelected,
  isGroupSelected,
  handleSelect,
  handleDeselect,
  handleSelectShop,
  handleDecrease,
  handleChangeQuantity,
  handleClick,
  increaseAmount,
  handleOpenDialog,
}) => {
  const { t } = useTranslation();
  const shopLabelId = `shop-label-checkbox-${shop?.id}`;

  return (
    <>
      <SpaceTableRow />
      <StyledTableRow role="shop-checkbox" tabIndex={-1}>
        <StyledTableCell padding="checkbox">
          <StyledCheckbox
            color="primary"
            onChange={() => handleSelectShop(shop)}
            checked={isGroupSelected}
            slotProps={{
              input: {
                "aria-labelledby": shopLabelId,
              },
            }}
          />
        </StyledTableCell>
        <StyledTableCell align="left" colSpan={5} component="th" id={shopLabelId} scope="row">
          <Link to={`/shop/${shop?.id}`}>
            <Shop>
              <ShopTag>{t("partner")}</ShopTag>
              <Storefront />
              &nbsp;{shop?.shopName}
              <KeyboardArrowRight fontSize="small" />
            </Shop>
          </Link>
        </StyledTableCell>
      </StyledTableRow>
      {shop?.products?.map((product, index) => {
        const isItemSelected = isSelected(product.id);

        return (
          <ItemRow
            key={`item-${product.id}-${index}`}
            {...{
              product,
              handleSelect,
              handleDeselect,
              isItemSelected,
              handleDecrease,
              handleChangeQuantity,
              handleClick,
              increaseAmount,
            }}
          />
        );
      })}
      <StyledTableRow role="coupon-row">
        <StyledTableCell align="left" colSpan={6}>
          <CouponButton onClick={() => handleOpenDialog(shop?.id)}>
            <span>
              &nbsp;
              <LocalActivityOutlined color="error" />
              &nbsp;
              {coupon
                ? coupon?.discount
                  ? isGroupSelected
                    ? coupon?.isUsable
                      ? t("cart.coupon.discount.applied", {
                          discount: currencyFormat.format(coupon?.discount),
                          ns: "client",
                        })
                      : t("cart.coupon.discount.criteria", { criteria: coupon?.summary, ns: "client" })
                    : t("cart.coupon.change", { ns: "client" })
                  : coupon?.isUsed
                    ? t("cart.coupon.change", { ns: "client" })
                    : t("cart.coupon.discount.criteria", { criteria: coupon?.summary, ns: "client" })
                : t("cart.coupon.add", { ns: "client" })}
            </span>
            <KeyboardArrowRight fontSize="small" />
          </CouponButton>
        </StyledTableCell>
      </StyledTableRow>
    </>
  );
};

export default CartDetailRow;
