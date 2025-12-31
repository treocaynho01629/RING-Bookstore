import Dialog from "@mui/material/Dialog";
import { TabContentContainer } from "../components/custom/ProfileComponents";
import { useNavigate, useOutletContext } from "react-router";
import { forwardRef, useState } from "react";
import ReviewsList from "../components/review/ReviewsList";
import Slide from "@mui/material/Slide";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Reviews = () => {
  const { tabletMode, mobileMode, pending, setPending } = useOutletContext();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(-1);
  };

  let content = <ReviewsList {...{ mobileMode, tabletMode, pending, setPending, handleClose }} />;

  return (
    <div>
      {tabletMode ? (
        <Dialog
          open={open}
          onClose={handleClose}
          fullScreen={mobileMode}
          scroll="paper"
          maxWidth="md"
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

export default Reviews;
