import styled from "@emotion/styled";
import { NavLink } from "react-router";
import { LogoImage } from "@ring/ui/Components";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LocaleType } from "@ring/shared/enums/locales";
import ListItemIcon, { listItemIconClasses } from "@mui/material/ListItemIcon";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import Logout from "@mui/icons-material/Logout";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import Storefront from "@mui/icons-material/Storefront";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import NightlightOutlined from "@mui/icons-material/NightlightOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import ContrastOutlined from "@mui/icons-material/ContrastOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import Collapse from "@mui/material/Collapse";
import LanguageIcon from "@mui/icons-material/Language";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Badge from "@mui/material/Badge";

//#region styled
const DrawerLogo = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  width: 100%;
`;

const DrawerContainer = styled(Box)`
  position: relative;
  padding: ${({ theme }) => theme.spacing(1.5)};
  height: 100%;
  width: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.breakpoints.up("xs_sm")} {
    width: 400px;
  }
`;

const StyledIconButton = styled(IconButton)`
  transition: transform 0.2s ease-in-out;

  &.selected {
    transform: rotate(180deg) translateZ(0);
  }
`;

const StyledItemButton = styled(ListItemButton)`
  padding: ${({ theme }) => theme.spacing(0.5, 1)};

  &.Mui-selected {
    text-decoration: underline;
  }

  &.settings {
    padding: 0;
  }

  &.options {
    padding: ${({ theme }) => `0 ${theme.spacing(1)}`};
    margin-right: 30%;
    transition: all 0.25s ease-in-out;

    &.rtl {
      margin-left: 30%;
      margin-right: auto;
      text-align: right;
    }
  }

  .${listItemIconClasses.root} {
    min-width: 40px;
  }
`;

const HeaderContainer = styled.div``;

const Wave = styled.span`
  position: absolute;
  width: 120%;
  aspect-ratio: 1/1;
  border-radius: 43%;
  top: 0;
  left: 14%;
  background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} calc(h - 30) s l / 0.2);

  &:nth-of-type(2) {
    background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} calc(h + 30) s l / 0.3);
    left: 7%;
    transform: scale(0.9) rotate(120deg);
  }

  &:nth-of-type(3) {
    background: hsl(from ${({ theme }) => theme.vars.palette.primary.main} h s l / 0.4);
    left: 0;
    transform: scale(0.8) rotate(240deg);
  }
`;

const WaveContainer = styled.section`
  position: absolute;
  top: -180px;
  left: -30%;
  width: 100%;
  z-index: -1;

  ${({ theme }) => theme.breakpoints.up("xs_sm")} {
    top: -280px;
  }
`;

const StyledPopupList = styled(List)`
  border-top: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  border-bottom: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  padding: ${({ theme }) => theme.spacing(1.5)};
