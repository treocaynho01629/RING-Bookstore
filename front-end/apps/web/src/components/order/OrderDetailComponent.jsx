import styled from "@emotion/styled";
import { Suspense, lazy, useState } from "react";
import { StyledDialogTitle } from "../custom/ProfileComponents";
import {
  currencyFormat,
  dateFormatter,
  idFormatter,
  timeFormatter,
} from "@ring/shared/utils/convert";
import { getOrderStatus } from "@ring/shared/enums/order";
import { getPaymentStatus } from "@ring/shared/enums/payment";
import { getShippingType } from "@ring/shared/enums/shipping";
import { iconList } from "@ring/shared/utils/icon";
import { Link } from "react-router";
import { booksApiSlice } from "../../features/books/booksApiSlice";
import { MobileExtendButton } from "@ring/ui/Components";
import { useConfirmOrderMutation } from "../../features/orders/ordersApiSlice";
import useConfirm from "@ring/shared/useConfirm";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import InboxIcon from "@mui/icons-material/Inbox";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SellIcon from "@mui/icons-material/Sell";
import OrderDetailItems from "./OrderDetailItems";
import useCart from "../../hooks/useCart";

const OrderProgress = lazy(() => import("./OrderProgress"));
const CancelAndRefundDetailForm = lazy(
  () => import("./CancelAndRefundDetailForm")
);

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
  color: ${({ theme, color }) =>
    theme.vars.palette[color]?.dark || theme.vars.palette.primary.dark};
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
//#endregion

const OrderStatus = getOrderStatus();
const PaymentStatus = getPaymentStatus();
const ShippingType = getShippingType();

function getStepContent(detail) {
  const date = new Date(detail?.date);

  switch (detail?.status) {
    case OrderStatus.PENDING_PAYMENT.value:
      return {
        step: 1,
        summary: "Đang chờ thanh toán đơn hàng.",
      };
    case OrderStatus.PENDING.value:
      return {
        step: 1,
        summary: "Đang chờ nhận hàng từ shop.",
      };
    case OrderStatus.SHIPPING.value:
      return {
        step: 2,
        summary: "Đang giao hàng cho đơn vị vận chuyển.",
      };
    case OrderStatus.PENDING_RETURN.value:
      return {
        step: 3,
        summary: "Đang chờ hoàn trả hàng.",
      };
    case OrderStatus.PENDING_REFUND.value:
      return {
        step: 3,
        summary: "Đang chờ hoàn tiền.",
      };
    case OrderStatus.COMPLETED.value:
      return {
        step: 4,
        summary: "Cảm ơn bạn đã mua hàng!",
      };
    case OrderStatus.CANCELED.value:
      return {
        step: 1,
        summary: `Đã huỷ đơn vào ${timeFormatter(date)} ${dateFormatter(date)}.`,
      };
    case OrderStatus.REFUNDED.value:
      return {
        step: 4,
        summary: `Đã hoàn trả ${currencyFormat.format(detail?.totalPrice - detail?.totalDiscount)} vào tài khoản vào ${timeFormatter(date)} ${dateFormatter(date)}.`,
      };
  }
}

