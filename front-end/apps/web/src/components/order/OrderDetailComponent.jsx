import styled from "@emotion/styled";
import { StyledDialogContent, StyledDialogTitle } from "../custom/ProfileComponents";
import { Suspense, lazy, useState, forwardRef } from "react";
import { dateTimeFormatter, idFormatter } from "@ring/shared/utils/convert";
import { Link } from "react-router";
import { MobileExtendButton } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import { getOrderStatus } from "@ring/shared/enums/order";
import { OrderStatus } from "@ring/shared/models/orderStatus";
import { MainButton, SubTitle, Title, TitleStatusTag } from "../custom/OrderComponents";
import { booksApiSlice } from "@ring/redux/booksApiSlice";
import { useConfirmOrderMutation } from "../../features/orders/ordersApiSlice";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ReceiptIcon from "@mui/icons-material/Receipt";
import OrderDetailItems from "./OrderDetailItems";
import OrderShippingInfo from "./OrderShippingInfo";
import InboxIcon from "@mui/icons-material/Inbox";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import Slide from "@mui/material/Slide";
import useCart from "../../hooks/useCart";
import useConfirm from "@ring/shared/useConfirm";
import ConfirmDialog from "@ring/ui/ConfirmDialog";

const CancelAndRefundDetailForm = lazy(() => import("./CancelAndRefundDetailForm"));

//#region styled
const TitleContainer = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
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

const ButtonContainer = styled.div`
  padding: 0 ${({ theme }) => theme.spacing(1)};
  margin: ${({ theme }) => theme.spacing(1, 0, 2)};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  display: none;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: block;

    &:empty {
      visibility: hidden;
    }
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
//#endregion

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const OrderDetailComponent = ({ order, pending, setPending, tabletMode, mobileMode }) => {
  const { t, i18n } = useTranslation();
  const [openCancel, setOpenCancel] = useState(undefined);
  const [openRefund, setOpenRefund] = useState(undefined);

  const detailMeta = getOrderStatus(order?.status);
  const orderedDate = new Date(order?.orderedDate);
  const isRefundable = Math.abs(new Date() - new Date(order?.date)) / (1000 * 60 * 60 * 24) <= 7; // 7 days after order date
  const openDialog = Boolean(openCancel || openRefund);

  const { addProduct } = useCart();
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
    getBought(ids, true) //Fetch books with new info
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
      t("order.confirm.message", { ns: "authenticated", id: idFormatter(order?.id) }),
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
            <TitleStatusTag color="secondary">{t("loading")}</TitleStatusTag>
          ) : (
            <TitleStatusTag color={detailMeta?.color}>{t(detailMeta?.label)}</TitleStatusTag>
          )}
        </TitleContainer>
        <SubTitle>
          {!order ? <Skeleton variant="text" width={130} /> : dateTimeFormatter(orderedDate, i18n.language)}
        </SubTitle>
      </StyledDialogTitle>
      <StyledDialogContent>
        <OrderShippingInfo
          order={order}
          tabletMode={tabletMode}
          handleCancelOrder={handleCancelOrder}
          handleRefundOrder={handleRefundOrder}
          handleConfirmOrder={handleConfirmOrder}
          handleAddToCart={handleAddToCart}
          isRefundable={isRefundable}
        />
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
            <MobileButton onClick={() => console.log("cancel")}>
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
              <MobileButton onClick={() => console.log("refund")}>
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
            ) : order?.status == OrderStatus.PENDING_PAYMENT ? (
              <MainButton
                component={Link}
                to={`/profile/order/checkout/${order?.orderId}`}
                variant="contained"
                color="warning"
                size="large"
                fullWidth
              >
                {t("order.checkout")}
              </MainButton>
            ) : (
              <MainButton variant="contained" color="primary" size="large" fullWidth onClick={handleAddToCart}>
                {t("order.again", { ns: "authenticated" })}
              </MainButton>
            )}
          </MainButtonContainer>
        )}
      </StyledDialogContent>
      <Dialog
        maxWidth={"sm"}
        fullWidth
        open={openDialog}
        onClose={handleClose}
        fullScreen={mobileMode}
        closeAfterTransition={false}
        aria-labelledby="cancel-refund-dialog"
        slots={{
          transition: Transition,
        }}
      >
        {openDialog && (
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
