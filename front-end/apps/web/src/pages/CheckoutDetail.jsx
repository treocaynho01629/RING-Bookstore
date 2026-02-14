import useTitle from "@ring/shared/useTitle";
import { idFormatter } from "@ring/shared/utils/convert";
import { Navigate, useOutletContext, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useGetReceiptDetailQuery } from "../features/orders/ordersApiSlice";
import { useState } from "react";
import CheckoutDetailComponent from "../components/order/CheckoutDetailComponent";

const CheckoutDetail = () => {
  const { id } = useParams(); // Order id
  const { t } = useTranslation();
  const { tabletMode, mobileMode } = useOutletContext();
  const [pending, setPending] = useState(false);
  const { data, isError, error } = useGetReceiptDetailQuery(id);

  // Set title
  useTitle(`${t("order.checkout")} ${idFormatter(id)}`);

  return (
    <>
      <CheckoutDetailComponent
        {...{
          receipt: data,
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

export default CheckoutDetail;
