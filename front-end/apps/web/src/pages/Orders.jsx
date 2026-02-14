import { useOutletContext } from "react-router";
import OrdersList from "../components/order/OrdersList";

const Orders = () => {
  const { tabletMode, mobileMode, pending, setPending } = useOutletContext();
  return <OrdersList {...{ pending, setPending, mobileMode, tabletMode }} />;
};

export default Orders;
