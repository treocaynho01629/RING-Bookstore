import styled from "@emotion/styled";
import { Suspense, lazy, useState, forwardRef } from "react";
import { StyledDialogTitle } from "../custom/ProfileComponents";
import { getPaymentStatus, getPaymentType } from "@ring/shared/enums/payment";
import { idFormatter, timeFormatter, dateFormatter } from "@ring/shared/utils/convert";
import { Link } from "react-router";
import { MobileExtendButton } from "@ring/ui/Components";
import { StatusContent } from "../custom/OrderComponents";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Paper from "@mui/material/Paper";
import Close from "@mui/icons-material/Close";
import Inbox from "@mui/icons-material/Inbox";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Receipt from "@mui/icons-material/Receipt";
import Sell from "@mui/icons-material/Sell";
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
`;
//#endregion

const PaymentStatus = getPaymentStatus();
const PaymentType = getPaymentType();

function getStepContent(receipt) {
  const date = new Date(receipt?.date);
  const expiredDate = receipt?.expiredAt ? new Date(receipt?.expiredAt) : null;

  switch (receipt?.paymentStatus) {
    case PaymentStatus.PENDING.value:
      return {
        summary: `Đang chờ thanh toán đơn hàng ${
          expiredDate ? "trước " + timeFormatter(expiredDate) + " " + dateFormatter(expiredDate) : ""
        } .`,
      };
    case PaymentStatus.PAID.value:
      return {
        summary: `Đã thanh toán ngày ${timeFormatter(date)} ${dateFormatter(date)}.`,
      };
    case PaymentStatus.PENDING_REFUND.value:
      return {
        summary: "Đang chờ hoàn tiền.",
      };
    case PaymentStatus.REFUNDED.value:
      return {
        summary: `Đã hoàn tiền ngày ${timeFormatter(date)} ${dateFormatter(date)}.`,
      };
    case PaymentStatus.CANCELED.value:
      return {
        summary: `Đã huỷ đơn ngày ${timeFormatter(date)} ${dateFormatter(date)}.`,
      };
  }
}

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const CheckoutDetailComponent = ({ receipt, pending, setPending, tabletMode, mobileMode }) => {
  const [openCancel, setOpenCancel] = useState(undefined);
  const [openUpdate, setOpenUpdate] = useState(undefined);
  const open = Boolean(openCancel || openUpdate);
  const paymentStatus = PaymentStatus[receipt?.paymentStatus];
  const stepContent = getStepContent(receipt);

  //Cancel
  const handleCancelOrder = () => {
    setOpenCancel(true);
  };

  //Refund
  const handleUpdatePayment = () => {
    setOpenUpdate(true);
  };

  const handleClose = () => {
    setOpenCancel(false);
    setOpenUpdate(false);
  };

  // const detailSummary = getDetailSummary(order);
  const date = new Date(receipt?.date);

  return (
    <>
      <StyledDialogTitle>
        <TitleContainer>
          <Link to={-1}>
            <KeyboardArrowLeft />
          </Link>
          <Receipt />
          &nbsp;Mã vận đơn&nbsp;
          {!receipt ? <Skeleton variant="text" width={100} /> : idFormatter(receipt?.id)}
          &emsp;
          {!receipt ? (
            <StatusTag color="secondary">Đang tải</StatusTag>
          ) : (
            <StatusTag color={paymentStatus?.color}>{paymentStatus?.label}</StatusTag>
          )}
        </TitleContainer>
        <SubTitle>
          {!receipt ? <Skeleton variant="text" width={130} /> : `${timeFormatter(date)} ${dateFormatter(date)}`}
        </SubTitle>
      </StyledDialogTitle>
      <DialogContent sx={{ px: { xs: 0, sm: 2, md: 0 }, mt: { xs: 1, md: 0 } }}>
        <Paper elevation={3} sx={{ width: "90%", mx: "auto", my: 1 }}>
          <StatusContent color={paymentStatus?.color}>
            <StatusText>
              {paymentStatus?.label}
              <p>{stepContent?.summary}</p>
            </StatusText>
          </StatusContent>
        </Paper>
        {!tabletMode && (
          <SummaryContainer>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <SubText>{!receipt ? <Skeleton variant="text" width={280} /> : stepContent?.summary}</SubText>
              </Box>
              <Box>
                {!receipt ? (
                  <MainButton disabled variant="contained" color="secondary" size="large" fullWidth>
                    Đang tải
                  </MainButton>
                ) : (
                  receipt?.paymentStatus == PaymentStatus.PENDING.value && (
                    <>
                      <MainButton
                        variant="outlined"
                        color="error"
                        size="large"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={handleCancelOrder}
                      >
                        Huỷ toàn bộ đơn
                      </MainButton>
                      <MainButton
                        variant="outlined"
                        color="warning"
                        size="large"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={handleUpdatePayment}
                      >
                        Thay đổi hình thức thanh toán
                      </MainButton>
                      {receipt?.paymentType == PaymentType.ONLINE_PAYMENT.value && (
                        <Link to={`/payment/${receipt?.id}`}>
                          <MainButton variant="contained" color="info" size="large" fullWidth sx={{ mt: 1 }}>
                            Thanh toán
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
            <Sell />
            &nbsp;Địa chỉ người nhận
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
                (receipt?.address ?? "Không xác định")
              )}
            </InfoText>
          </InfoContainer>
        </ContentWrapper>
        <Title>
          <Inbox />
          &nbsp;Kiện hàng
        </Title>
        <OrderReceiptDetails {...{ receipt, tabletMode }} />
        {!receipt ? (
          <ButtonContainer>
            <MobileButton>
              <Skeleton variant="text" width={150} />
              <MobileExtendButton>
                <KeyboardArrowRight fontSize="small" />
              </MobileExtendButton>
            </MobileButton>
          </ButtonContainer>
        ) : (
          receipt?.paymentStatus == PaymentStatus.PENDING.value && (
            <ButtonContainer>
              <MobileButton onClick={handleCancelOrder}>
                <span>
                  <Close fontSize="small" color="error" />
                  &nbsp;Huỷ toàn bộ đơn
                </span>
                <MobileExtendButton>
                  <KeyboardArrowRight fontSize="small" />
                </MobileExtendButton>
              </MobileButton>
              <MobileButton onClick={handleUpdatePayment}>
                <span>
                  <CurrencyExchange fontSize="small" color="warning" />
                  &nbsp;Thay đổi hình thức thanh toán
                </span>
                <MobileExtendButton>
                  <KeyboardArrowRight fontSize="small" />
                </MobileExtendButton>
              </MobileButton>
            </ButtonContainer>
          )
        )}
        {tabletMode &&
          (!receipt ? (
            <MainButtonContainer>
              <MainButton disabled variant="contained" color="secondary" size="large" fullWidth>
                Đang tải
              </MainButton>
            </MainButtonContainer>
          ) : (
            receipt?.paymentStatus == PaymentStatus.PENDING.value &&
            receipt?.paymentType == PaymentType.ONLINE_PAYMENT.value && (
              <Link to={`/payment/${receipt?.id}`}>
                <MainButtonContainer>
                  <MainButton variant="contained" color="info" size="large" fullWidth>
                    Thanh toán
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
