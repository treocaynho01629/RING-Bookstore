import useTitle from "@ring/shared/useTitle";
import Dialog from "@mui/material/Dialog";
import { useNavigate, useOutletContext } from "react-router";
import { TabContentContainer } from "../components/custom/ProfileComponents";
import { forwardRef, useState } from "react";
import CouponsList from "../components/coupon/CouponsList";
import Slide from "@mui/material/Slide";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Coupons = () => {
  const { tabletMode, mobileMode } = useOutletContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  // Set title
  useTitle("Mã giảm giá");

  const handleClose = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(-1);
  };

  let content = <CouponsList mobileMode={mobileMode} tabletMode={tabletMode} handleClose={handleClose} />;

  return (
    <>
      {tabletMode ? (
        <Dialog
          open={open}
          onClose={handleClose}
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
    </>
  );
};

export default Coupons;
