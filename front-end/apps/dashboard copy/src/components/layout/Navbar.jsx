"use client";

import { Suspense, lazy, useCallback, useState } from "react";
import {
  Toolbar,
  IconButton,
  Stack,
  Avatar,
  Box,
  Chip,
  Typography,
  Button,
  Skeleton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Store,
  UnfoldMore,
  WarningAmber,
} from "@mui/icons-material";
import { useGetPreviewShopsQuery } from "../../features/shops/shopsApiSlice";
import { getUserRole } from "@ring/shared";
import { useAppStore } from "@ring/redux";
import MuiAppBar from "@mui/material/AppBar";
import NavSetting from "./NavSetting";
import styled from "@emotion/styled";

const ShopSelect = lazy(() => import("./ShopSelect"));

//#region styled
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: `color-mix(in srgb, ${theme.vars.palette.background.default}, transparent 50%) !important`,
  backdropFilter: "blur(10px)",

  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const ShopButton = styled(Button)`
  display: flex;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
`;

const StyledAvatar = styled(Avatar)`
  width: 22px;
  height: 22px;
`;
//#endregion

export default function Navbar({ open, setOpen }) {
  const store = useAppStore();
  const UserRole = getUserRole(store);

  const { image, username, roles, shop, setShop } = useAuth();
  const [openSetting, setOpenSetting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(undefined);
  const openShop = Boolean(anchorEl);
  const roleIndexes = roles?.map((r) => Object.keys(UserRole).indexOf(r)) || [
    0,
  ];
  const currRole = UserRole[Object.keys(UserRole)[Math.max(...roleIndexes)]];

  //Shop select
  const { data, isLoading, isSuccess, isError } = useGetPreviewShopsQuery(
    {},
    { skip: !shop && !openShop }
  );

  const handleOpenShop = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseShop = useCallback(() => {
    setAnchorEl(null);
  }, [anchorEl]);
  const handleToggleDrawer = () => {
    setOpen((prev) => !prev);
  };

  let shopBadgeContent;

  if (isLoading && !!shop) {
    shopBadgeContent = (
      <>
        <Skeleton variant="circular" width={22} height={22} />
        <Typography variant="body2" color="text.primary" mx={1}>
          <Skeleton variant="text" width={100} />
        </Typography>
      </>
    );
  } else if (isSuccess) {
    const shopInfo = data?.entities[shop] ?? null;

    shopBadgeContent = (
      <>
        <StyledAvatar src={shopInfo?.image ?? null}>
          <Store fontSize="small" />
        </StyledAvatar>
        <Typography variant="body2" color="text.primary" mx={1}>
          {shopInfo?.name ?? "Tổng thể"}
        </Typography>
      </>
    );
  } else if (isError) {
    shopBadgeContent = (
      <>
        <StyledAvatar>
          {!shop ? (
            <Store fontSize="small" />
          ) : (
            <WarningAmber fontSize="small" />
          )}
        </StyledAvatar>
        <Typography variant="body2" color="text.primary" mx={1}>
          {!shop ? "Tổng thể" : "Đã xảy ra lỗi"}
        </Typography>
      </>
    );
  } else {
    shopBadgeContent = (
      <>
        <StyledAvatar>
          <Store fontSize="small" />
        </StyledAvatar>
        <Typography variant="body2" color="text.primary" mx={1}>
          Tổng thể
        </Typography>
      </>
    );
  }

  return (
    <AppBar position="sticky" open={open} elevation={0}>
      <Toolbar
        disableGutters
        sx={{ justifyContent: "space-between", padding: "5px 10px" }}
      >
        <Box display="flex" alignItems="center">
          <IconButton aria-label="open drawer" onClick={handleToggleDrawer}>
            <MenuIcon />
          </IconButton>
          <ShopButton
            onClick={handleOpenShop}
            disabled={isLoading}
            color="default"
          >
            {shopBadgeContent}
            <Chip
              label={currRole?.label ?? "Đang tải"}
              color={currRole?.color ?? "default"}
              size="small"
              sx={{ fontWeight: 450, mr: 1 }}
            />
            <UnfoldMore fontSize="16px" />
          </ShopButton>
          <Suspense fallback={null}>
            {anchorEl !== undefined && (
              <ShopSelect
                {...{
                  open: openShop,
                  anchorEl,
                  handleClose: handleCloseShop,
                  shop,
                  setShop,
                  data,
                }}
              />
            )}
          </Suspense>
        </Box>
        <Stack spacing={1} direction="row" sx={{ color: "action.active" }}>
          <IconButton
            disableRipple
            disableFocusRipple
            onClick={() => setOpenSetting(true)}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={openSetting ? "account-menu" : undefined}
            aria-expanded={openSetting ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }} src={image ?? null} />
          </IconButton>
        </Stack>
        <NavSetting
          {...{ open: openSetting, setOpen: setOpenSetting, image, username }}
        />
      </Toolbar>
    </AppBar>
  );
}
