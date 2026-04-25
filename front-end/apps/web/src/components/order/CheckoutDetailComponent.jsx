import styled from "@emotion/styled";
import { Suspense, lazy, useState, forwardRef } from "react";
import { StyledDialogContent, StyledDialogTitle } from "../custom/ProfileComponents";
import { getPaymentStatus } from "@ring/shared/enums/payment";
import { PaymentStatus } from "@ring/shared/models/paymentStatus";
import { PaymentType } from "@ring/shared/models/paymentType";
import { idFormatter, timeFormatter, dateFormatter, dateTimeFormatter } from "@ring/shared/utils/convert";
import { Link } from "react-router";
import { MobileExtendButton } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import {
  StatusContent,
  Title,
  Name,
  InfoText,
  InfoContainer,
  ContentWrapper,
  SubTitle,
  TitleStatusTag,
} from "../custom/OrderComponents";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
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

const SummaryContainer = styled.div`
  border-top: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
  border-bottom: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
  padding: ${({ theme }) => theme.spacing(2)} 0;

  ${({ theme }) => theme.breakpoints.down("md")} {
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
  margin: ${({ theme }) => theme.spacing(1, 0, 2)};
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
  padding: ${({ theme }) => theme.spacing(2.5, 2)};
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

function getStepContent(checkout) {
  const date = new Date(checkout?.date);
  const expiredDate = checkout?.expiredAt ? new Date(checkout?.expiredAt) : null;

  switch (checkout?.paymentStatus) {
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

const CheckoutDetailComponent = ({ checkout, pending, setPending, tabletMode, mobileMode }) => {
  const { t, i18n } = useTranslation();
  const [openCancel, setOpenCancel] = useState(undefined);
  const [openUpdate, setOpenUpdate] = useState(undefined);
  const open = Boolean(openCancel || openUpdate);
  const paymentMeta = getPaymentStatus(checkout?.paymentStatus);
  const stepContent = getStepContent(checkout);

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

  const date = new Date(checkout?.date);

  return (
    <>
      <StyledDialogTitle>
        <TitleContainer>
          <Link to={-1}>
            <KeyboardArrowLeftIcon />
          </Link>
          <ReceiptIcon />
          &nbsp;{t("order.id", { ns: "authenticated" })}&nbsp;
          {!checkout ? <Skeleton variant="text" width={100} /> : idFormatter(checkout?.id)}
          &emsp;
          {!checkout ? (
            <TitleStatusTag color="secondary">{t("loading")}</TitleStatusTag>
          ) : (
            <TitleStatusTag color={paymentMeta?.color}>{t(paymentMeta?.label, { ns: "authenticated" })}</TitleStatusTag>
          )}
        </TitleContainer>
        <SubTitle>
          {!checkout ? <Skeleton variant="text" width={130} /> : dateTimeFormatter(date, i18n.language)}
        </SubTitle>
      </StyledDialogTitle>
      <StyledDialogContent>
        <StatusContent className="summary" color={paymentMeta?.color}>
          <StatusText>
            {!checkout ? <Skeleton variant="text" width={100} /> : t(paymentMeta?.label, { ns: "authenticated" })}
            <p>
              {!checkout ? (
                <Skeleton variant="text" width={200} />
              ) : (
                t(stepContent?.summary, {
                  ns: "authenticated",
                  date: dateFormatter(stepContent?.date, i18n.language),
                  time: timeFormatter(stepContent?.date, i18n.language),
                })
              )}
            </p>
          </StatusText>
        </StatusContent>
        {!tabletMode && (
          <SummaryContainer>
            <Box display="flex" justifyContent="flex-end">
              <Box>
                {!checkout ? (
                  <MainButton disabled variant="contained" color="secondary" size="large" fullWidth>
                    {t("loading")}
                  </MainButton>
                ) : (
                  checkout?.paymentStatus == PaymentStatus.PENDING && (
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
                      {checkout?.paymentType == PaymentType.ONLINE_PAYMENT && (
                        <Link to={`/payment/${checkout?.id}`}>
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
                {!checkout ? <Skeleton variant="text" width={150} /> : (checkout?.companyName ?? checkout?.name) + " "}
              </Name>
              <InfoText>{!checkout ? <Skeleton variant="text" width={140} /> : `(+84) ${checkout?.phone}`}</InfoText>
            </div>
            <InfoText>
              {!checkout ? (
                <Box width="100%">
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="30%" />
                </Box>
              ) : (
                (checkout?.address ?? t("unknown"))
              )}
            </InfoText>
          </InfoContainer>
        </ContentWrapper>
        <Title>
          <InboxIcon />
          &nbsp;{t("order.package", { ns: "authenticated" })}
        </Title>
        <OrderReceiptDetails {...{ receipt: checkout, tabletMode }} />
        {!checkout ? (
          <ButtonContainer>
            <MobileButton>
              <Skeleton variant="text" width={150} />
              <MobileExtendButton>
                <KeyboardArrowRightIcon fontSize="small" />
              </MobileExtendButton>
            </MobileButton>
          </ButtonContainer>
        ) : (
          checkout?.paymentStatus == PaymentStatus.PENDING && (
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
          (!checkout ? (
            <MainButtonContainer>
              <MainButton disabled variant="contained" color="secondary" size="large" fullWidth>
                {t("loading")}
              </MainButton>
            </MainButtonContainer>
          ) : (
            checkout?.paymentStatus == PaymentStatus.PENDING &&
            checkout?.paymentType == PaymentType.ONLINE_PAYMENT && (
              <Link to={`/payment/${checkout?.id}`}>
                <MainButtonContainer>
                  <MainButton variant="contained" color="info" size="large" fullWidth>
                    {t("order.pay", { ns: "authenticated" })}
                  </MainButton>
                </MainButtonContainer>
              </Link>
            )
          ))}
      </StyledDialogContent>
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
                id: checkout?.id,
                handleClose,
                isRefund: openUpdate,
                paymentMethod: checkout?.paymentType,
              }}
            />
          </Suspense>
        )}
      </Dialog>
    </>
  );
};

export default CheckoutDetailComponent;
