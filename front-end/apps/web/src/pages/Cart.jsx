import { Suspense, lazy, useLayoutEffect } from "react";
import { NavLink } from "react-router";
import { ReactComponent as EmptyIcon } from "@ring/shared/assets/empty";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import Placeholder from "@ring/ui/Placeholder";
import CustomBreadcrumbs from "../components/custom/CustomBreadcrumbs";
import styled from "@emotion/styled";
import useCart from "../hooks/useCart";

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

const StyledEmptyIcon = styled(EmptyIcon)`
  height: 250px;
  width: 250px;
  fill: ${({ theme }) => theme.vars.palette.text.icon};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 200px;
    height: 200px;
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
          <StyledEmptyIcon />
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
