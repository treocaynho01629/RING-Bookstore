import { styled } from "@mui/material/styles";
import { LinearProgress } from "@mui/material";

export const ItemTitle = styled("p")`
  font-size: 12px;
  margin: 5px 0;
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

  &.secondary {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

export const HeaderContainer = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  ${({ theme }) => theme.breakpoints.down("sm_md")} {
    padding: 0 ${({ theme }) => theme.spacing(1)};
  }
`;

export const FooterContainer = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ theme }) => theme.breakpoints.down("md")} {
    flex-direction: column-reverse;
    align-items: flex-end;
  }
`;

export const FooterLabel = styled("p")`
  font-size: 14px;
  margin: 0;
`;

export const StyledStockBar = styled(LinearProgress)`
  height: 6px;
  width: 60px;
`;

export const Title = styled("span")`
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 400;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(1.5)} 0;
`;

export const Label = styled("p")`
  font-weight: 450;

  span {
    font-weight: 350;
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

export const ButtonContainer = styled("div")`
  display: flex;
  align-items: flex-start;
  white-space: nowrap;
`;

export const LinkButton = styled("span")`
  color: ${({ theme }) => theme.palette.info.main};
  font-size: 14px;
`;

export const InfoTable = styled("table")`
  td {
    width: 50%;
  }
`;
