"use client";

import { Suspense, lazy, useCallback, useState } from "react";
import { useGetPreviewShopsQuery } from "../../features/shops/shopsApiSlice";
import { getUserRole } from "@ring/shared/enums/user";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import Store from "@mui/icons-material/Store";
import UnfoldMore from "@mui/icons-material/UnfoldMore";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import MuiAppBar, { AppBarProps } from "@mui/material/AppBar";
import useShop from "../../hooks/useShop";
import NavSetting from "./NavSetting";

const ShopSelect = lazy(() => import("./ShopSelect"));

//#region styled
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  backgroundColor: `color-mix(in srgb, ${theme.vars?.palette.background.default}, transparent 50%) !important`,
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

interface NavBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function NavBar({ open, setOpen }: NavBarProps) {
  const t = useTranslations();
  const { shop, setShop } = useShop();
  const { data: session } = useSession();
  const { role, image, username } = session?.user ?? { role: null, image: null, username: null };
  const roleMeta = role ? getUserRole(role) : null;

  const [openSetting, setOpenSetting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<undefined | HTMLElement>(undefined);
  const openShop = Boolean(anchorEl);

  // Shop select
  const { data, isLoading, isSuccess, isError } = useGetPreviewShopsQuery(undefined, { skip: !shop && !openShop });

  const handleOpenShop = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseShop = useCallback(() => {
    setAnchorEl(undefined);
  }, [anchorEl]);
  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  let shopBadgeContent;

  if (isLoading && !shop) {
    shopBadgeContent = (
      <>
        <Skeleton variant="circular" width={22} height={22} />
        <Typography variant="body2" color="text.primary" mx={1}>
          <Skeleton variant="text" width={100} />
        </Typography>
      </>
    );
  } else if (isSuccess) {
    const shopInfo = data?.entities[shop as number] ?? null;

    shopBadgeContent = (
      <>
        <StyledAvatar src={shopInfo?.image ?? ""}>
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
        <StyledAvatar>{!shop ? <Store fontSize="small" /> : <WarningAmber fontSize="small" />}</StyledAvatar>
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
    <AppBar position="sticky" elevation={0}>
      <Toolbar disableGutters sx={{ justifyContent: "space-between", padding: "5px 10px" }}>
        <Box display="flex" alignItems="center">
          <IconButton aria-label="open drawer" onClick={handleToggleDrawer}>
            <MenuIcon />
          </IconButton>
          <ShopButton onClick={handleOpenShop} disabled={isLoading}>
            {shopBadgeContent}
            <Chip
              label={t(roleMeta?.label ?? "loading")}
              color={(roleMeta?.color as any) ?? "default"}
              size="small"
              sx={{ fontWeight: 450, mr: 1 }}
            />
            <UnfoldMore />
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
            <Avatar sx={{ width: 32, height: 32 }} src={image ?? undefined} />
          </IconButton>
        </Stack>
        <NavSetting
          {...{
            open: openSetting,
            setOpen: setOpenSetting,
            image: image,
            username: username,
          }}
        />
      </Toolbar>
    </AppBar>
  );
}
