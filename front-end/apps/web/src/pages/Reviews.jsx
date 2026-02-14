import { useOutletContext } from "react-router";
import ReviewsList from "../components/review/ReviewsList";

const Reviews = () => {
  const { tabletMode, mobileMode, pending, setPending } = useOutletContext();
  return <ReviewsList {...{ mobileMode, tabletMode, pending, setPending }} />;
};

export default Reviews;
