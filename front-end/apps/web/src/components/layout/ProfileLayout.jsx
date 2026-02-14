import ProfileTabsList from "../profile/ProfileTabsList";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useGetProfileQuery } from "../../features/users/usersApiSlice";
import { useMediaQuery, Grid, Dialog } from "@mui/material";
import { Suspense, lazy, useState, forwardRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TabContentContainer } from "../custom/ProfileComponents";
import Slide from "@mui/material/Slide";

const PendingModal = lazy(() => import("@ring/ui/PendingModal"));

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export default function ProfileLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  // Fetch current profile
  const { data, isLoading, isSuccess, error } = useGetProfileQuery();

  /**
   * Handle close dialog
   */
  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  useEffect(() => {
    if (pathname !== "/profile/detail") setOpen(true);
  }, [pathname]);

  return (
    <Grid container columnSpacing={{ xs: 1, md_lg: 3 }} sx={{ marginTop: { xs: 0, md: 4 } }}>
      <Grid size={{ xs: 12, md: 3.75, lg: 3 }} display="flex" justifyContent="center">
        <ProfileTabsList {...{ profile: data, loading: isLoading, error, tabletMode }} />
      </Grid>
      <Grid size="grow">
        {pending && (
          <Suspense fallBack={null}>
            <PendingModal open={pending} message={t("pending")} />
          </Suspense>
        )}
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
                open,
                setOpen,
              }}
            />
          </Dialog>
        ) : (
          <TabContentContainer>
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
                open,
                setOpen,
              }}
            />
          </TabContentContainer>
        )}
      </Grid>
    </Grid>
  );
}