const OrderDetailComponent = ({
  order,
  pending,
  setPending,
  tabletMode,
  mobileMode,
}) => {
  const { addProduct } = useCart();
  const [openCancel, setOpenCancel] = useState(undefined);
  const [openRefund, setOpenRefund] = useState(undefined);
  const open = Boolean(openCancel || openRefund);
  const detailStatus = OrderStatus[order?.status];
  const [getBought, { isLoading: fetching }] =
    booksApiSlice.useLazyGetBooksByIdsQuery();
  const [confirmOrder, { isLoading: confirming }] = useConfirmOrderMutation();
  const [ConfirmationDialog, confirm] = useConfirm(
    "Xác nhận đơn hàng",
    `Xác nhận đã nhận đơn hàng ${idFormatter(order?.id)}?`
  );

  //Rebuy
  const handleAddToCart = async () => {
    if (fetching || pending) return;
    setPending(true);

    const { enqueueSnackbar } = await import("notistack");

    const ids = order?.items?.map((item) => item.bookId);
    getBought(ids) //Fetch books with new info
      .unwrap()
      .then((books) => {
        const { ids, entities } = books;

        ids.forEach((id) => {
          const book = entities[id];
          if (book.amount > 0) {
            //Check for stock
            addProduct(book, 1);
          } else {
            enqueueSnackbar("Sản phẩm đã hết hàng!", { variant: "error" });
          }
        });
        setPending(false);
      })
      .catch((rejected) => {
        console.error(rejected);
        enqueueSnackbar("Mua lại sản phẩm thất bại!", { variant: "error" });
        setPending(false);
      });
  };

  //Confirm
  const handleConfirmOrder = async () => {
    const confirmation = await confirm();
    if (confirmation) {
      if (confirming || pending) return;
      setPending(true);

      const { enqueueSnackbar } = await import("notistack");

      confirmOrder(order?.id)
        .unwrap()
        .then((data) => {
          enqueueSnackbar("Xác nhận đơn hàng thành công!", {
            variant: "success",
          });
          setPending(false);
        })
        .catch((err) => {
          enqueueSnackbar("Xác nhận đơn hàng thất bại!", { variant: "error" });
          setPending(false);
        });
    } else {
      console.log("Cancel");
    }
  };

  //Cancel
  const handleCancelOrder = () => {
    setOpenCancel(true);
  };

  //Refund
  const handleRefundOrder = () => {
    setOpenRefund(true);
  };

  const handleClose = () => {
    setOpenCancel(false);
    setOpenRefund(false);
  };

  const stepContent = getStepContent(order);
  const orderedDate = new Date(order?.orderedDate);
  const date = new Date(order?.date);
  const isRefundable = Math.abs(new Date() - date) / (1000 * 60 * 60 * 24) <= 7;
  const shippingSummary = ShippingType[order?.shippingType];
  // const Icon = iconList[shippingSummary?.icon];

  return (
    <>
      <StyledDialogTitle>
        <TitleContainer>
          <Link to={-1}>
            <KeyboardArrowLeftIcon />
          </Link>
          <ReceiptIcon />
          &nbsp;Mã vận đơn&nbsp;
          {!order ? (
            <Skeleton variant="text" width={100} />
          ) : (
            idFormatter(order?.orderId)
          )}
          &emsp;
          {!order ? (
            <StatusTag color="secondary">Đang tải</StatusTag>
          ) : (
            <StatusTag color={detailStatus?.color}>
              {detailStatus?.label}
            </StatusTag>
          )}
        </TitleContainer>
        <SubTitle>
          {!order ? (
            <Skeleton variant="text" width={130} />
          ) : (
            `${timeFormatter(orderedDate)} ${dateFormatter(orderedDate)}`
          )}
        </SubTitle>
      </StyledDialogTitle>
      <DialogContent sx={{ px: { xs: 0, sm: 2, md: 0 }, mt: { xs: 1, md: 0 } }}>
        {!order ? (
          <Skeleton
            variant="rectangular"
            sx={{
              height: { xs: 71, md: 169 },
              width: { xs: "90%", md: "100%" },
              mt: { xs: 1, md: 0 },
              mx: "auto",
              mb: 1,
            }}
          />
        ) : (
          <Suspense
            fallback={
              <Skeleton
                variant="rectangular"
                sx={{
                  height: { xs: 71, md: 169 },
                  width: { xs: "90%", md: "100%" },
                  mt: { xs: 1, md: 0 },
                  mx: "auto",
                  mb: 1,
                }}
              />
            }
          >
            <OrderProgress
              {...{
                status: order?.status,
                stepContent,
                detailStatus,
                orderedDate,
                date,
                tabletMode,
              }}
            />
            {tabletMode &&
              [
                OrderStatus.CANCELED.value,
                OrderStatus.PENDING_RETURN.value,
                OrderStatus.PENDING_REFUND.value,
                OrderStatus.REFUNDED.value,
              ]?.includes(order?.status) &&
              order?.note && (
                <Box mt={2}>
                  <InfoContainer>
                    <Name>Lý do:</Name>
                    <InfoText>{order?.note}</InfoText>
                  </InfoContainer>
                </Box>
              )}
          </Suspense>
        )}
        {!tabletMode && (
          <SummaryContainer>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <SubText>
                  {!order ? (
                    <Skeleton variant="text" width={280} />
                  ) : (
                    stepContent?.summary
                  )}
                </SubText>
              </Box>
              <Box>
                {!order ? (
                  <MainButton
                    disabled
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                  >
                    Đang tải
                  </MainButton>
                ) : order?.status == OrderStatus.PENDING.value ? (
                  <>
                    <MainButton
                      variant="outlined"
                      color="error"
                      size="large"
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={handleCancelOrder}
                    >
                      Huỷ đơn hàng
                    </MainButton>
                  </>
                ) : order?.status == OrderStatus.SHIPPING.value &&
                  order?.paymentStatus == PaymentStatus.PAID.value ? (
                  <MainButton
                    variant="contained"
                    color="success"
                    size="large"
                    fullWidth
                    onClick={handleConfirmOrder}
                  >
                    Đã nhận hàng
                  </MainButton>
                ) : (
                  <>
                    <MainButton
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      onClick={handleAddToCart}
                    >
                      Mua lại
                    </MainButton>
                    {order?.status == OrderStatus.COMPLETED.value &&
                      isRefundable && (
                        <MainButton
                          variant="outlined"
                          color="warning"
                          size="large"
                          fullWidth
                          sx={{ mt: 1 }}
                          onClick={handleRefundOrder}
                          disabled={!isRefundable}
                        >
                          Hoàn trả hàng
                        </MainButton>
                      )}
                  </>
                )}
              </Box>
            </Box>
            {[
              OrderStatus.CANCELED.value,
              OrderStatus.PENDING_RETURN.value,
              OrderStatus.PENDING_REFUND.value,
              OrderStatus.REFUNDED.value,
            ]?.includes(order?.status) &&
              order?.note && (
                <Box mt={2}>
                  <InfoContainer>
                    <Name>Lý do:</Name>
                    <InfoText>{order?.note}</InfoText>
                  </InfoContainer>
                </Box>
              )}
          </SummaryContainer>
        )}
        <ContentWrapper>
          <Title>
            <SellIcon />
            &nbsp;Địa chỉ người nhận
          </Title>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md_lg: 6 }}>
              <InfoContainer>
                <div>
                  <Name>
                    {!order ? (
                      <Skeleton variant="text" width={150} />
                    ) : (
                      (order?.companyName ?? order?.name) + " "
                    )}
                  </Name>
                  <InfoText>
                    {!order ? (
                      <Skeleton variant="text" width={140} />
                    ) : (
                      `(+84) ${order?.phone}`
                    )}
                  </InfoText>
                </div>
                <InfoText>
                  {!order ? (
                    <Box width="100%">
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="30%" />
                    </Box>
                  ) : (
                    (order?.address ?? "Không xác định")
                  )}
                </InfoText>
              </InfoContainer>
            </Grid>
            <Grid size={{ xs: 12, md_lg: 6 }}>
              <InfoContainer>
                <Box mb={1}>
                  <Name>Hình thức giao hàng:</Name>
                  <InfoText>
                    {!order ? (
                      <Skeleton variant="text" width={200} />
                    ) : (
                      <Suspense fallback={null}>
                        <ShippingTag color={shippingSummary?.color}>
                          {/* <Icon />  */}
                          {shippingSummary?.label}:
                        </ShippingTag>
                        &nbsp;{shippingSummary?.description}
                      </Suspense>
                    )}
                  </InfoText>
                  <InfoText className="price">
                    {!order ? (
                      <Skeleton variant="text" width={190} />
                    ) : (
                      `Phí vận chuyển ${currencyFormat.format(order?.shippingFee)}`
                    )}
                  </InfoText>
                </Box>
              </InfoContainer>
            </Grid>
            {![
              OrderStatus.CANCELED.value,
              OrderStatus.PENDING_RETURN.value,
              OrderStatus.PENDING_REFUND.value,
              OrderStatus.REFUNDED.value,
            ]?.includes(order?.status) &&
              order?.note && (
                <Grid size={12}>
                  <InfoContainer>
                    <Name>Ghi chú:</Name>
                    <InfoText>{order?.note}</InfoText>
                  </InfoContainer>
                </Grid>
              )}
          </Grid>
        </ContentWrapper>
        <Title>
          <InboxIcon />
          &nbsp;Kiện hàng
        </Title>
        <OrderDetailItems {...{ order, tabletMode }} />
        <ButtonContainer>
          {!order ? (
            <MobileButton>
              <Skeleton variant="text" width={150} />
              <MobileExtendButton>
                <KeyboardArrowRightIcon fontSize="small" />
              </MobileExtendButton>
            </MobileButton>
          ) : order?.status == OrderStatus.PENDING.value ? (
            <MobileButton onClick={handleCancelOrder}>
              <span>
                <CloseIcon fontSize="small" color="error" />
                &nbsp;Huỷ đơn hàng
              </span>
              <MobileExtendButton>
                <KeyboardArrowRightIcon fontSize="small" />
              </MobileExtendButton>
            </MobileButton>
          ) : (
            order?.status == OrderStatus.COMPLETED.value &&
            isRefundable && (
              <MobileButton onClick={handleRefundOrder}>
                <span>
                  <KeyboardReturnIcon fontSize="small" color="warning" />
                  &nbsp;Hoàn trả đơn hàng
                </span>
                <MobileExtendButton>
                  <KeyboardArrowRightIcon
                    fontSize="small"
                    disabled={!isRefundable}
                  />
                </MobileExtendButton>
              </MobileButton>
            )
          )}
        </ButtonContainer>
        {tabletMode && (
          <MainButtonContainer>
            {!order ? (
              <MainButton
                disabled
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
              >
                Đang tải
              </MainButton>
            ) : order?.status == OrderStatus.SHIPPING.value ? (
              <MainButton
                variant="contained"
                color="success"
                size="large"
                fullWidth
                onClick={handleConfirmOrder}
              >
                Đã nhận hàng
              </MainButton>
            ) : (
              <MainButton
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleAddToCart}
              >
                Mua lại
              </MainButton>
            )}
          </MainButtonContainer>
        )}
      </DialogContent>
      <Dialog
        maxWidth={"sm"}
        fullWidth
        open={open}
        onClose={handleClose}
        fullScreen={mobileMode}
        closeAfterTransition={false}
        aria-labelledby="cancel-refund-dialog"
      >
        {open && (
          <Suspense fallback={null}>
            <CancelAndRefundDetailForm
              {...{
                pending,
                setPending,
                id: order?.id,
                handleClose,
                isRefund: openRefund,
              }}
            />
          </Suspense>
        )}
      </Dialog>
      <ConfirmationDialog />
    </>
  );
};

export default OrderDetailComponent;
