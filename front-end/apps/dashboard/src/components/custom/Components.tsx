import { styled } from "@mui/material/styles";
import { LinearProgress } from "@mui/material";

export const DrawerContainer = styled("div")`
  max-height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 400px;
`;

export const FilterText = styled("span")`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  display: block;
`;

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

export const TitleContainer = styled("div")`
  display: flex;
  align-items: center;
  width: 100%;

  svg {
    margin-right: ${({ theme }) => theme.spacing(1)};
  }
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

export const SectionTitle = styled("div")`
  font-size: 16px;
  font-weight: 550;
  line-height: 1.9rem;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  border-bottom: 0.5px solid ${({ theme }) => theme.palette.primary.main};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SectionCard = styled("div")`
  padding: ${({ theme }) => theme.spacing(2.5)};
  height: 100%;
  border: 0.5px solid ${({ theme }) => theme.vars?.palette?.divider};
  background-color: ${({ theme }) => theme.vars?.palette?.background?.paper};

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 0 12px;
  }
`;
