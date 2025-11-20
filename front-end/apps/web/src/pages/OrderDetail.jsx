import useTitle from "@ring/shared/useTitle";
import { idFormatter } from "@ring/shared/utils/convert";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router";
import { TabContentContainer } from "../components/custom/ProfileComponents";
import { useTranslation } from "react-i18next";
import { useGetOrderDetailQuery } from "../features/orders/ordersApiSlice";
import { forwardRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import OrderDetailComponent from "../components/order/OrderDetailComponent";
import Slide from "@mui/material/Slide";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const OrderDetail = () => {
  const { id } = useParams(); // Order id
  const { t } = useTranslation();
  const { tabletMode, mobileMode } = useOutletContext();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const { data, isLoading, isSuccess, isError, error } = useGetOrderDetailQuery(id);

  // Set title
  useTitle(`${t("order.detail")} ${idFormatter(id)}`);

  let content = (
    <OrderDetailComponent
      {...{
        order: data,
        pending,
        setPending,
        isLoading,
        isError,
        error,
        tabletMode,
        mobileMode,
      }}
    />
  );

  if (isLoading) {
    content = (
      <OrderDetailComponent
        {...{
          tabletMode,
          mobileMode,
        }}
      />
    );
  } else if (isSuccess) {
    content = (
      <OrderDetailComponent
        {...{
          order: data,
          pending,
          setPending,
          isLoading,
          tabletMode,
          mobileMode,
        }}
      />
    );
  } else if (isError && error?.status === 404) {
    content = <Navigate to={"/missing"} replace />;
  } else {
    content = (
      <OrderDetailComponent
        {...{
          tabletMode,
          mobileMode,
        }}
      />
    );
  }

  return (
    <div>
      {tabletMode ? (
        <Dialog
          open={tabletMode}
          onClose={() => navigate(-1)}
          fullScreen={mobileMode}
          scroll={"paper"}
          maxWidth={"md"}
          fullWidth
          closeAfterTransition={false}
          slots={{
            transition: Transition,
          }}
          slotProps={{
            paper: {
              elevation: 0,
            },
          }}
        >
          {content}
        </Dialog>
      ) : (
        <TabContentContainer>{content}</TabContentContainer>
      )}
    </div>
  );
};

export default OrderDetail;
