import styled from "@emotion/styled";
import { Suspense, lazy, useState, forwardRef } from "react";
import { StyledDialogTitle } from "../custom/ProfileComponents";
import { getPaymentStatus } from "@ring/shared/enums/payment";
import { PaymentStatus } from "@ring/shared/models/paymentStatus";
import { PaymentType } from "@ring/shared/models/paymentType";
import { idFormatter, timeFormatter, dateFormatter } from "@ring/shared/utils/convert";
import { Link } from "react-router";
import { MobileExtendButton } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import { StatusContent } from "../custom/OrderComponents";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Paper from "@mui/material/Paper";
import CloseIcon from "@mui/icons-material/Close";
import InboxIcon from "@mui/icons-material/Inbox";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SellIcon from "@mui/icons-material/Sell";
import CurrencyExchange from "@mui/icons-material/CurrencyExchange";
import OrderReceiptDetails from "./OrderReceiptDetails";
import Slide from "@mui/material/Slide";

const CancelAndUpdateOrderForm = lazy(() => import("./CancelAndUpdateOrderForm"));

//#region styled
const TitleContainer = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
`;

const SubTitle = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.vars.palette.text.secondary};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;

const SubText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  margin: ${({ theme }) => theme.spacing(1)} 0;
`;

const SummaryContainer = styled.div`
  border-top: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
  border-bottom: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
  padding: ${({ theme }) => theme.spacing(2)} 0;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;
  }
`;

const Title = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing(1)};
  font-size: 16px;
  font-weight: 450;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-left: ${({ theme }) => theme.spacing(1)};
  }
`;

const Name = styled.p`
  font-size: 17px;
  font-weight: 450;
  margin: 0 0 ${({ theme }) => theme.spacing(1)};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 15px;
  }
`;

const ShippingTag = styled.span`
  display: flex;
  align-items: center;
  font-weight: 450;
  color: ${({ theme, color }) => theme.vars.palette[color]?.dark || theme.vars.palette.primary.dark};
`;

const StuffContainer = styled.div`
  display: flex;
  justify-content: space-between;

  ${({ theme }) => theme.breakpoints.down("md")} {
    align-items: flex-end;
  }
`;

const ContentWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing(2)} 0;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(1)} 0;
  }
`;

const InfoContainer = styled.div`
  height: 100%;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  padding: ${({ theme }) => theme.spacing(2)};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(1)};
  }
`;

const InfoText = styled.span`
  font-size: 16px;
  line-height: 1.75em;
  display: flex;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.vars.palette.text.secondary};

  &.price {
    margin: 0;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;

    &.price {
      display: none;
    }
  }
`;

const StatusTag = styled(Typography)`
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 450;
  border-radius: 20px;
  border: 0.5px solid currentColor;
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1)}`};

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    display: none;
  }
`;

const MainButton = styled(Button)`
  min-width: 200px;

  ${({ theme }) => theme.breakpoints.down("md")} {
    height: 100%;
  }
`;

const ButtonContainer = styled.div`
  padding: 0 ${({ theme }) => theme.spacing(1)};
  margin: ${({ theme }) => `${theme.spacing(1)} 0 ${theme.spacing(2)}`};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  display: none;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: block;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-bottom: ${({ theme }) => theme.spacing(5)};
  }
`;

const MobileButton = styled.div`
  position: relative;
  padding: ${({ theme }) => theme.spacing(1)} 0;

  span {
    font-size: 16px;
    display: flex;
    align-items: center;
  }

  ${({ theme }) => theme.breakpoints.up("md")} {
    display: none;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: 15px;
  }
`;

const MainButtonContainer = styled.div`
  position: sticky;
  bottom: ${({ theme }) => `calc(${theme.spacing(-2.5)} - 1px)`};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};
  padding: ${({ theme }) => `${theme.spacing(2.5)} ${theme.spacing(2)}`};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  display: flex;
  width: 100%;
  z-index: 2;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    position: fixed;
    bottom: 0;
    left: 0;
    height: 50px;
    margin: 0;
    padding: 0;
    border: none;
    box-shadow: ${({ theme }) => theme.shadows[12]};
    align-items: flex-end;
  }
`;

const StatusText = styled.div`
  padding: ${({ theme }) => theme.spacing(1)} 0;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 0;
  }
