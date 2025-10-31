import useTitle from "@ring/shared/useTitle";
import { idFormatter } from "@ring/shared/utils/convert";
import {
  Navigate,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import { TabContentContainer } from "../components/custom/ProfileComponents";
import { useGetOrderDetailQuery } from "../features/orders/ordersApiSlice";
import Dialog from "@mui/material/Dialog";
import { useState } from "react";
import OrderDetailComponent from "../components/order/OrderDetailComponent";

const OrderDetail = () => {
  const { id } = useParams(); //Order id
  const { tabletMode, mobileMode } = useOutletContext();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const { data, isLoading, isSuccess, isError, error } =
    useGetOrderDetailQuery(id);

  // Set title
  useTitle(`Chi tiết đơn hàng ${idFormatter(id)}`);

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
