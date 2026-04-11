import styled from "@emotion/styled";

export const ShopContainer = styled.div`
  padding: 20px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  display: flex;
  flex-wrap: wrap;

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 10px 12px;
  }
`;

export const ShopInfo = styled.div`
  display: flex;
  align-items: center;
  border-right: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  padding-right: 15px;

  ${({ theme }) => theme.breakpoints.down("md")} {
    border: none;
    padding-right: 0;
  }
`;

export const ShopName = styled.h3`
  margin: 0;
  white-space: nowrap;

  &.unverified {
    line-height: 3rem;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    font-size: 15px;
  }
`;

export const Verified = styled.p`
  font-size: 13px;
  margin: 0;
  display: flex;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;

export const ShopDetail = styled.span`
  flex-grow: 1;
  font-size: 14px;
  display: flex;
  align-items: center;
  width: 40%;

  svg {
    font-size: 15px;
    margin-right: 3px;
    color: ${({ theme }) => theme.vars.palette.warning.main};
  }

  b {
    margin-left: 10px;
    color: ${({ theme }) => theme.vars.palette.warning.main};
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    font-size: 12px;

    b {
      margin-left: 5px;
    }

    &.compact {
      width: auto;
      justify-content: center;
    }

    &.hide-on-mobile {
      display: none;
    }
  }
`;
