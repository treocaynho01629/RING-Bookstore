import useTitle from "@ring/shared/useTitle";
import { idFormatter } from "@ring/shared/utils/convert";
import { Navigate, useOutletContext, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useGetOrderDetailQuery } from "../features/orders/ordersApiSlice";
import { useState } from "react";
import OrderDetailComponent from "../components/order/OrderDetailComponent";

const OrderDetail = () => {
  const { id } = useParams(); // Order id
  const { t } = useTranslation();
  const { tabletMode, mobileMode } = useOutletContext();
  const [pending, setPending] = useState(false);
  const { data, isError, error } = useGetOrderDetailQuery(id);

  // Set title
  useTitle(`${t("order.detail")} ${idFormatter(id)}`);

  return (
    <>
      <OrderDetailComponent
        {...{
          order: data,
          pending,
          setPending,
          tabletMode,
          mobileMode,
        }}
      />
      {isError && error?.status === 404 && <Navigate to={"/missing"} replace />}
    </>
  );
};

export default OrderDetail;
