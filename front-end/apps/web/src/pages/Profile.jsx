import styled from "@emotion/styled";
import Skeleton from "@mui/material/Skeleton";
import { lazy, Suspense, useState, useEffect } from "react";
import { StyledDialogTitle } from "../components/custom/ProfileComponents";
import { useOutletContext, useParams } from "react-router";
import { useRefreshMutation } from "@ring/redux/authApiSlice";
import { useTranslation } from "react-i18next";
import Placeholder from "@ring/ui/Placeholder";
import useLogout from "../hooks/useLogout";

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

const Profile = () => {
  const { tab } = useParams();
  const { t } = useTranslation();
  const { profile, loading, isSuccess, tabletMode, mobileMode, pending, setPending, setOpen } = useOutletContext();
  const [refresh, { isLoading: refreshing }] = useRefreshMutation();
  const [currTab, setCurrTab] = useState("info");
  const signout = useLogout();

  useEffect(() => {
    setOpen(!!tab);
    if (tab) setCurrTab(tab);
  }, [tab]);

  /**
   * Verify refresh token
   */
  const verifyRefreshToken = async () => {
    if (refreshing) return;

    try {
      await refresh().unwrap();
    } catch (error) {
      let errorMsg;
      // Log user out if fail to refresh
      if (error?.status === 500) {
        errorMsg = t("error.auth.validate");
      } else if (error?.status === 400 || error?.status === 403) {
        errorMsg = t("error.auth.expired");
      }
      await signout(errorMsg);
    }
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
        <ProfileDetail {...{ pending, setPending, profile, loading, isSuccess, tabletMode, verifyRefreshToken }} />
      ) : (
        <PlaceholderContent tab={currTab} />
      );
      break;
    }
  }

  return <Suspense fallback={<PlaceholderContent tab={currTab} />}>{content}</Suspense>;
};

export default Profile;
