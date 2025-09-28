import useTitle from "@ring/shared/useTitle";
import Dialog from "@mui/material/Dialog";
import { useNavigate, useOutletContext } from "react-router";
import { TabContentContainer } from "../components/custom/ProfileComponents";
import OrdersList from "../components/order/OrdersList";

const Orders = () => {
  const { tabletMode, mobileMode, pending, setPending } = useOutletContext();
  const navigate = useNavigate();

  //Set title
  useTitle("Đơn hàng");

  let content = (
    <OrdersList {...{ pending, setPending, mobileMode, tabletMode }} />
  );

  return (
    <>
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
    </>
  );
};

export default Orders;
