import styled from "@emotion/styled";
import Button from "@mui/material/Button";

export const AuthTitle = styled.h1`
  font-size: 30px;
  font-weight: 400;

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

export const AuthText = styled.p`
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

export const AuthHighlight = styled.span`
  text-decoration: underline;
  color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.primary.main};
  cursor: pointer;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme, color }) => theme.vars.palette[color]?.dark || theme.vars.palette.primary.dark};
    }
  }
`;

export const AuthActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ConfirmButton = styled(Button)`
  height: 44px;
  font-size: 16px;
`;
