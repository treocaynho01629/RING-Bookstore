import styled from "@emotion/styled";
import Button from "@mui/material/Button";

export const SimpleTitle = styled.h1`
  font-size: 30px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  a {
    display: flex;
    align-items: center;
  }

  :not(.full) {
    margin-bottom: 0px;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    text-align: center;
  }
`;

export const TermText = styled.p`
  font-size: 12px;
  margin: 0;
  padding: ${({ theme }) => theme.spacing(0.75)} 0;
  text-align: center;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;

export const SimpleText = styled.p`
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

export const SimpleHighlight = styled.span`
  text-decoration: underline;
  color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.primary.main};
  cursor: pointer;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme, color }) => theme.vars.palette[color]?.dark || theme.vars.palette.primary.dark};
    }
  }
`;

export const SimpleActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ConfirmButton = styled(Button)`
  height: 44px;
  font-size: 16px;
`;

export const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 100%;
  min-height: 300px;
  width: 100%;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  visibility: hidden;
  margin-top: ${({ theme }) => theme.spacing(-2)};
  gap: ${({ theme }) => theme.spacing(2)};

  &.active {
    visibility: visible;
  }
`;
