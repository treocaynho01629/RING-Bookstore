import styled from "@emotion/styled";
import Dialog from "@mui/material/Dialog";
import Skeleton from "@mui/material/Skeleton";
import { lazy, Suspense } from "react";
import {
  StyledDialogTitle,
  TabContentContainer,
} from "../components/custom/ProfileComponents";
import { useNavigate, useOutletContext, useParams } from "react-router";
import {
  useRefreshMutation,
  useSignOutMutation,
} from "@ring/redux/authApiSlice";
import useTitle from "@ring/shared/useTitle";
import Placeholder from "@ring/ui/Placeholder";

const ProfileDetail = lazy(() => import("../components/profile/ProfileDetail"));
const AddressComponent = lazy(
  () => import("../components/address/AddressComponent")
);
const ResetPassComponent = lazy(
  () => import("../components/profile/ResetPassComponent")
);

//#region styled
const PlaceholderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40dvh;
`;
//#endregion

const tempLoad = (
  <>
    <StyledDialogTitle>
      <Skeleton variant="text" sx={{ fontSize: "19px" }} width="50%" />
    </StyledDialogTitle>
    <PlaceholderContainer>
      <Placeholder />
    </PlaceholderContainer>
  </>
);

const Profile = () => {
  const { tab } = useParams();
  const {
    profile,
    loading,
    isSuccess,
    tabletMode,
    mobileMode,
    pending,
    setPending,
  } = useOutletContext();
  const navigate = useNavigate();
  const [refresh, { isLoading: refreshing }] = useRefreshMutation();
  const [logout] = useSignOutMutation();

  //Set title
  useTitle("Hồ sơ");

  const verifyRefreshToken = async () => {
    if (refreshing) return;

    try {
      await refresh().unwrap();
    } catch (error) {
      let errorMsg;
      //Log user out if fail to refresh
      if (error?.status === 500) {
        errorMsg = "Đã xảy ra lỗi xác thực, vui lòng đăng nhập lại!";
      } else if (error?.status === 400 || error?.status === 403) {
        errorMsg = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!";
      }
      await logout().unwrap();
    }
  };

  let content;

  switch (tab ? tab : tabletMode ? "" : "info") {
    case "info":
      content = (
        <ProfileDetail
          {...{
            pending,
            setPending,
            profile,
            loading,
            isSuccess,
            tabletMode,
            verifyRefreshToken,
          }}
        />
      );
      break;
    case "address":
      content = <AddressComponent {...{ pending, setPending, mobileMode }} />;
      break;
    case "password":
      content = (
        <ResetPassComponent
          {...{ pending, setPending, verifyRefreshToken, refreshing }}
        />
      );
      break;
  }

  return (
    <>
      {tabletMode ? (
        <Dialog
          open={tab ? true : tabletMode ? false : true}
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
          <Suspense fallback={tempLoad}>{content}</Suspense>
        </Dialog>
      ) : (
        <TabContentContainer>
          <Suspense fallback={tempLoad}>{content}</Suspense>
        </TabContentContainer>
      )}
    </>
  );
};

export default Profile;
