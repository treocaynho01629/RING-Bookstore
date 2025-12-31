import styled from "@emotion/styled";
import { Suspense, lazy, useState, forwardRef } from "react";
import { StyledDialogTitle } from "../custom/ProfileComponents";
import { currencyFormat, dateFormatter, idFormatter, timeFormatter } from "@ring/shared/utils/convert";
import { getShippingType } from "@ring/shared/enums/shipping";
import { iconList } from "@ring/shared/utils/icon";
import { Link } from "react-router";
import { booksApiSlice } from "../../features/books/booksApiSlice";
import { MobileExtendButton } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import { useConfirmOrderMutation } from "../../features/orders/ordersApiSlice";
import { getOrderStatus } from "@ring/shared/enums/order";
import { OrderStatus } from "@ring/shared/models/orderStatus";
import { PaymentStatus } from "@ring/shared/models/paymentStatus";
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
import Slide from "@mui/material/Slide";
import ConfirmDialog from "@ring/ui/ConfirmDialog";

const OrderProgress = lazy(() => import("./OrderProgress"));
const CancelAndRefundDetailForm = lazy(() => import("./CancelAndRefundDetailForm"));

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

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

function getStepContent(detail) {
  const date = new Date(detail?.date);

  switch (detail?.status) {
    case OrderStatus.PENDING_PAYMENT:
      return {
        step: 1,
        summary: "order.status.pending.payment",
      };
    case OrderStatus.PENDING:
      return {
        step: 1,
        summary: "order.status.pending.seller",
      };
    case OrderStatus.SHIPPING:
      return {
        step: 2,
        summary: "order.status.shipping",
      };
    case OrderStatus.PENDING_RETURN:
      return {
        step: 3,
        summary: "order.status.pending.return",
      };
    case OrderStatus.PENDING_REFUND:
      return {
        step: 3,
        summary: "order.status.pending.refund",
      };
    case OrderStatus.COMPLETED:
      return {
        step: 4,
        summary: "order.status.completed",
      };
    case OrderStatus.CANCELED:
      return {
        step: 1,
        date: date,
        summary: "order.status.cancelled",
      };
    case OrderStatus.REFUNDED:
      return {
        step: 4,
        price: detail?.totalPrice - detail?.totalDiscount,
        date: date,
        summary: "order.status.refunded",
      };
  }
}

