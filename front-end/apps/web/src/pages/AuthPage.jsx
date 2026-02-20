import styled from "@emotion/styled";
import { useState, lazy, Suspense } from "react";
import { useParams } from "react-router";
import { keyframes } from "@emotion/react";
import { Grow } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { useTranslation } from "react-i18next";

const PendingModal = lazy(() => import("@ring/ui/PendingModal"));
const RegisterTab = lazy(() => import("../components/authorize/RegisterTab"));
const LoginTab = lazy(() => import("../components/authorize/LoginTab"));

//#region styled
const rotate = keyframes`
    from { transform: rotate(0deg) translateZ(0); }
    to { transform: rotate(360deg) translateZ(0); }
`;

const flowIn = keyframes`
    from { transform: rotate(240deg) translateZ(0); }
    to { transform: rotate(360deg) translateZ(0); }
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  height: 100dvh;

  ${({ theme }) => theme.breakpoints.down("md")} {
    flex-direction: column-reverse;
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 70%;

  ${({ theme }) => theme.breakpoints.down("md")} {
    width: 100%;
    margin-top: -${({ theme }) => theme.spacing(8)};
  }
`;

const ContentContainer = styled.div`
  position: relative;
  width: 90%;
  max-width: 350px;
`;

const Wave = styled.span`
  position: absolute;
  height: 100vh;
  width: 100vh;
  border-radius: 43%;
  top: 0;
  left: 14%;
  background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} calc(h - 30) s l / 0.2);
  animation: ${rotate} 32s infinite steps(480, end);
  transition: all 0.2s ease;

  &:nth-of-type(2) {
    background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} calc(h + 30) s l / 0.3);
    left: 7%;
    animation-delay: -8s;
    animation-duration: 24s;
    animation-timing-function: steps(330, end);
  }

  &:nth-of-type(3) {
    background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} h s l / 0.4);
    left: 0;
    animation-delay: -3s;
    animation-duration: 28s;
    animation-timing-function: steps(420, end);
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    height: 100vw;
    width: 100vw;
    top: auto;
    left: 0;
    bottom: 0;
  }
`;

const WaveContainer = styled.section`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scale(1.2);
  transform-origin: left;

  ${({ theme }) => theme.breakpoints.down("md")} {
    transform: scale(1.8);
    transform-origin: bottom;
  }
`;

const Background = styled.div`
  position: fixed;
  height: 100%;
  width: 35%;
  right: 0;
  z-index: -1;
  transform-origin: 70vh 50vh;
  animation: ${flowIn} 1s ${({ theme }) => theme.transitions.easing.easOut};

  ${({ theme }) => theme.breakpoints.down("md")} {
    width: 100%;
    height: 25%;
    transform-origin: 50vw -60vw;
    right: auto;
    top: -7.5%;
  }
`;
//#endregion

function AuthPage() {
  const { tab } = useParams();
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);

  return (
    <Wrapper>
      {pending && (
        <Suspense fallBack={null}>
          <PendingModal open={pending} message={t("pending")} />
        </Suspense>
      )}
      <Container>
        <TransitionGroup component={null}>
          <Suspense fallback={null}>
            {tab == "register" ? (
              <Grow key={"register"} in={tab == "register"}>
                <ContentContainer>
                  <RegisterTab
                    {...{
                      pending,
                      setPending,
                    }}
                  />
                </ContentContainer>
              </Grow>
            ) : (
              <Grow key={"login"} in={tab == "login"}>
                <ContentContainer>
                  <LoginTab
                    {...{
                      pending,
                      setPending,
                    }}
                  />
                </ContentContainer>
              </Grow>
            )}
          </Suspense>
        </TransitionGroup>
      </Container>
      <Background>
        <WaveContainer>
          <Wave></Wave>
          <Wave></Wave>
          <Wave></Wave>
        </WaveContainer>
      </Background>
    </Wrapper>
  );
}

export default AuthPage;
