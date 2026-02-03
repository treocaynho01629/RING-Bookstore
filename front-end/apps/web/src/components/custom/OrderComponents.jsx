import styled from "@emotion/styled";
import { Skeleton, Typography } from "@mui/material";
import { LazyLoadImage } from "react-lazy-load-image-component";

export const ItemTitle = styled.p`
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

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme }) => theme.vars.palette.info.main};
    }
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

export const Shop = styled.b`
  font-size: 15px;
  white-space: nowrap;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
    margin: ${({ theme }) => theme.spacing(0.5)} 0;
  }
`;

export const ShopTag = styled.span`
  background-color: ${({ theme }) => theme.vars.palette.primary.main};
  color: ${({ theme }) => theme.vars.palette.primary.contrastText};
  padding: 2px 10px;
  margin-right: 8px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;
    padding: 2px 8px;
  }
`;

export const DetailText = styled.p`
  margin: 0;
  font-weight: 350;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-decoration: underline;
  color: ${({ theme }) => theme.vars.palette.primary.dark};
`;

export const ContentContainer = styled.div`
  margin-left: 10px;
  width: 100%;
`;

export const HeadContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)};
  border-bottom: 0.5px solid;
  border-color: ${({ theme }) => theme.vars.palette.action.focus};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(1)};
  }
`;

export const BodyContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  padding: ${({ theme }) => theme.spacing(2)};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(1)};
  }

  &.disabled {
    opacity: 0.7;
    filter: grayscale(0.5);
  }
`;

export const StyledLazyImage = styled(LazyLoadImage)`
  display: inline-block;
  height: 90px;
  width: 90px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 80px;
    width: 80px;
  }
`;

export const StyledSkeleton = styled(Skeleton)`
  display: inline-block;
  height: 90px;
  width: 90px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 80px;
    width: 80px;
  }
`;

export const ToggleArrow = styled.span`
  color: white;
  margin-left: ${({ theme }) => theme.spacing(1)};
  display: none;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: flex;
  }
`;

export const OrderItemContainer = styled.div`
  border: 0.5px solid;
  border-color: ${({ theme }) => theme.vars.palette.action.focus};
  margin-bottom: ${({ theme }) => theme.spacing(2)};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-bottom: 0;
  }
`;

export const StuffContainer = styled.div`
  display: flex;
  justify-content: space-between;

  ${({ theme }) => theme.breakpoints.down("md")} {
    align-items: flex-end;
  }
`;

export const BotContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing(2)};
  border-top: 0.5px solid;
  border-color: ${({ theme }) => theme.vars.palette.action.focus};

  &.alt {
    border: 0;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(1)};
    font-size: 14px;
    align-items: flex-start;
  }
`;

export const FinalPriceContainer = styled.div`
  width: 100%;
  max-width: 400px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    max-width: 100%;
  }
`;

export const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing(0.75)} 0;

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: ${({ theme }) => theme.spacing(0.5)} 0;
  }
`;

export const PriceText = styled.span`
  font-size: 16px;
  font-weight: 450;
  white-space: nowrap;
  color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.text.primary};

  &.secondary {
    font-weight: 400;
    color: ${({ theme }) => theme.vars.palette.text.secondary};
  }

  &.discount {
    color: ${({ theme }) => theme.vars.palette.success.dark};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
  }
`;

export const FinalPrice = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.vars.palette.error.main};
  display: flex;
  align-items: center;
  cursor: pointer;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 16px;
  }
`;

export const PriceContainer = styled.div`
  ${({ theme }) => theme.breakpoints.down("md")} {
    display: flex;
  }
`;

export const Price = styled.p`
  font-size: 15px;
  font-weight: 450;
  text-align: left;
  color: ${({ theme }) => theme.vars.palette.primary.main};
  margin: 0;

  &.total {
    color: ${({ theme }) => theme.vars.palette.warning.light};
  }
`;

export const Discount = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.vars.palette.text.disabled};
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  text-decoration: line-through;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-left: ${({ theme }) => theme.spacing(1)};
  }
`;

export const Amount = styled.span`
  font-size: 14px;
  font-weight: 350;
  color: ${({ theme }) => theme.vars.palette.text.secondary};

  b {
    color: ${({ theme }) => theme.vars.palette.warning.main};
  }

  &.mobile {
    display: none;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;

    &.mobile {
      display: block;
    }
  }
`;

export const StatusTag = styled(Typography)`
  text-transform: uppercase;
  font-weight: 450;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
  }
`;

export const StatusContent = styled.div`
  background-color: ${({ theme, color }) =>
    `color-mix(in srgb, ${theme.vars.palette[color]?.light || theme.vars.palette.primary.light}, 
      transparent 70%)`};
  color: ${({ theme, color }) => theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main};
  border: 0.5px solid;
  border-color: currentColor;
  padding: ${({ theme }) => theme.spacing(1, 2)};
  font-weight: 500;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  p {
    text-transform: none;
    font-size: 14px;
    margin: ${({ theme }) => theme.spacing(1)} 0 0;
    filter: brightness(0.9);
  }
`;
