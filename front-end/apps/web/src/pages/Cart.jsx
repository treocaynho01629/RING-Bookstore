import { Suspense, lazy, useLayoutEffect } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import Placeholder from "@ring/ui/Placeholder";
import CustomBreadcrumbs from "../components/custom/CustomBreadcrumbs";
import styled from "@emotion/styled";
import useCart from "../hooks/useCart";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";

const CartContent = lazy(() => import("../components/cart/CartContent"));

//#region styled
const EmptyWrapper = styled.div`
  height: 80dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  position: relative;
  min-height: 90dvh;
`;

const IconWrapper = styled.div`
  position: relative;
  margin-bottom: 25px;

  svg {
    font-size: 220px;
    color: ${({ theme }) => theme.vars.palette.primary.main};
    transform: rotate(-10deg);
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    transform: scale(0.7);
    margin-bottom: 0;
  }
`;

const Shape = styled.div`
  position: absolute;
  top: -45px;
  left: -65px;
  width: 310px;
  height: 310px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.vars.palette.action.hover};
  z-index: -1;

  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 15px;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 14px solid ${({ theme }) => theme.vars.palette.primary.main};
    background-color: ${({ theme }) => theme.vars.palette.background.default};
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 30px;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4px dashed ${({ theme }) => theme.vars.palette.action.disabled};
  }
`;
//#endregion

const Cart = () => {
  const { cartProducts } = useCart();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    if (cartProducts.length == 0) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cartProducts]);

  return (
    <Wrapper>
      <CustomBreadcrumbs separator="›" maxItems={4} aria-label="Breadcrumbs" className="transparent">
        <NavLink to={"/cart"}>{t("cart.label")}</NavLink>
      </CustomBreadcrumbs>
      {!cartProducts.length ? (
        <EmptyWrapper>
          <IconWrapper>
            <ShoppingCartOutlined />
            <Shape />
          </IconWrapper>
          <h2>{t("cart.empty.description")}</h2>
          <NavLink to={"/"}>
            <Button variant="contained" color="primary" startIcon={<ChevronLeft />}>
              {t("cart.continue")}
            </Button>
          </NavLink>
        </EmptyWrapper>
      ) : (
        <Suspense
          fallback={
            <EmptyWrapper>
              <Placeholder />
            </EmptyWrapper>
          }
        >
          <CartContent />
        </Suspense>
      )}
    </Wrapper>
  );
};

export default Cart;
