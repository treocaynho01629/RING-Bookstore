import ProfileTabsList from "../profile/ProfileTabsList";
import { Outlet, useMatch } from "react-router";
import { useGetProfileQuery } from "../../features/users/usersApiSlice";
import { useMediaQuery, Grid } from "@mui/material";
import { Suspense, lazy, useState } from "react";

const PendingModal = lazy(() => import("@ring/ui/PendingModal"));

export default function ProfileLayout() {
  const showTabs = useMatch("/profile/detail");
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [pending, setPending] = useState(false);

  // Fetch current profile
  const { data, isLoading, isSuccess, error } = useGetProfileQuery();

  return (
    <Grid
      container
      columnSpacing={{ xs: 1, md_lg: 3 }}
      sx={{ marginTop: { xs: 0, md: 4 } }}
    >
      {(!mobileMode || showTabs) && (
        <Grid
          size={{ xs: 12, md: 3.75, lg: 3 }}
          display="flex"
          justifyContent="center"
        >
          <ProfileTabsList
            {...{ profile: data, loading: isLoading, error, tabletMode }}
          />
        </Grid>
      )}
      <Grid size="grow">
        {pending && (
          <Suspense fallBack={null}>
            <PendingModal open={pending} message="Đang gửi yêu cầu..." />
          </Suspense>
        )}
        <Outlet
          context={{
            profile: data,
            loading: isLoading,
            isSuccess,
            error,
            tabletMode,
            mobileMode,
            pending,
            setPending,
          }}
        />
      </Grid>
    </Grid>
  );
}
