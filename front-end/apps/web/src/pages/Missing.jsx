import styled from "@emotion/styled";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import HelpOutline from "@mui/icons-material/HelpOutline";
import Button from "@mui/material/Button";

//#region styled
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100dvh;
`;

const RandomShape = styled.span`
  position: fixed;
  top: 0;
  right: 0;
  height: 150dvh;
  width: 50%;
  opacity: 0.7;
  background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} h s l / 0.4);
  z-index: -1;
  transform: translate(60%, 0%) rotate(25deg);

  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 120dvh;
    width: 100%;
    background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} calc(h + 30) s l / 0.3);
    transform: translate(-80%, -60%) rotate(85deg);
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 200%;
    background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} calc(h - 30) s l / 0.2);
    transform: rotate(-130deg) translate(-35%, -60%);
    z-index: -5;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    transform: translate(75%, 5%) rotate(25deg);
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
    3px 3px 0 ${({ theme }) => theme.vars.palette.error.main},
    -3px 3px 0 ${({ theme }) => theme.vars.palette.error.main},
    -3px -3px 0 ${({ theme }) => theme.vars.palette.error.main},
    3px -3px 0 ${({ theme }) => theme.vars.palette.error.main};
  border-bottom: 0.02em solid ${({ theme }) => theme.vars.palette.primary.main};

  svg {
    font-size: 0.9em;

    path {
      fill: none;
      stroke: ${({ theme }) => theme.vars.palette.error.main};
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

const Missing = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <RandomShape></RandomShape>
      <Content>
        <h2>{t("missing.title", { ns: "uncommon" })}</h2>
        <ErrorContainer>
          <ErrorCode>
            4<HelpOutline />4
          </ErrorCode>
        </ErrorContainer>
        <h3>{t("missing.description", { ns: "uncommon" })}</h3>
        <p>{t("missing.suggestion", { ns: "uncommon" })}</p>
        <Link to="/">
          <Button sx={{ marginTop: 2 }} variant="outlined" color="primary">
            {t("missing.back", { ns: "uncommon" })}
          </Button>
        </Link>
      </Content>
    </Wrapper>
  );
};

export default Missing;