const OrderDetailComponent = ({ order, pending, setPending, tabletMode, mobileMode }) => {
  const { addProduct } = useCart();
  const { t, i18n } = useTranslation();

  const [openCancel, setOpenCancel] = useState(undefined);
  const [openRefund, setOpenRefund] = useState(undefined);

  const open = Boolean(openCancel || openRefund);
  const detailMeta = getOrderStatus(order?.status);

  const [getBought, { isLoading: fetching }] = booksApiSlice.useLazyGetBooksByIdsQuery();
  const [confirmOrder, { isLoading: confirming }] = useConfirmOrderMutation();
  const { confirm, ConfirmationDialog } = useConfirm(ConfirmDialog);

  /**
   * Handle rebuy product
   */
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
            // Check for stock
            addProduct(book, 1);
          } else {
            enqueueSnackbar(t("product.out"), { variant: "error" });
          }
        });
        setPending(false);
      })
      .catch((rejected) => {
        console.error(rejected);
        enqueueSnackbar(t("message.error", { action: t("cart.add") }), { variant: "error" });
        setPending(false);
      });
  };

  /**
   * Handle confirm order
   */
  const handleConfirmOrder = async () => {
    const confirmation = await confirm(
      t("order.confirm.label", { ns: "authenticated" }),
      t("order.confirm.message", { ns: "authenticated", id: idFormatter(order?.id) })
      t("cancel"),
      t("confirm")
    );
    if (confirmation) {
      if (confirming || pending) return;
      setPending(true);

      const { enqueueSnackbar } = await import("notistack");

      confirmOrder(order?.id)
        .unwrap()
        .then((data) => {
          enqueueSnackbar(t("message.success", { action: t("order.confirm") }), {
            variant: "success",
          });
          setPending(false);
        })
        .catch((err) => {
          enqueueSnackbar(t("message.error", { action: t("order.confirm") }), { variant: "error" });
          setPending(false);
        });
    }
  };

  /**
   * Handle cancel order
   */
  const handleCancelOrder = () => {
    setOpenCancel(true);
  };

  /**
   * Handle refund order
   */
  const handleRefundOrder = () => {
    setOpenRefund(true);
  };

  /**
   * Handle close cancel and refund detail form
   */
  const handleClose = () => {
    setOpenCancel(false);
    setOpenRefund(false);
  };

  const stepContent = getStepContent(order);
  const orderedDate = new Date(order?.orderedDate);
  const date = new Date(order?.date);
  const isRefundable = Math.abs(new Date() - date) / (1000 * 60 * 60 * 24) <= 7;
  const shippingMeta = getShippingType(order?.shippingType);
  const Icon = iconList[shippingMeta?.icon];

  return (
    <>
      <StyledDialogTitle>
        <TitleContainer>
          <Link to={-1}>
            <KeyboardArrowLeftIcon />
          </Link>
          <ReceiptIcon />
          &nbsp;{t("order.id", { ns: "authenticated" })}&nbsp;
          {!order ? <Skeleton variant="text" width={100} /> : idFormatter(order?.orderId)}
          &emsp;
          {!order ? (
            <StatusTag color="secondary">{t("loading")}</StatusTag>
          ) : (
            <StatusTag color={detailMeta?.color}>{t(detailMeta?.label)}</StatusTag>
          )}
        </TitleContainer>
        <SubTitle>
          {!order ? (
            <Skeleton variant="text" width={130} />
          ) : (
            `${timeFormatter(orderedDate, i18n.language)} ${dateFormatter(orderedDate, i18n.language)}`
          )}
        </SubTitle>
      </StyledDialogTitle>
      <DialogContent sx={{ px: { xs: "0 !important", sm: 2, md: 0 }, mt: { xs: 1, md: 0 } }}>
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
                detailStatus: detailMeta,
                orderedDate,
                date,
                tabletMode,
              }}
            />
            {tabletMode &&
              [
                OrderStatus.CANCELED,
                OrderStatus.PENDING_RETURN,
                OrderStatus.PENDING_REFUND,
                OrderStatus.REFUNDED,
              ]?.includes(order?.status) &&
              order?.note && (
                <Box mt={2}>
                  <InfoContainer>
                    <Name>{t("order.reason.label", { ns: "authenticated" })}:</Name>
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
                    t(stepContent?.summary, {
                      ns: "authenticated",
                      date: stepContent?.date
                        ? `${timeFormatter(stepContent?.date, i18n.language)} ${dateFormatter(stepContent?.date, i18n.language)}`
                        : undefined,
                      amount: stepContent?.price ? currencyFormat.format(stepContent?.price) : undefined,
                    })
                  )}
                </SubText>
              </Box>
              <Box>
                {!order ? (
                  <MainButton disabled variant="contained" color="secondary" size="large" fullWidth>
                    {t("loading")}
                  </MainButton>
                ) : order?.status == OrderStatus.PENDING ? (
                  <>
                    <MainButton
                      variant="outlined"
                      color="error"
                      size="large"
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={handleCancelOrder}
                    >
                      {t("order.cancel.label", { ns: "authenticated" })}
                    </MainButton>
                  </>
                ) : order?.status == OrderStatus.SHIPPING && order?.paymentStatus == PaymentStatus.PAID ? (
                  <MainButton variant="contained" color="success" size="large" fullWidth onClick={handleConfirmOrder}>
                    {t("order.confirm.confirmed", { ns: "authenticated" })}
                  </MainButton>
                ) : (
                  <>
                    <MainButton variant="contained" color="primary" size="large" fullWidth onClick={handleAddToCart}>
                      {t("order.again", { ns: "authenticated" })}
                    </MainButton>
                    {order?.status == OrderStatus.COMPLETED && isRefundable && (
                      <MainButton
                        variant="outlined"
                        color="warning"
                        size="large"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={handleRefundOrder}
                        disabled={!isRefundable}
                      >
                        {t("order.refund.label", { ns: "authenticated" })}
                      </MainButton>
                    )}
                  </>
                )}
              </Box>
            </Box>
            {[
              OrderStatus.CANCELED,
              OrderStatus.PENDING_RETURN,
              OrderStatus.PENDING_REFUND,
              OrderStatus.REFUNDED,
            ]?.includes(order?.status) &&
              order?.note && (
                <Box mt={2}>
                  <InfoContainer>
                    <Name>{t("order.reason.label", { ns: "authenticated" })}:</Name>
                    <InfoText>{order?.note}</InfoText>
                  </InfoContainer>
                </Box>
              )}
          </SummaryContainer>
        )}
        <ContentWrapper>
          <Title>
            <SellIcon />
            &nbsp;{t("address.recipient", { ns: "authenticated" })}
          </Title>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md_lg: 6 }}>
              <InfoContainer>
                <div>
                  <Name>
                    {!order ? <Skeleton variant="text" width={150} /> : (order?.companyName ?? order?.name) + " "}
                  </Name>
                  <InfoText>{!order ? <Skeleton variant="text" width={140} /> : `(+84) ${order?.phone}`}</InfoText>
                </div>
                <InfoText>
                  {!order ? (
                    <Box width="100%">
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="30%" />
                    </Box>
                  ) : (
                    (order?.address ?? t("unknown")) // TODO: Do something with this
                  )}
                </InfoText>
              </InfoContainer>
            </Grid>
            <Grid size={{ xs: 12, md_lg: 6 }}>
              <InfoContainer>
                <Box mb={1}>
                  <Name>{t("order.shipping", { ns: "authenticated" })}:</Name>
                  <InfoText>
                    {!order ? (
                      <Skeleton variant="text" width={200} />
                    ) : (
                      <Suspense fallback={null}>
                        <ShippingTag color={shippingMeta?.color}>
                          {Icon && <Icon color={shippingMeta?.color} />}
                          {t(shippingMeta?.label)}:
                        </ShippingTag>
                        &nbsp;{t("shipping.estimate", { date: shippingMeta?.estimate })}
                      </Suspense>
                    )}
                  </InfoText>
                  <InfoText className="price">
                    {!order ? (
                      <Skeleton variant="text" width={190} />
                    ) : (
                      `${t("cart.shipping.fee")} ${currencyFormat.format(order?.shippingFee)}`
                    )}
                  </InfoText>
                </Box>
              </InfoContainer>
            </Grid>
            {![
              OrderStatus.CANCELED,
              OrderStatus.PENDING_RETURN,
              OrderStatus.PENDING_REFUND,
              OrderStatus.REFUNDED,
            ]?.includes(order?.status) &&
              order?.note && (
                <Grid size={12}>
                  <InfoContainer>
                    <Name>{t("order.note", { ns: "authenticated" })}:</Name>
                    <InfoText>{order?.note}</InfoText>
                  </InfoContainer>
                </Grid>
              )}
          </Grid>
        </ContentWrapper>
        <Title>
          <InboxIcon />
          &nbsp;{t("order.package", { ns: "authenticated" })}
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
          ) : order?.status == OrderStatus.PENDING ? (
            <MobileButton onClick={handleCancelOrder}>
              <span>
                <CloseIcon fontSize="small" color="error" />
                &nbsp;{t("order.cancel.label", { ns: "authenticated" })}
              </span>
              <MobileExtendButton>
                <KeyboardArrowRightIcon fontSize="small" />
              </MobileExtendButton>
            </MobileButton>
          ) : (
            order?.status == OrderStatus.COMPLETED &&
            isRefundable && (
              <MobileButton onClick={handleRefundOrder}>
                <span>
                  <KeyboardReturnIcon fontSize="small" color="warning" />
                  &nbsp;{t("order.refund.label", { ns: "authenticated" })}
                </span>
                <MobileExtendButton>
                  <KeyboardArrowRightIcon fontSize="small" disabled={!isRefundable} />
                </MobileExtendButton>
              </MobileButton>
            )
          )}
        </ButtonContainer>
        {tabletMode && (
          <MainButtonContainer>
            {!order ? (
              <MainButton disabled variant="contained" color="secondary" size="large" fullWidth>
                {t("loading")}
              </MainButton>
            ) : order?.status == OrderStatus.SHIPPING ? (
              <MainButton variant="contained" color="success" size="large" fullWidth onClick={handleConfirmOrder}>
                {t("order.confirm.confirmed", { ns: "authenticated" })}
              </MainButton>
            ) : (
              <MainButton variant="contained" color="primary" size="large" fullWidth onClick={handleAddToCart}>
                {t("order.again", { ns: "authenticated" })}
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
        slots={{
          transition: Transition,
        }}
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
