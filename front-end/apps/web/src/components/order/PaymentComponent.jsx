import styled from "@emotion/styled";
import { useState, useEffect, useRef, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { enqueueSnackbar } from "notistack";
import { Typography, useColorScheme, useMediaQuery } from "@mui/material";
import { useCancelUnpaidOrdersMutation, useCreatePaymentLinkMutation } from "../../features/orders/ordersApiSlice";
import { usePayOS } from "@payos/payos-checkout";
import { useNavigate } from "react-router";
import { useRefreshMutation } from "@ring/redux/authApiSlice";
import { MainContainer, ButtonsContainer } from "../custom/SimpleComponents";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import useLogout from "../../hooks/useLogout";
import Turnstile from "@ring/auth/Turnstile";
import PendingModal from "@ring/ui/PendingModal";
import CircularProgress from "@mui/material/CircularProgress";

//#region styled
const TurnstileWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledDialogContent = styled(DialogContent)`
  padding: ${({ theme }) => theme.spacing(2)} !important;
`;

const PaymentContainer = styled.div`
  height: 350px;
  width: 335px;
  overflow: hidden;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 100%;
    height: 480px;
  }
`;

const Logo = styled.img`
  height: 80px;
  padding: 4px;
`;
//#endregion

const PaymentComponent = ({ id }) => {
  const { t, i18n } = useTranslation();
  const { mode } = useColorScheme();
  const initRef = useRef(false);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState(null);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [create, { isLoading: creating }] = useCreatePaymentLinkMutation();
  const [refresh, { isLoading: refreshing }] = useRefreshMutation();
  const [cancel, { isLoading: canceling }] = useCancelUnpaidOrdersMutation();
  const [payOSConfig, setPayOSConfig] = useState({
    RETURN_URL: window.location.origin + "/payment?state=success",
    ELEMENT_ID: "payos-checkout-element",
    CHECKOUT_URL: null,
    embedded: true,
    onExit: (eventData) => {
      setOpen(false);
      navigate("/payment?state=cancel", { replace: true });
      enqueueSnackbar(t("message.error", { action: t("payment.processed") }), { variant: "error" });
    },
    onSuccess: (event) => {
      handlePaymentSuccess();
    },
    onCancel: (event) => {
      handlePaymentError();
    },
  });
  const { open: payOSOpen, exit: payOSExit } = usePayOS(payOSConfig);
  const signout = useLogout();

  /**
   * Verify refresh token
   */
  const verifyRefreshToken = async () => {
    if (pending || refreshing) return;

    try {
      await refresh().unwrap();
    } catch (error) {
      let errorMsg;
      // Log user out if fail to refresh
      if (error?.status === 500) {
        errorMsg = t("error.auth.validate");
      } else if (error?.status === 400 || error?.status === 403) {
        errorMsg = t("error.auth.expired");
      }
      await signout(errorMsg);
    }
  };

  /**
   * Handle get payment link
   */
  const handleGetPaymentLink = async () => {
    if (pending || creating) return;

    setPending(true);

    create({ token, source: "turnstile", id })
      .unwrap()
      .then((data) => {
        handleOpenPayOS(data?.checkoutUrl);
        initRef.current = true;
        if (!data?.checkoutUrl) navigate("/error", { replace: true });
      })
      .catch((err) => {
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setMessage(t("error.server.response"));
        } else if (err?.status === 404) {
          navigate("/error", { replace: true });
        } else {
          setMessage(err?.data?.message);
        }
        initRef.current = false;
      })
      .finally(() => {
        setPending(false);
      });
  };

  /**
   * Handle open PayOS dialog
   */
  const handleOpenPayOS = (url) => {
    setPayOSConfig((old) => ({ ...old, CHECKOUT_URL: url }));
    setOpen(true);
  };

  /**
   * Handle close PayOS dialog
   */
  const handleClosePayOS = () => {
    if (payOSConfig.CHECKOUT_URL != null && open) {
      setOpen(false);
      payOSExit();
    }
  };

  /**
   * Handle payment success
   */
  const handlePaymentSuccess = () => {
    setOpen(false);
    navigate("/payment?state=success", { replace: true });
    enqueueSnackbar(t("message.success", { action: t("payment.processed") }), { variant: "success" });
  };

  /**
   * Handle payment error
   */
  const handlePaymentError = () => {
    setOpen(false);
    navigate("/payment?state=error", { replace: true });
    enqueueSnackbar(t("message.error", { action: t("payment.processed") }), { variant: "error" });
  };

  /**
   * Handle cancel order
   */
  const handleCancelOrder = async () => {
    if (pending || canceling) return;

    setPending(true);

    cancel({ orderId: id, reason: "" })
      .unwrap()
      .then((data) => {
        enqueueSnackbar(t("message.success", { action: t("cancel.order", { ns: "authenticated" }) }), {
          variant: "success",
        });
        navigate("/profile/order", { replace: true });
      })
      .catch((err) => {
        enqueueSnackbar(t("message.error", { action: t("cancel.order", { ns: "authenticated" }) }), {
          variant: "error",
        });
        setErr(err);
        setMessage(t("order.reason.invalid", { ns: "authenticated" }));
      })
      .finally(() => {
        setPending(false);
      });
  };

  useEffect(() => {
    if (!id) return;
    verifyRefreshToken();
  }, [id]);

  useEffect(() => {
    if (!token || initRef.current) return;
    handleGetPaymentLink();
  }, [token]);

  useEffect(() => {
    if (open && payOSConfig.CHECKOUT_URL != null) payOSOpen();
  }, [open, payOSConfig.CHECKOUT_URL]);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  return (
    <>
      {refreshing && (
        <Suspense fallback={null}>
          <PendingModal open={refreshing} message={t("pending")} />
        </Suspense>
      )}
      <MainContainer>
        {creating ? <CircularProgress color="primary" size={90} thickness={3} /> : <Logo src="/logo.svg" alt="logo" />}
        {!refreshing && (
          <Typography variant="body1" color={err ? "error" : "text.primary"}>
            {message ? message : t("payment.pending", { ns: "authenticated" })}
          </Typography>
        )}
      </MainContainer>
      <ButtonsContainer className={payOSConfig.CHECKOUT_URL ? "active" : ""}>
        <Button size="large" variant="outlined" color="primary" onClick={() => setOpen(true)}>
          {t("continue")}
        </Button>
        <Button size="large" variant="outlined" color="error" onClick={handleCancelOrder}>
          {t("order.cancel.label", { ns: "authenticated" })}
        </Button>
      </ButtonsContainer>
      <TurnstileWrapper>
        <Turnstile
          siteKey={turnstileSiteKey}
          onSuccess={(token) => {
            setToken(token);
          }}
          onExpire={() => {
            setToken("");
          }}
          action="payment"
          size="flexible"
          theme={resolvedMode}
          lang={i18n.language}
        />
      </TurnstileWrapper>
      <Dialog open={open} onClose={handleClosePayOS} keepMounted>
        <StyledDialogContent>
          <PaymentContainer id="payos-checkout-element"></PaymentContainer>
        </StyledDialogContent>
      </Dialog>
    </>
  );
};

export default PaymentComponent;
