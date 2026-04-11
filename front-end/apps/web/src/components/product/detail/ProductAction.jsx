import styled from "@emotion/styled";
import { lazy, Suspense, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { getImageSrc } from "@ring/shared/enums/image";
import { currencyFormat } from "@ring/shared/utils/convert";
import { useTranslation } from "react-i18next";
import Button, { buttonClasses } from "@mui/material/Button";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import Skeleton from "@mui/material/Skeleton";
import AddShoppingCart from "@mui/icons-material/AddShoppingCart";
import useCart from "../../../hooks/useCart";
import AmountInput from "../../custom/AmountInput";
import useOffset from "../../../hooks/useOffset";

const SwipeableDrawer = lazy(() => import("@mui/material/SwipeableDrawer"));

//#region styled
const AmountCount = styled.span`
  font-size: 14px;
  margin-left: 20px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  white-space: nowrap;

  &.error {
    color: ${({ theme }) => theme.vars.palette.error.main};
    text-decoration: underline;
    font-weight: bold;
  }
`;

const FilterContainer = styled.div`
  position: relative;
  margin: 0px 0px 30px 0px;
  width: 100%;
  display: block;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;

const AltFilterContainer = styled.div`
  position: fixed;
  bottom: 0;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};
  border-bottom: none;
  padding: ${({ theme }) => theme.spacing(2.5, 2)};
  margin-left: ${({ theme }) => `calc(${theme.spacing(-1.5)} - 0.5px)`};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  display: flex;
  width: 100%;
  z-index: 2;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    left: 0;
    height: 50px;
    margin: 0;
    padding: 0;
    border: none;
    box-shadow: ${({ theme }) => theme.shadows[12]};
    align-items: flex-end;
  }

  ${({ theme }) => theme.breakpoints.up("sm_md")} {
    width: 720px;
  }
`;

const DetailTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
`;

const BuyButton = styled(Button)`
  margin-top: 15px;
  height: 100%;
  line-height: 1.5;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-top: 0;
    box-shadow: none;

    .${buttonClasses.startIcon} {
      margin: 0;
    }
  }
`;

const StyledImage = styled.img`
  object-fit: contain;
  width: 115px;
  height: 115px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};
`;

const DrawerContainer = styled.div`
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border-top: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  position: relative;
  width: 100%;

  &::before {
    content: "";
    position: absolute;
    top: ${({ theme }) => theme.spacing(1)};
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 5px;
    border-radius: 3px;
    background-color: ${({ theme }) => theme.vars.palette.divider};
  }
`;

const ProductDetailContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1.5)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  display: flex;
  align-items: flex-end;
  position: relative;
  border-bottom: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
`;

const Price = styled.span`
  color: ${({ theme }) => theme.vars.palette.primary.main};
  margin: 10px 20px;
  margin-right: 0;
`;

const Discount = styled(Price)`
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  text-decoration: line-through;
  margin-left: 10px;