`;
//#endregion

const NavDrawer = ({
  location,
  openDrawer,
  handleOpen,
  handleClose,
  username,
  image,
  products,
  handleSignOut,
  mode,
  setMode,
}) => {
  const { t } = useTranslation();
  const [setting, setSetting] = useState("");
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();

  /**
   * Handle change language
   */
  const handleChangeLanguage = (locale) => {
    i18n.changeLanguage(locale.value);
    setOpen(false);
  };

  /**
   * Handle change theme
   */
  const handleChangeTheme = (theme) => {
    if (setMode) setMode(theme);
    setOpen(false);
  };

  const handleToggleTheme = () => {
    if (setting === "theme") {
      setOpen((prev) => !prev);
    } else {
      setOpen(false);
      setTimeout(() => {
        setSetting("theme");
        setOpen(true);
      }, 250);
    }
  };

  const handleToggleLang = () => {
    if (setting === "lang") {
      setOpen((prev) => !prev);
    } else {
      setOpen(false);
      setTimeout(() => {
        setSetting("lang");
        setOpen(true);
      }, 250);
    }
  };

  return (
    <SwipeableDrawer
      anchor="left"
      open={openDrawer}
      onOpen={handleOpen}
      onClose={handleClose}
      disableBackdropTransition
      disableDiscovery
      swipeAreaWidth={8}
      disableSwipeToOpen={false}
    >
      <DrawerContainer>
        <HeaderContainer>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <NavLink to={"/"} onClick={handleClose}>
              <DrawerLogo>
                <LogoImage src="/full-logo.svg" className="contrast" alt="RING! Logo" />
              </DrawerLogo>
            </NavLink>
            <IconButton onClick={handleClose}>
              <KeyboardArrowLeft fontSize="medium" />
            </IconButton>
          </Box>
          {username ? (
            <NavLink to={"/profile/detail"}>
              <ListItem disablePadding>
                <StyledItemButton onClick={handleClose}>
                  <ListItemIcon>
                    <Avatar sx={{ width: 45, height: 45, mr: 2 }} src={image ?? null} />
                  </ListItemIcon>
                  <ListItemText primary={username} secondary={t("profile.navigation")} />
                </StyledItemButton>
              </ListItem>
            </NavLink>
          ) : (
            <NavLink to={"/auth/register"} state={{ from: location }} title={t("signup.label")}>
              <ListItem disablePadding onClick={handleClose}>
                <StyledItemButton onClick={handleClose}>
                  <ListItemIcon>
                    <Avatar sx={{ width: 45, height: 45, mr: 2 }} />
                  </ListItemIcon>
                  <ListItemText primary={t("signup.label")} secondary={t("signup.title")} />
                </StyledItemButton>
              </ListItem>
            </NavLink>
          )}
          {username ? (
            <ListItem disablePadding>
              <StyledItemButton onClick={handleSignOut}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary={t("signout.label")} />
              </StyledItemButton>
            </ListItem>
          ) : (
            <NavLink to={"/auth/login"} state={{ from: location }} title={t("login.label")}>
              <ListItem disablePadding onClick={handleClose}>
                <StyledItemButton>
                  <ListItemIcon>
                    <LockOutlined />
                  </ListItemIcon>
                  <ListItemText primary={t("login.label")} />
                </StyledItemButton>
              </ListItem>
            </NavLink>
          )}
        </HeaderContainer>
        <Divider sx={{ my: 1.5 }} />
        <List>
          <NavLink to={"/"} onClick={handleClose}>
            {({ isActive }) => (
              <ListItem disablePadding>
                <StyledItemButton selected={isActive} onClick={handleClose}>
                  <ListItemIcon>
                    <HomeOutlined />
                  </ListItemIcon>
                  <ListItemText primary={t("home")} />
                </StyledItemButton>
              </ListItem>
            )}
          </NavLink>
          <NavLink to={"/store"} onClick={handleClose}>
            {({ isActive }) => (
              <ListItem disablePadding>
                <StyledItemButton selected={isActive} onClick={handleClose}>
                  <ListItemIcon>
                    <Storefront />
                  </ListItemIcon>
                  <ListItemText primary={t("shop.explore")} />
                </StyledItemButton>
              </ListItem>
            )}
          </NavLink>
          <NavLink to={"/cart"} onClick={handleClose}>
            {({ isActive }) => (
              <ListItem disablePadding onClick={handleClose}>
                <StyledItemButton selected={isActive} onClick={handleClose}>
                  <ListItemIcon>
                    <Badge badgeContent={products?.length} color="primary">
                      <ShoppingCartOutlined />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText primary={t("cart.label")} />
                </StyledItemButton>
              </ListItem>
            )}
          </NavLink>
          <NavLink onClick={handleClose}>
            <ListItem disablePadding onClick={handleClose}>
              <StyledItemButton onClick={handleClose}>
                <ListItemIcon>
                  <NotificationsOutlined />
                </ListItemIcon>
                <ListItemText primary={t("notification")} />
              </StyledItemButton>
            </ListItem>
          </NavLink>
          {username && (
            <NavLink to={"/profile/order"} onClick={handleClose}>
              {({ isActive }) => (
                <ListItem disablePadding>
                  <StyledItemButton selected={isActive} onClick={handleClose}>
                    <ListItemIcon>
                      <LocalShippingOutlined />
                    </ListItemIcon>
                    <ListItemText primary={t("profile.orders")} />
                  </StyledItemButton>
                </ListItem>
              )}
            </NavLink>
          )}
        </List>
        <Divider sx={{ my: 1.5 }} />
        <List sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <Collapse in={open} orientation="vertical" timeout={250}>
            <StyledPopupList component="div" disablePadding>
              {setting === "theme" ? (
                <>
                  <StyledItemButton
                    selected={mode === "light"}
                    className="options rtl"
                    onClick={() => handleChangeTheme("light")}
                  >
                    <ListItemIcon>
                      <LightModeOutlined />
                    </ListItemIcon>
                    <ListItemText primary={t("theme.light")} />
                  </StyledItemButton>
                  <StyledItemButton
                    selected={mode === "dark"}
                    className="options rtl"
                    onClick={() => handleChangeTheme("dark")}
                  >
                    <ListItemIcon>
                      <NightlightOutlined />
                    </ListItemIcon>
                    <ListItemText primary={t("theme.dark")} />
                  </StyledItemButton>
                  <StyledItemButton
                    selected={mode === "system"}
                    className="options rtl"
                    onClick={() => handleChangeTheme("system")}
                  >
                    <ListItemIcon>
                      <ContrastOutlined />
                    </ListItemIcon>
                    <ListItemText primary={t("theme.system")} />
                  </StyledItemButton>
                </>
              ) : setting === "lang" ? (
                <>
                  {Object.values(LocaleType).map((locale, index) => (
                    <StyledItemButton
                      className="options"
                      key={index}
                      selected={i18n.language == locale.value}
                      onClick={() => handleChangeLanguage(locale)}
                    >
                      <ListItemText primary={locale.label} />
                    </StyledItemButton>
                  ))}{" "}
                </>
              ) : null}
            </StyledPopupList>
          </Collapse>
          <ListItem
            secondaryAction={
              <StyledIconButton
                className={setting === "theme" && open ? "selected" : ""}
                onClick={handleToggleTheme}
                edge="end"
                aria-label="Theme"
              >
                {setting === "theme" && open ? (
                  <KeyboardArrowUp />
                ) : mode === "dark" ? (
                  <NightlightOutlined />
                ) : mode === "light" ? (
                  <LightModeOutlined />
                ) : mode === "system" ? (
                  <ContrastOutlined />
                ) : (
                  ""
                )}
              </StyledIconButton>
            }
            disablePadding
          >
            <ListItemIcon>
              <StyledIconButton
                className={setting === "lang" && open ? "selected" : ""}
                onClick={handleToggleLang}
                aria-label="Language"
              >
                {setting === "lang" && open ? <KeyboardArrowUp /> : <LanguageIcon />}
              </StyledIconButton>
            </ListItemIcon>
            <ListItemText primary={i18n.language} sx={{ ml: -2, textTransform: "uppercase" }} />
          </ListItem>
        </List>
        <WaveContainer>
          <Wave></Wave>
          <Wave></Wave>
          <Wave></Wave>
        </WaveContainer>
      </DrawerContainer>
    </SwipeableDrawer>
  );
};

export default NavDrawer;
