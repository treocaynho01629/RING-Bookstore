import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import { ReactComponent as MaintainanceIcon } from "@ring/shared/assets/maintainance";
import SimpleNavbar from "../components/navbar/SimpleNavbar";

//#region styled
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  background: ${({ theme }) => theme.vars.palette.background.default};
`;

const RandomShape = styled.span`
  position: fixed;
  top: 0;
  left: 0;
  height: 150dvh;
  width: 50%;
  opacity: 0.7;
  background: hsl(from ${({ theme }) => theme.vars.palette.warning.main} h s l / 0.4);
  z-index: -1;
  transform: translate(-60%, 0%) rotate(-25deg);

  &:after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    height: 120dvh;
    width: 100%;
    background: hsl(from ${({ theme }) => theme.vars.palette.warning.main} calc(h + 30) s l / 0.3);
    transform: translate(80%, -60%) rotate(-85deg);
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 200%;
    background: hsl(from ${({ theme }) => theme.vars.palette.warning.main} calc(h - 30) s l / 0.2);
    transform: rotate(130deg) translate(35%, -60%);
    z-index: -5;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    transform: translate(-75%, 5%) rotate(-25deg);
  }
`;

const Content = styled.div`
  font-size: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
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

const Description = styled.h4`
  font-size: 1.3em;
  font-weight: 400;
`;

const StyledMaintainanceIcon = styled(MaintainanceIcon)`
  height: 350px;
  fill: ${({ theme }) => theme.vars.palette.background.default};
  stroke: ${({ theme }) => theme.vars.palette.warning.main};
  stroke-width: 10px;
  overflow: visible;
  transform: translateY(-25%) scale(0.35);

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 280px;
    transform: translateY(-30%) scale(0.3);
  }
`;
//#endregion

const Maintainance = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <SimpleNavbar noLink />
      <RandomShape></RandomShape>
      <Content>
        <h2>{t("maintainance.title", { ns: "uncommon" })}</h2>
        <StyledMaintainanceIcon />
        <Description>{t("maintainance.description", { ns: "uncommon" })}</Description>
        <p>{t("maintainance.suggestion", { ns: "uncommon" })}</p>
      </Content>
    </Wrapper>
  );
};

export default Maintainance;