`;
//#endregion

function getStepContent(receipt) {
  const date = new Date(receipt?.date);
  const expiredDate = receipt?.expiredAt ? new Date(receipt?.expiredAt) : null;

  switch (receipt?.paymentStatus) {
    case PaymentStatus.PENDING:
      return {
        summary: "checkout.pending.label",
        date: expiredDate,
      };
    case PaymentStatus.PAID:
      return {
        summary: "checkout.paid",
        date: date,
      };
    case PaymentStatus.PENDING_REFUND:
      return {
        summary: "checkout.pending.refund",
      };
    case PaymentStatus.REFUNDED:
      return {
        summary: "checkout.refunded",
        date: date,
      };
    case PaymentStatus.CANCELED:
      return {
        summary: "checkout.canceled",
        date: date,
      };
  }
}

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const CheckoutDetailComponent = ({ receipt, pending, setPending, tabletMode, mobileMode }) => {
  const { t, i18n } = useTranslation();
  const [openCancel, setOpenCancel] = useState(undefined);
  const [openUpdate, setOpenUpdate] = useState(undefined);
  const open = Boolean(openCancel || openUpdate);
  const paymentMeta = getPaymentStatus(receipt?.paymentStatus);
  const stepContent = getStepContent(receipt);

  /**
   * Cancel order
   */
  const handleCancelOrder = () => {
    setOpenCancel(true);
  };

  /**
   * Update payment
   */
  const handleUpdatePayment = () => {
    setOpenUpdate(true);
  };

  /**
   * Close dialog
   */
  const handleClose = () => {
    setOpenCancel(false);
    setOpenUpdate(false);
  };

  const date = new Date(receipt?.date);

  return (
    <>
      <StyledDialogTitle>
        <TitleContainer>
          <Link to={-1}>
            <KeyboardArrowLeftIcon />
          </Link>
          <ReceiptIcon />
          &nbsp;{t("order.id", { ns: "authenticated" })}&nbsp;
          {!receipt ? <Skeleton variant="text" width={100} /> : idFormatter(receipt?.id)}
          &emsp;
          {!receipt ? (
            <StatusTag color="secondary">{t("loading")}</StatusTag>
          ) : (
            <StatusTag color={paymentMeta?.color}>{t(paymentMeta?.label, { ns: "authenticated" })}</StatusTag>
          )}
        </TitleContainer>
        <SubTitle>
          {!receipt ? <Skeleton variant="text" width={130} /> : `${timeFormatter(date)} ${dateFormatter(date)}`}
        </SubTitle>
      </StyledDialogTitle>
      <DialogContent sx={{ px: { xs: "0 !important", sm: 2, md: 0 }, mt: { xs: 1, md: 0 } }}>
        <>
          {!receipt ? (
            <Skeleton
              variant="rectangular"
              sx={{
                height: { xs: 71, md: 88 },
                width: "90%",
                mx: "auto",
                my: 1,
              }}
            />
          ) : (
            <Paper elevation={3} sx={{ width: "90%", mx: "auto", my: 1 }}>
              <StatusContent color={paymentMeta?.color}>
                <StatusText>
                  {t(paymentMeta?.label, { ns: "authenticated" })}
                  <p>
                    {t(stepContent?.summary, {
                      ns: "authenticated",
                      date: dateFormatter(stepContent?.date, i18n.language),
                      time: timeFormatter(stepContent?.date, i18n.language),
                    })}
                  </p>
                </StatusText>
              </StatusContent>
            </Paper>
          )}
        </>
        {!tabletMode && (
          <SummaryContainer>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <SubText>
                  {!receipt ? (
                    <Skeleton variant="text" width={280} />
                  ) : (
                    t(stepContent?.summary, {
                      ns: "authenticated",
                      date: dateFormatter(stepContent?.date, i18n.language),
                      time: timeFormatter(stepContent?.date, i18n.language),
                    })
                  )}
                </SubText>
              </Box>
              <Box>
                {!receipt ? (
                  <MainButton disabled variant="contained" color="secondary" size="large" fullWidth>
                    {t("loading")}
                  </MainButton>
                ) : (
                  receipt?.paymentStatus == PaymentStatus.PENDING && (
                    <>
                      <MainButton
                        variant="outlined"
                        color="error"
                        size="large"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={handleCancelOrder}
                      >
                        {t("checkout.cancel.label", { ns: "authenticated" })}
                      </MainButton>
                      <MainButton
                        variant="outlined"
                        color="warning"
                        size="large"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={handleUpdatePayment}
                      >
                        {t("checkout.payment.update", { ns: "authenticated" })}
                      </MainButton>
                      {receipt?.paymentType == PaymentType.ONLINE_PAYMENT && (
                        <Link to={`/payment/${receipt?.id}`}>
                          <MainButton variant="contained" color="info" size="large" fullWidth sx={{ mt: 1 }}>
                            {t("order.pay", { ns: "authenticated" })}
                          </MainButton>
                        </Link>
                      )}
                    </>
                  )
                )}
              </Box>
            </Box>
          </SummaryContainer>
        )}
        <ContentWrapper>
          <Title>
            <SellIcon />
            &nbsp;{t("address.recipient", { ns: "authenticated" })}
          </Title>
          <InfoContainer>
            <div>
              <Name>
                {!receipt ? <Skeleton variant="text" width={150} /> : (receipt?.companyName ?? receipt?.name) + " "}
              </Name>
              <InfoText>{!receipt ? <Skeleton variant="text" width={140} /> : `(+84) ${receipt?.phone}`}</InfoText>
            </div>
            <InfoText>
              {!receipt ? (
                <Box width="100%">
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="30%" />
                </Box>
              ) : (
                (receipt?.address ?? t("unknown"))
              )}
            </InfoText>
          </InfoContainer>
        </ContentWrapper>
        <Title>
          <InboxIcon />
          &nbsp;{t("order.package", { ns: "authenticated" })}
        </Title>
        <OrderReceiptDetails {...{ receipt, tabletMode }} />
        {!receipt ? (
          <ButtonContainer>
            <MobileButton>
              <Skeleton variant="text" width={150} />
              <MobileExtendButton>
                <KeyboardArrowRightIcon fontSize="small" />
              </MobileExtendButton>
            </MobileButton>
          </ButtonContainer>
        ) : (
          receipt?.paymentStatus == PaymentStatus.PENDING && (
            <ButtonContainer>
              <MobileButton onClick={handleCancelOrder}>
                <span>
                  <CloseIcon fontSize="small" color="error" />
                  &nbsp;{t("checkout.cancel.label", { ns: "authenticated" })}
                </span>
                <MobileExtendButton>
                  <KeyboardArrowRightIcon fontSize="small" />
                </MobileExtendButton>
              </MobileButton>
              <MobileButton onClick={handleUpdatePayment}>
                <span>
                  <CurrencyExchange fontSize="small" color="warning" />
                  &nbsp;{t("checkout.payment.update", { ns: "authenticated" })}
                </span>
                <MobileExtendButton>
                  <KeyboardArrowRightIcon fontSize="small" />
                </MobileExtendButton>
              </MobileButton>
            </ButtonContainer>
          )
        )}
        {tabletMode &&
          (!receipt ? (
            <MainButtonContainer>
              <MainButton disabled variant="contained" color="secondary" size="large" fullWidth>
                {t("loading")}
              </MainButton>
            </MainButtonContainer>
          ) : (
            receipt?.paymentStatus == PaymentStatus.PENDING &&
            receipt?.paymentType == PaymentType.ONLINE_PAYMENT && (
              <Link to={`/payment/${receipt?.id}`}>
                <MainButtonContainer>
                  <MainButton variant="contained" color="info" size="large" fullWidth>
                    {t("order.pay", { ns: "authenticated" })}
                  </MainButton>
                </MainButtonContainer>
              </Link>
            )
          ))}
      </DialogContent>
      <Dialog
        maxWidth={"sm"}
        fullWidth
        open={open}
        onClose={handleClose}
        fullScreen={mobileMode}
        closeAfterTransition={false}
        aria-labelledby="cancel-refund-dialog"
        slots={{
          transition: Transition,
        }}
      >
        {open && (
          <Suspense fallback={null}>
            <CancelAndUpdateOrderForm
              {...{
                pending,
                setPending,
                id: receipt?.id,
                handleClose,
                isRefund: openUpdate,
                paymentMethod: receipt?.paymentType,
              }}
            />
          </Suspense>
        )}
      </Dialog>
    </>
  );
};

export default CheckoutDetailComponent;
