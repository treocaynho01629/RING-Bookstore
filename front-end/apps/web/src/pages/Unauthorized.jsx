import styled from "@emotion/styled";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Block from "@mui/icons-material/Block";
import SimpleNavbar from "../components/navbar/SimpleNavbar";

//#region styled
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100dvh;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    mask-image: linear-gradient(200deg, transparent, transparent 75%, #000000);
    background:
      radial-gradient(circle, transparent 25%, ${({ theme }) => theme.vars.palette.background.default} 26%),
      linear-gradient(
        45deg,
        transparent 46%,
        ${({ theme }) => theme.vars.palette.primary.light} 47%,
        ${({ theme }) => theme.vars.palette.primary.light} 52%,
        transparent 53%
      ),
      linear-gradient(
        135deg,
        transparent 46%,
        ${({ theme }) => theme.vars.palette.primary.light} 47%,
        ${({ theme }) => theme.vars.palette.primary.light} 52%,
        transparent 53%
      );
    background-size: 4em 4em;
    background-color: ${({ theme }) => theme.vars.palette.background.default};
    opacity: 0.3;
  }
`;

const Content = styled.div`
  font-size: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)};

  h2 {
    font-size: 2.25em;
    margin: 0;
  }

  h3 {
    font-size: 1.5em;
    font-weight: 400;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.vars.palette.text.secondary};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;

    p {
      font-size: 1.25em;
      text-align: center;
    }
  }
`;

const ErrorCode = styled.h1`
  display: flex;
  align-items: center;
  font-size: 13em;
  color: ${({ theme }) => theme.vars.palette.background.default};
  margin: 0;
  text-shadow:
    3px 3px 0 ${({ theme }) => theme.vars.palette.warning.main},
    -3px 3px 0 ${({ theme }) => theme.vars.palette.warning.main},
    -3px -3px 0 ${({ theme }) => theme.vars.palette.warning.main},
    3px -3px 0 ${({ theme }) => theme.vars.palette.warning.main};
  border-bottom: 0.02em solid ${({ theme }) => theme.vars.palette.primary.main};

  svg {
    font-size: 0.9em;

    path {
      fill: none;
      stroke: ${({ theme }) => theme.vars.palette.warning.main};
      stroke-width: 0.4px;
      stroke-linejoin: round;
    }
  }
`;

const ErrorContainer = styled("div")(({ theme }) => ({
  mixBlendMode: "darken",
  ...theme.applyStyles("dark", {
    mixBlendMode: "lighten",
  }),
}));
//#endregion

const Unauthorized = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <SimpleNavbar />
      <Content>
        <h2>{t("unauthorized.title", { ns: "uncommon" })}</h2>
        <ErrorContainer>
          <ErrorCode>
            4<Block />1
          </ErrorCode>
        </ErrorContainer>
        <h3>{t("unauthorized.description", { ns: "uncommon" })}</h3>
        <p>{t("unauthorized.suggestion", { ns: "uncommon" })}</p>
        <Link to={"/auth/login"}>
          <Button sx={{ marginTop: 2 }} variant="outlined" color="primary">
            {t("unauthorized.login", { ns: "uncommon" })}
          </Button>
        </Link>
      </Content>
    </Wrapper>
  );
};

export default Unauthorized;
