import styled from "@emotion/styled";
import { keyframes } from "@mui/material";
import { Link, useSearchParams, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { SimpleTitle, ConfirmButton, ButtonsContainer, MainContainer } from "../components/custom/SimpleComponents";
import HighlightOff from "@mui/icons-material/HighlightOff";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import TaskAlt from "@mui/icons-material/TaskAlt";
import PaymentComponent from "../components/order/PaymentComponent";

//#region styled
const rotate = keyframes`
    from { transform: rotate(0deg) translateZ(0); }
    to { transform: rotate(-360deg) translateZ(0); }
`;

const flowIn = keyframes`
    from { transform: rotate(-240deg) translateZ(0); }
    to { transform: rotate(-360deg) translateZ(0); }
`;

const pop = keyframes`
  0% { transform: scale(0) rotate(-5deg) translateZ(0); }
  40% { transform: scale(1.1) rotate(5deg) translateZ(0); }
  100% { transform: scale(1) rotate(0deg) translateZ(0); }
`;

const Wrapper = styled.div`
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
  width: 100%;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-top: -${({ theme }) => theme.spacing(8)};
  }
`;

const ContentContainer = styled.div`
  position: relative;
  width: 90%;
  max-width: 650px;
`;

const CardContent = styled.div`
  background: ${({ theme }) => theme.vars.palette.background.paper};
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4)};
  animation: ${pop} 0.5s ease-in-out;

  svg {
    font-size: 120px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    svg {
      font-size: 100px;
    }
  }
`;

const Wave = styled.span`
  position: absolute;
  height: 100vw;
  width: 100vw;
  border-radius: 43%;
  left: 0;
  top: 14%;
  background: hsl(from currentColor calc(h - 30) s l / 0.2);
  animation: ${rotate} 32s infinite steps(480, end);
  transition: all 0.2s ease;

  &:nth-of-type(2) {
    background: hsl(from currentColor calc(h + 30) s l / 0.3);
    animation-delay: -8s;
    animation-duration: 24s;
    animation-timing-function: steps(330, end);
  }

  &:nth-of-type(3) {
    background: hsl(from currentColor h s l / 0.4);
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
  transform-origin: bottom;
  transform: scale(1.8);
  color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.primary.main};
`;

const Background = styled.div`
  position: fixed;
  width: 100%;
  height: 25%;
  bottom: -20%;
  left: 0;
  z-index: -1;
  transform-origin: 50vw 100vw;
  animation: ${flowIn} 1s ${({ theme }) => theme.transitions.easing.easOut};

  ${({ theme }) => theme.breakpoints.down("md")} {
    transform-origin: 50vw -60vw;
    left: auto;
    top: -7.5%;
  }
`;
//#endregion

function Payment() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const state = searchParams.get("state");

  return (
    <Wrapper>
      <Container>
        <ContentContainer>
          {state ? (
            <CardContent>
              <SimpleTitle>
                {state === "success"
                  ? t("message.success", { action: t("payment.processed", { ns: "authenticated" }) })
                  : t("message.error", { action: t("payment.processed", { ns: "authenticated" }) })}
              </SimpleTitle>
              <MainContainer key={state}>
                <IconContainer>
                  {state === "success" ? <TaskAlt color="success" /> : <HighlightOff color="error" />}
                </IconContainer>
              </MainContainer>
              <ButtonsContainer className={state ? "active" : ""}>
                <ConfirmButton
                  component={Link}
                  to={id ? `/profile/order/checkout/${id}` : "/profile/order"}
                  variant="outlined"
                  color="info"
                  size="large"
                >
                  {t("order.view", { ns: "authenticated" })}
                </ConfirmButton>
                <ConfirmButton component={Link} to={"/store"} variant="outlined" color="primary" size="large">
                  {t("cart.continue")}
                </ConfirmButton>
              </ButtonsContainer>
            </CardContent>
          ) : (
            <>
              <SimpleTitle>
                <Link to={id ? `/profile/order/checkout/${id}` : -1}>
                  <KeyboardArrowLeft fontSize="large" />
                </Link>
                {t("cart.payment")}
              </SimpleTitle>
              <PaymentComponent id={id} />
            </>
          )}
        </ContentContainer>
      </Container>
      <Background>
        <WaveContainer color={state ? (state === "success" ? "success" : "error") : "warning"}>
          <Wave></Wave>
          <Wave></Wave>
          <Wave></Wave>
        </WaveContainer>
      </Background>
    </Wrapper>
  );
}

export default Payment;
