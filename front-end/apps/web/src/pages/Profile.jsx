import styled from "@emotion/styled";
import Dialog from "@mui/material/Dialog";
import Skeleton from "@mui/material/Skeleton";
import { lazy, Suspense, forwardRef, useState, useEffect } from "react";
import { StyledDialogTitle, TabContentContainer } from "../components/custom/ProfileComponents";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { useRefreshMutation, useSignOutMutation } from "@ring/redux/authApiSlice";
import useTitle from "@ring/shared/useTitle";
import Placeholder from "@ring/ui/Placeholder";
import Slide from "@mui/material/Slide";

const ProfileDetail = lazy(() => import("../components/profile/ProfileDetail"));
const AddressComponent = lazy(() => import("../components/address/AddressComponent"));
const ResetPassComponent = lazy(() => import("../components/profile/ResetPassComponent"));

//#region styled
const PlaceholderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40dvh;

  &.tall {
    height: 70dvh;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    height: 100dvh;
  }
`;
//#endregion

const PlaceholderContent = ({ tab }) => {
  return (
    <>
      <StyledDialogTitle>
        <Skeleton variant="text" sx={{ fontSize: "19px" }} width="50%" />
      </StyledDialogTitle>
      <PlaceholderContainer className={tab === "address" ? "tall" : ""}>
        <Placeholder />
      </PlaceholderContainer>
    </>
  );
};

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Profile = () => {
  const { tab } = useParams();
  const { profile, loading, isSuccess, tabletMode, mobileMode, pending, setPending } = useOutletContext();
  const [refresh, { isLoading: refreshing }] = useRefreshMutation();
  const [logout] = useSignOutMutation();
  const [open, setOpen] = useState(false);
  const [currTab, setCurrTab] = useState("info");
  const navigate = useNavigate();

  // Set title
  //useTitle("Hồ sơ");

  useEffect(() => {
    setOpen(!!tab);
    if (tab) setCurrTab(tab);
  }, [tab]);

  const verifyRefreshToken = async () => {
    if (refreshing) return;

    try {
      await refresh().unwrap();
    } catch (error) {
      let errorMsg;
      // Log user out if fail to refresh
      if (error?.status === 500) {
        errorMsg = "Đã xảy ra lỗi xác thực, vui lòng đăng nhập lại!";
      } else if (error?.status === 400 || error?.status === 403) {
        errorMsg = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!";
      }
      await logout().unwrap();
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(-1);
  };

  let content;

  switch (currTab) {
    case "info":
      content = (
        <ProfileDetail
          {...{
            pending,
            setPending,
            profile,
            loading,
            isSuccess,
            mobileMode,
            tabletMode,
            verifyRefreshToken,
            handleClose,
          }}
        />
      );
      break;
    case "address":
      content = <AddressComponent {...{ pending, setPending, mobileMode }} />;
      break;
    case "password":
      content = <ResetPassComponent {...{ pending, setPending, verifyRefreshToken, refreshing }} />;
      break;
    default: {
      content = !tabletMode ? (
        <ProfileDetail
          {...{ pending, setPending, profile, loading, isSuccess, tabletMode, verifyRefreshToken, handleClose }}
        />
      ) : (
        <PlaceholderContent tab={currTab} />
      );
      break;
    }
  }

  return tabletMode ? (
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
      <Suspense fallback={<PlaceholderContent tab={currTab} />}>{content}</Suspense>
    </Dialog>
  ) : (
    <TabContentContainer>
      <Suspense fallback={<PlaceholderContent tab={currTab} />}>{content}</Suspense>
    </TabContentContainer>
  );
};

export default Profile;
