import styled from "@emotion/styled";
import { Link } from "react-router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { currencyFormat } from "@ring/shared/utils/convert";
import { getImageSize } from "@ring/shared/enums/image";
import { useTranslation } from "react-i18next";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Popover from "@mui/material/Popover";
import Paper from "@mui/material/Paper";

//#region styled
const MiniCartContainer = styled.div`
  width: 400px;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const CartTitle = styled.span`
  font-size: 16px;
  font-weight: 450;
  text-transform: capitalize;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${({ theme }) => theme.spacing(1)} 0;

  b {
    text-transform: uppercase;
  }

  &.empty {
    justify-content: center;
    text-align: center;
    min-height: 250px;
  }
`;

const ProductTitle = styled.span`
  width: 100%;
  font-size: 14px;
  font-weight: 450;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  @supports (-webkit-line-clamp: 1) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
`;

const ProductPrice = styled.span`
  width: 100%;
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.vars.palette.primary.main};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  justify-content: space-between;
`;

const ItemContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing(1)} 0;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const ActionContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
//#endregion

const ImageSize = getImageSize();

const MiniCart = ({ anchorEl, handleClose, products }) => {
  const { t } = useTranslation();
  const open = Boolean(anchorEl);

  return (
    <Popover
      id="mouse-over-popover-cart"
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      onClick={handleClose}
      disableRestoreFocus
      disableScrollLock
      closeAfterTransition
      transitionDuration={150}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      sx={{ pointerEvents: "none" }}
      slotProps={{
        paper: {
          elevation: 2,
          sx: {
            overflow: "visible",
            mt: 1.5,
            borderRadius: 0,
            pointerEvents: "auto",
          },
          onMouseLeave: handleClose,
        },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: "block",
          position: "absolute",
          top: 0,
          right: 14,
          width: 10,
          height: 10,
          bgcolor: "background.paper",
          transform: "translateY(-50%) rotate(45deg)",
          boxShadow: "none",
          zIndex: 0,
        }}
      />
      <MiniCartContainer>
        <CartTitle>{t("cart.title", { ns: "client" })}</CartTitle>
        <ItemsContainer className={products?.length == 0 ? "empty" : ""}>
          {products?.length == 0 ? (
            <>
              <RemoveShoppingCartIcon sx={{ fontSize: "50px" }} />
              <b>{t("cart.empty", { ns: "client" })}</b>
            </>
          ) : (
            products?.slice(0, 5).map((product, index) => (
              <ItemContainer key={`cartitem-${index}-${product?.id}`}>
                <LazyLoadImage
                  width={50}
                  height={50}
                  style={{ objectFit: "contain" }}
                  src={product?.image?.srcSet[ImageSize?.TINY?.value]}
                  alt={`Cart item: ${product?.title}`}
                  placeholder={
                    <Skeleton
                      width={50}
                      height={50}
                      animation={false}
                      sx={{ minWidth: "50px" }}
                      variant="rectangular"
                    />
                  }
                />
                <ItemInfo>
                  <ProductTitle>{product?.title}</ProductTitle>
                  <ProductPrice>{currencyFormat.format(product?.price)}</ProductPrice>
                </ItemInfo>
              </ItemContainer>
            ))
          )}
        </ItemsContainer>
        {products?.length != 0 && (
          <ActionContainer>
            <span>
              {products?.length <= 5 ? (
                <>&nbsp;</>
              ) : (
                `${t("cart.more", { ns: "client", quantity: products?.length - 5 })}`
              )}
            </span>
            <Link to={"/cart"} title={t("cart.view", { ns: "client" })}>
              <Button variant="outlined" color="info" size="medium">
                {t("cart.view", { ns: "client" })}
              </Button>
            </Link>
          </ActionContainer>
        )}
      </MiniCartContainer>
    </Popover>
  );
};

export default MiniCart;
