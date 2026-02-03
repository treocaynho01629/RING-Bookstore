import styled from "@emotion/styled";
import { Button, Checkbox } from "@mui/material";

export const CheckoutContainer = styled.div`
  position: relative;
  height: 100%;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    position: fixed;
    bottom: 0;
    left: 0;
    max-height: 100px;
    width: 100%;
    z-index: ${({ theme }) => theme.zIndex.appBar};
    border-top: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
    box-shadow: ${({ theme }) => theme.shadows[12]};
    background-color: ${({ theme }) => theme.vars.palette.background.paper};
  }
`;

export const CheckoutBox = styled.div`
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};
  padding: ${({ theme }) => theme.spacing(2.5, 2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  &.sticky {
    margin-bottom: -0.5px;
    position: sticky;
    top: ${({ theme }) => theme.mixins.toolbar.minHeight + 15}px;
    bottom: ${({ theme }) => theme.spacing(2)};
    z-index: 1;
  }

  &.drawer {
    border: none;
    border-top: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
    padding: ${({ theme }) => theme.spacing(2.5, 16)};

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
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    &.drawer {
      padding: ${({ theme }) => theme.spacing(2.5, 2)};
    }
  }

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    margin: 0;

    &:not(.drawer) {
      padding-top: ${({ theme }) => theme.spacing(1)};
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm_md")} {
    border-left: none;
    border-right: none;
  }
`;

export const CheckoutStack = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:first-of-type {
    border-bottom: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
    margin-bottom: ${({ theme }) => theme.spacing(1)};
    padding-bottom: ${({ theme }) => theme.spacing(1)};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 100%;
    height: 50px;

    &:first-of-type {
      margin-bottom: 0;
      padding: 0 5px;
    }
  }
`;

export const CheckoutPriceContainer = styled.div`
  position: relative;
  width: 100%;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

export const AltCheckoutBox = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 5px 7px;
  white-space: nowrap;
`;

export const CheckoutTitle = styled.span`
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.vars.palette.text.secondary};
    font-style: italic;
    text-transform: none;
  }
`;

export const CheckoutRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing(0.5)} 0;
`;

export const CheckoutText = styled.span`
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.text.primary};
`;

export const PriceContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: end;

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    &.row {
      flex-direction: row;
      align-items: center;
    }
  }
`;

export const CheckoutPrice = styled.span`
  font-size: 18px;
  width: 100%;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.vars.palette.error.main};
  cursor: pointer;

  b {
    font-size: 14px;
    color: ${({ theme }) => theme.vars.palette.text.primary};
  }

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    font-size: 16px;
  }
`;

export const SavePrice = styled.span`
  font-size: 14px;
  font-weight: 450;
  width: 100%;
  text-align: right;
  color: ${({ theme }) => theme.vars.palette.success.dark};
`;

export const SubText = styled.span`
  font-size: 12px;
  width: 100%;
  text-align: right;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;

export const DetailContainer = styled.div`
  padding: 10px 0;
  margin-bottom: 10px;
  border-bottom: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
`;

export const CouponButton = styled.b`
  font-size: 15px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;

  span {
    display: flex;
    align-items: center;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
    margin: 0;
    width: 100%;
  }
`;

export const MiniCouponContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const CheckoutButton = styled(Button)`
  height: 100%;
  line-height: 1.5;
`;

export const StyledCheckbox = styled(Checkbox)`
  margin-left: 8px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-left: 0;
  }
`;
