"use client";

import { Suspense, lazy, useCallback, useState, startTransition } from "react";
import { useGetPreviewShopsQuery } from "@/features/shops/shopsApiSlice";
import { getUserRole } from "@ring/shared/enums/user";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { LocaleType } from "@ring/shared/enums/locales";
import { useLocale, useTranslations } from "next-intl";
import { styled } from "@mui/material/styles";
import { usePathname, useRouter } from "@/i18n/navigation";
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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MuiAppBar, { AppBarProps } from "@mui/material/AppBar";
import NavSetting from "./NavSetting";
import Language from "@mui/icons-material/Language";
import useShop from "@/hooks/useShop";

const ShopSelect = lazy(() => import("./ShopSelect"));

//#region styled
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  backgroundColor: `color-mix(in srgb, ${theme.vars?.palette.background.paper}, transparent 50%) !important`,
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
  const { shop, setShop, clearShop } = useShop();
  const { data: session } = useSession();
  const { role, image, username } = session?.user ?? { role: null, image: null, username: null };
  const roleMeta = role ? getUserRole(role) : null;
  const currLocale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  const [openSetting, setOpenSetting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<undefined | HTMLElement>(undefined);
  const [anchorElLanguage, setAnchorElLanguage] = useState<undefined | HTMLElement>(undefined);
  const openShop = Boolean(anchorEl);
  const openLanguage = Boolean(anchorElLanguage);

  // Shop selection
  const { data, isLoading, isSuccess, isError } = useGetPreviewShopsQuery(undefined, { skip: !shop && !openShop });

  /**
   * Open shop selection
   * @param event - The event object
   */
  const handleOpenShop = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Close shop selection
   */
  const handleCloseShop = useCallback(() => {
    setAnchorEl(undefined);
  }, []);

  /**
   * Toggle drawer
   */
  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  let shopBadgeContent;
  if (isLoading) {
    shopBadgeContent = (
      <>
        <Skeleton variant="circular" width={22} height={22} />
        <Typography variant="body2" color="text.primary" mx={1}>
          {shop?.name ?? t("all.shop")}
        </Typography>
      </>
    );
  } else if (isSuccess) {
    const shopInfo = shop?.id ? data?.entities[shop.id] : null;

    shopBadgeContent = (
      <>
        <StyledAvatar src={shopInfo?.image ?? ""}>
          <Store fontSize="small" />
        </StyledAvatar>
        <Typography variant="body2" color="text.primary" mx={1}>
          {shopInfo?.name ?? t("all.shop")}
        </Typography>
      </>
    );
  } else if (isError) {
    shopBadgeContent = (
      <>
        <StyledAvatar>{!shop ? <Store fontSize="small" /> : <WarningAmber fontSize="small" />}</StyledAvatar>
        <Typography variant="body2" color="text.primary" mx={1}>
          {!shop ? t("all.shop") : t("error.general")}
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
          {t("all.shop")}
        </Typography>
      </>
    );
  }

  /**
   * Change language
   * @param newLocale - The new locale to set
   */
  const handleChangeLanguage = (newLocale: string) => {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: newLocale }
      );
    });
  };

  const handleOpenLanguage = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElLanguage(event.currentTarget);
  };

  const handleCloseLanguage = () => {
    setAnchorElLanguage(undefined);
  };

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
              variant="outlined"
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
                  clearShop,
                  data,
                }}
              />
            )}
          </Suspense>
        </Box>
        <Stack spacing={1} direction="row" sx={{ color: "action.active" }}>
          <IconButton
            id="language-button"
            aria-label="Toggle language menu"
            aria-haspopup="true"
            aria-controls={openLanguage ? "language-menu" : undefined}
            aria-expanded={openLanguage ? "true" : undefined}
            onClick={handleOpenLanguage}
          >
            <Language />
          </IconButton>
          <IconButton
            disableRipple
            disableFocusRipple
            aria-label="Toggle setting drawer"
            onClick={() => setOpenSetting(true)}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={openSetting ? "account-menu" : undefined}
            aria-expanded={openSetting ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }} src={image ?? undefined} />
          </IconButton>
        </Stack>
        <Menu
          id="language-menu"
          anchorEl={anchorElLanguage}
          open={openLanguage}
          onClose={handleCloseLanguage}
          slotProps={{
            list: {
              "aria-labelledby": "language-buttons",
            },
            paper: {
              elevation: 0,
            },
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {Object.values(LocaleType).map((locale, index) => (
            <MenuItem
              key={index}
              selected={currLocale == locale.value}
              onClick={() => handleChangeLanguage(locale.value)}
            >
              {locale.label}
            </MenuItem>
          ))}
        </Menu>
        <NavSetting
          {...{
            open: openSetting,
            setOpen: setOpenSetting,
            image,
            username,
          }}
        />
      </Toolbar>
    </AppBar>
  );
}
