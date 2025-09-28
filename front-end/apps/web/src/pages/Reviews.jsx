import Dialog from "@mui/material/Dialog";
import { TabContentContainer } from "../components/custom/ProfileComponents";
import { useNavigate, useOutletContext } from "react-router";
import useTitle from "@ring/shared/useTitle";
import ReviewsList from "../components/review/ReviewsList";

const Orders = () => {
  const { tabletMode, mobileMode, pending, setPending } = useOutletContext();
  const navigate = useNavigate();

  //Set title
  useTitle("Đánh giá");

  let content = (
    <ReviewsList {...{ mobileMode, tabletMode, pending, setPending }} />
  );

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

export default Orders;
