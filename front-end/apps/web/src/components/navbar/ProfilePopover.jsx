import { Link } from "react-router";
import { useState } from "react";
import { LocaleType } from "@ring/shared/enums/locales";
import { useTranslation } from "react-i18next";
import { debounce, upperCase } from "lodash-es";
import Avatar from "@mui/material/Avatar";
import Language from "@mui/icons-material/Language";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import NightlightOutlined from "@mui/icons-material/NightlightOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import Logout from "@mui/icons-material/Logout";
import ContrastOutlined from "@mui/icons-material/ContrastOutlined";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import LockOutlined from "@mui/icons-material/LockOutlined";

const ProfilePopover = ({ image, anchorEl, setAnchorEl, handleClose, handleSignOut, mode, setMode, username }) => {
  const { t, i18n } = useTranslation();
  const [openSetting, setOpenSetting] = useState(null);
  const open = Boolean(anchorEl);

  /**
   * Handle change language
   */
  const handleChangeLanguage = (locale) => {
    setAnchorEl(null);
    i18n.changeLanguage(locale.value);
    setOpenSetting(null);
  };

  /**
   * Handle change theme
   */
  const handleChangeTheme = (theme) => {
    if (setMode) setMode(theme);
    setAnchorEl(null);
    setOpenSetting(null);
  };

  const mainPopover = [
    username ? (
      <Link to={"/profile/detail"} key="profile-detail" title={t("profile.navigation")}>
        <MenuItem>
          <Avatar sx={{ width: 30, height: 30, ml: -0.5, mr: 1.5 }} src={image ?? null} />
          {t("profile.navigation")}
        </MenuItem>
      </Link>
    ) : (
      <Link to={"/auth/register"} key="auth-register" title={t("signup.label")}>
        <MenuItem>
          <Avatar sx={{ width: 30, height: 30, ml: -0.5, mr: 1.5 }} />
          {t("signup.label")}
        </MenuItem>
      </Link>
    ),
    username ? (
      <Link to={"/profile/order"} key="profile-order" title={t("profile.orders")}>
        <MenuItem>
          <ListItemIcon>
            <LocalShippingOutlined fontSize="small" />
          </ListItemIcon>
          {t("profile.orders")}
        </MenuItem>
      </Link>
    ) : (
      <Link to={"/auth/login"} key="auth-login" title={t("login.label")}>
        <MenuItem>
          <ListItemIcon>
            <LockOutlined fontSize="small" />
          </ListItemIcon>
          {t("login.label")}
        </MenuItem>
      </Link>
    ),
    <Divider key="divider" />,
    <MenuItem aria-label={t("theme.description")} key="theme" onClick={(e) => setOpenSetting("theme")}>
      <ListItemIcon>
        {mode === "dark" ? (
          <NightlightOutlined fontSize="small" />
        ) : mode === "light" ? (
          <LightModeOutlined fontSize="small" />
        ) : mode === "system" ? (
          <ContrastOutlined fontSize="small" />
        ) : (
          ""
        )}
      </ListItemIcon>
      {t("theme.label")}
    </MenuItem>,
    <MenuItem key="language" onClick={() => setOpenSetting("language")}>
      <ListItemIcon>
        <Language fontSize="small" />
      </ListItemIcon>
      {t("language.label")}: {upperCase(i18n.language)}
    </MenuItem>,
    username && (
      <MenuItem key="logout" onClick={handleSignOut}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        {t("signout.label")}
      </MenuItem>
    ),
  ];

  const languagePopover = [
    <MenuItem key="language-back" onClick={() => setOpenSetting(null)}>
      <ListItemIcon>
        <KeyboardArrowLeft fontSize="small" />
      </ListItemIcon>
      {t("language.description")}
    </MenuItem>,
    <Divider key="divider" />,
    ...Object.values(LocaleType).map((locale, index) => (
      <MenuItem
        key={index}
        value={locale.value}
        selected={i18n.language == locale.value}
        onClick={() => handleChangeLanguage(locale)}
      >
        {locale.label}
      </MenuItem>
    )),
  ];

  const themePopover = [
    <MenuItem key="theme-back" onClick={() => setOpenSetting(null)}>
      <ListItemIcon>
        <KeyboardArrowLeft fontSize="small" />
      </ListItemIcon>
      {t("theme.description")}
    </MenuItem>,
    <Divider key="divider" />,
    <MenuItem key="theme-light" selected={mode === "light"} onClick={() => handleChangeTheme("light")}>
      <ListItemIcon>
        <LightModeOutlined fontSize="small" />
      </ListItemIcon>
      {t("theme.light")}
    </MenuItem>,
    <MenuItem key="theme-dark" selected={mode === "dark"} onClick={() => handleChangeTheme("dark")}>
      <ListItemIcon>
        <NightlightOutlined fontSize="small" />
      </ListItemIcon>
      {t("theme.dark")}
    </MenuItem>,
    <MenuItem key="theme-system" selected={mode === "system"} onClick={() => handleChangeTheme("system")}>
      <ListItemIcon>
        <ContrastOutlined fontSize="small" />
      </ListItemIcon>
      {t("theme.system")}
    </MenuItem>,
  ];

  return (
    <Menu
      id="mouse-over-popover-profile"
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      onClick={handleClose}
      disableRestoreFocus
      disableScrollLock
      closeAfterTransition
      transitionDuration={150}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      sx={{ pointerEvents: "none" }}
      slotProps={{
        paper: {
          elevation: 2,
          sx: {
            overflow: "visible",
            mt: 1.5,
            borderRadius: 0,
            pointerEvents: "auto",
            minWidth: 250,
          },
          onMouseLeave: handleClose,
        },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: "block",
          position: "absolute",
          top: 0,
          right: 14,
          width: 10,
          height: 10,
          bgcolor: "background.paper",
          transform: "translateY(-50%) rotate(45deg)",
          boxShadow: "none",
          zIndex: 0,
        }}
      />
      {openSetting === "language" ? languagePopover : openSetting === "theme" ? themePopover : mainPopover}
    </Menu>
  );
};

export default ProfilePopover;