`;
//#endregion

const MIN_VALUE = 1;
const MAX_VALUE = 199;

export const ActionButtons = ({ book, outlined = false }) => {
  const { addProduct } = useCart();
  const { t } = useTranslation();

  const navigate = useNavigate();
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [amountIndex, setAmountIndex] = useState(1); // Amount add to cart

  const [open, setOpen] = useState(false);
  const [openNow, setOpenNow] = useState(false);

  /**
   * Change amount add to cart
   */
  const changeAmount = (n) => {
    setAmountIndex((prev) => {
      if (+prev + n < MIN_VALUE) return MIN_VALUE;
      if (+prev + n > (book?.amount ?? MAX_VALUE)) return book?.amount ?? MAX_VALUE;
      return +prev + n;
    });
  };

  /**
   * Handle change amount input
   */
  const handleChangeAmount = (e) => {
    let newValue = e.target.value;
    if (isNaN(newValue)) newValue = "";

    if (newValue != "") {
      if (newValue < MIN_VALUE) newValue = MIN_VALUE;
      if (newValue > (book?.amount ?? MAX_VALUE)) newValue = book?.amount ?? MAX_VALUE;
    }

    setAmountIndex(newValue);
  };

  /**
   * Handle blur amount input
   */
  const handleBlurAmount = (e) => {
    let newValue = e.target.value;
    if (newValue == "" || isNaN(Number(newValue))) {
      newValue = MIN_VALUE;
      setAmountIndex(newValue);
    }
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = () => {
    handleClose();
    addProduct({ ...book, srcSet: book?.srcSet[0] }, amountIndex);
  };

  /**
   * Handle buy now
   */
  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  /**
   * Handle open drawer
   */
  const handleOpen = () => {
    setOpen(true);
    setOpenNow(false);
  };

  /**
   * Handle open buy now drawer
   */
  const handleOpenNow = () => {
    setOpen(false);
    setOpenNow(true);
  };

  /**
   * Handle close drawer
   */
  const handleClose = () => {
    setOpen(false);
    setOpenNow(false);
  };

  return tabletMode ? (
    <>
      <BuyButton
        variant={outlined ? "outlined" : "contained"}
        color="secondary"
        size="large"
        fullWidth
        sx={{ maxWidth: { xs: "35%", sm: "45%" }, mr: { xs: 0, sm: 1 } }}
        disabled={!book || book?.amount == 0}
        onClick={handleOpen}
        startIcon={<AddShoppingCart />}
      >
        <Box display={{ xs: "none", sm: "block" }}>{t("cart.add")}</Box>
      </BuyButton>
      <BuyButton
        variant={outlined ? "outlined" : "contained"}
        size="large"
        fullWidth
        disabled={!book || book?.amount == 0}
        onClick={handleOpenNow}
      >
        {!book
          ? t("loading")
          : book?.amount == 0
            ? t("cart.items.out")
            : `${t("product.buy.now")} (${currencyFormat.format(book?.price * (1 - book?.discount) * amountIndex)})`}
      </BuyButton>
      {tabletMode && (
        <Suspense fallback={null}>
          <SwipeableDrawer
            anchor="bottom"
            open={open || openNow}
            onOpen={handleOpen}
            onClose={handleClose}
            disableBackdropTransition
            disableSwipeToOpen={true}
            sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
          >
            <DrawerContainer>
              <ProductDetailContainer>
                <StyledImage src={getImageSrc(book?.srcSet, 250)} alt={`${book?.title} preview image`} />
                <Box>
                  <Box display="flex">
                    <Price>{currencyFormat.format(book?.price * (1 - book?.discount))}</Price>
                    {book?.discount > 0 && <Discount>{currencyFormat.format(book?.price)}</Discount>}
                  </Box>
                  <AmountCount className={book?.amount > 0 ? "" : "error"}>
                    {book?.amount > 0 ? t("product.left", { quantity: book?.amount }) : t("product.temporary")}
                  </AmountCount>
                </Box>
              </ProductDetailContainer>
              <Box display="flex" alignItems="center" justifyContent={"space-between"} px={1.5} pt={2} pb={1}>
                <DetailTitle>{t("quantity.label")}:</DetailTitle>
                <AmountInput
                  disabled={!book || book?.amount == 0}
                  size="small"
                  min={MIN_VALUE}
                  max={book?.amount ?? MAX_VALUE}
                  value={amountIndex}
                  error={1 > amountIndex > (book?.amount ?? MAX_VALUE)}
                  onChange={handleChangeAmount}
                  onBlur={handleBlurAmount}
                  handleDecrease={() => changeAmount(-1)}
                  handleIncrease={() => changeAmount(1)}
                />
              </Box>
              <Box p={1}>
                <BuyButton
                  variant="outlined"
                  color={openNow ? "warning" : "primary"}
                  size="large"
                  fullWidth
                  onClick={openNow ? handleBuyNow : handleAddToCart}
                >
                  {!book
                    ? t("loading")
                    : book?.amount == 0
                      ? t("cart.items.out")
                      : openNow
                        ? `${t("product.buy.now")} (${currencyFormat.format(book?.price * (1 - book?.discount) * amountIndex)})`
                        : `${t("cart.add")} (${currencyFormat.format(book?.price * (1 - book?.discount) * amountIndex)})`}
                </BuyButton>
              </Box>
            </DrawerContainer>
          </SwipeableDrawer>
        </Suspense>
      )}
    </>
  ) : (
    <>
      <Box display="flex" alignItems="center" flexWrap="wrap">
        <DetailTitle style={{ marginRight: 20 }}>{t("quantity.label")}:</DetailTitle>
        <Box display="flex" alignItems="center" my={1}>
          <AmountInput
            disabled={!book || book?.amount == 0}
            size="small"
            min={MIN_VALUE}
            max={book?.amount ?? MAX_VALUE}
            value={amountIndex}
            error={1 > amountIndex > (book?.amount ?? MAX_VALUE)}
            onChange={handleChangeAmount}
            onBlur={handleBlurAmount}
            handleDecrease={() => changeAmount(-1)}
            handleIncrease={() => changeAmount(1)}
          />
          {book ? (
            <AmountCount className={book?.amount > 0 ? "" : "error"}>
              {book?.amount > 0 ? t("product.left", { quantity: book?.amount }) : t("product.temporary")}
            </AmountCount>
          ) : (
            <Skeleton variant="text" sx={{ fontSize: "14px", marginLeft: 2 }} width={200} />
          )}
        </Box>
      </Box>
      <Box position="sticky" height={55} bottom={16} bgcolor={"background.paper"}>
        <Box display="flex" alignItems="center" height={47}>
          <BuyButton
            variant="contained"
            size="large"
            fullWidth
            sx={{ maxWidth: "40%", marginRight: 1 }}
            disabled={!book || book?.amount == 0}
            onClick={handleBuyNow}
          >
            {t("product.buy.now")}
          </BuyButton>
          <BuyButton
            variant="outlined"
            color="secondary"
            size="large"
            fullWidth
            disabled={!book || book?.amount == 0}
            onClick={handleAddToCart}
            startIcon={<AddShoppingCart fontSize="small" />}
          >
            {!book
              ? t("loading")
              : book?.amount == 0
                ? t("cart.items.out")
                : `${t("cart.add")} (${currencyFormat.format(book?.price * (1 - book?.discount) * amountIndex)})`}
          </BuyButton>
        </Box>
      </Box>
    </>
  );
};

const ProductAction = ({ book }) => {
  const overlapRef = useRef(null);
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // Prevent overlap
  useOffset(overlapRef);

  return (
    <>
      {tabletMode ? (
        <AltFilterContainer ref={overlapRef}>
          <ActionButtons book={book} />
        </AltFilterContainer>
      ) : (
        <FilterContainer>
          <ActionButtons book={book} />
        </FilterContainer>
      )}
    </>
  );
};

export default ProductAction;
