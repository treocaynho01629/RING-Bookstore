import { useCallback, useLayoutEffect } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import styled from "@emotion/styled";
import Button from "@mui/material/Button";

//#region styled
const ButtonContainer = styled.div`
  --offset: 0;

  position: fixed;
  bottom: calc(var(--offset) * 1px);
  right: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  transition:
    ${({ theme }) =>
      theme.transitions.create(["transform"], {
        duration: theme.transitions.duration.shortest,
        easing: theme.transitions.easing.easeInOut,
      })},
    bottom 0.3s ease;
  z-index: 10;

  &.hidden {
    transform: scale(0);
  }

  ${({ theme }) => theme.breakpoints.down("sm_md")} {
    padding-bottom: ${({ theme }) => theme.spacing(2)};
    right: ${({ theme }) => theme.spacing(2)};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding-bottom: ${({ theme }) => theme.spacing(1.5)};
    right: ${({ theme }) => theme.spacing(1.5)};
  }
`;

const StyledButton = styled(Button)`
  width: 48px;
  height: 48px;
  min-width: 35px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 35px;
    height: 35px;
    opacity: 0.9;
  }
`;
//#endregion

const ScrollToTop = () => {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 100 });
  const { pathname } = useLocation(); // Extracts pathname
  const { t } = useTranslation();

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Automatically scrolls to top whenever pathname changes
  useLayoutEffect(() => {
    scrollToTop();
  }, [pathname]);

  return (
    <ButtonContainer role="presentation" className={`mui-fixed ${trigger ? "" : "hidden"}`} id="scroll-to-top">
      <StyledButton variant="contained" color="primary" tabIndex={-1} onClick={scrollToTop} aria-label={t("scroll")}>
        <KeyboardArrowUp fontSize="medium" />
      </StyledButton>
    </ButtonContainer>
  );
};

export default ScrollToTop;
