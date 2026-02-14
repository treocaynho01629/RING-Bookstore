import { useOutletContext } from "react-router";
import CouponsList from "../components/coupon/CouponsList";

const Coupons = () => {
  const { tabletMode, mobileMode } = useOutletContext();
  return <CouponsList mobileMode={mobileMode} tabletMode={tabletMode} />;
};

export default Coupons;
