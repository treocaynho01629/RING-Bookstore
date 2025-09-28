import { useCallback, useLayoutEffect } from "react";
import { useLocation } from "react-router";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import styled from "@emotion/styled";

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

const StyledButton = styled.button`
  border-radius: 0;
  border: none;
  outline: none;
  width: 48px;
  height: 48px;
  color: ${({ theme }) => theme.vars.palette.primary.contrastText};
  background-color: ${({ theme }) => theme.vars.palette.primary.main};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.vars.palette.grey[300]};
    color: ${({ theme }) => theme.vars.palette.text.primary};
  }

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

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Automatically scrolls to top whenever pathname changes
  useLayoutEffect(() => {
    scrollToTop();
  }, [pathname]);

  return (
    <ButtonContainer
      role="presentation"
      className={trigger ? "" : "hidden"}
      id="scroll-to-top"
    >
      <StyledButton onClick={scrollToTop} aria-label="scroll back to top">
        <KeyboardArrowUp sx={{ fontSize: 30 }} />
      </StyledButton>
    </ButtonContainer>
  );
};

export default ScrollToTop;
