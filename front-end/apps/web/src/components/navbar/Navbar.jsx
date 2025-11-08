import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, matchRoutes, useLocation, useMatch } from "react-router";
import { LogoImage } from "@ring/ui/Components";
import { debounce } from "lodash-es";
import { useColorScheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import Mail from "@mui/icons-material/Mail";
import Phone from "@mui/icons-material/Phone";
import Facebook from "@mui/icons-material/Facebook";
import YouTube from "@mui/icons-material/YouTube";
import LinkedIn from "@mui/icons-material/LinkedIn";
import Twitter from "@mui/icons-material/Twitter";
import Menu from "@mui/icons-material/Menu";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Storefront from "@mui/icons-material/Storefront";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import Search from "@mui/icons-material/Search";
import SearchOff from "@mui/icons-material/SearchOff";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import useMediaQuery from "@mui/material/useMediaQuery";
import Grid from "@mui/material/Grid";
import useCart from "../../hooks/useCart";
import styled from "@emotion/styled";
import SearchInput from "./SearchInput";

const NavDrawer = lazy(() => import("./NavDrawer"));
const MiniCart = lazy(() => import("./MiniCart"));
const ProfilePopover = lazy(() => import("./ProfilePopover"));

//#region styled
const Wrapper = styled.div`
  padding: 5px;

  ${({ theme }) => theme.breakpoints.up("sm_md")} {
    padding: 5px 20px;
    width: 750px;
    margin-left: auto;
    margin-right: auto;
  }

  ${({ theme }) => theme.breakpoints.up("md_lg")} {
    width: 970px;
  }

  ${({ theme }) => theme.breakpoints.up("lg")} {
    width: 1170px;
  }
`;

const TopHeader = styled.div`
  padding: 0 30px;
  background-color: ${({ theme }) => theme.vars.palette.divider};
  justify-content: space-between;
  font-size: 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  margin-bottom: -1px;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;
  }
`;

const ContactContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  ${({ theme }) => theme.breakpoints.down("md")} {
    justify-content: center;
  }
`;

const SocialContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  ${({ theme }) => theme.breakpoints.down("md")} {
    justify-content: center;
  }
`;

const Contact = styled.p`
  height: 35px;
  font-size: 12px;
  margin: 0;
  margin-right: 20px;
  font-weight: 400;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  justify-content: center;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;

const Social = styled.p`
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  background-color: "transparent";
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 0;
  padding: 0 10px;
  height: 35px;
  transition: all 0.5s ease;
  cursor: pointer;

  svg {
    font-size: 18px;
  }

  &:hover {
    background-color: #${({ color }) => color};
    color: white;
  }
`;

const Logo = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  margin: 5px 10px 5px 15px;
  white-space: nowrap;
  overflow: hidden;

  &.hidden {
    ${({ theme }) => theme.breakpoints.down("md")} {
      width: 0;
    }
  }

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    margin: 5px 0px 5px 0px;
  }
`;

const NavItem = styled.div`
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 15px;
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 0;

  &:hover {
    background-color: transparent;
    color: ${({ theme }) => theme.vars.palette.primary.main};
  }

  &.nav {
    display: flex;
    justify-content: flex-start;

    ${({ theme }) => theme.breakpoints.down("md_lg")} {
      justify-content: center;
      flex-direction: column;
      width: 70px;
      transform: translateY(-5px);
    }
  }
`;

const StyledAppBar = styled(AppBar)`
  --scroll-progress: 1;

  position: sticky;
  top: -0.5px;
  margin-bottom: 2px;
  border-bottom: 0.5px solid;
  border-color: ${({ theme }) => theme.vars.palette.action.focus};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  box-shadow: none;

  svg {
    font-size: 26px;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-bottom: 0;
    border-color: ${({ theme }) =>
      `rgb(from ${theme.vars.palette.action.focus} r g b / calc(var(--scroll-progress) * ${theme.vars.palette.action.focusOpacity}))`};
    background-color: ${({ theme }) =>
      `rgb(from ${theme.vars.palette.background.paper} r g b / var(--scroll-progress))`};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    ${Logo} {
      filter: ${({ theme }) =>
        `drop-shadow(0px -1000px 0 rgb(from ${theme.colorSchemes.light.palette.grey[800]} r g b / calc(1 - var(--scroll-progress))))`};
      transform: translateY(calc((1 - round(var(--scroll-progress))) * 1000px));

      ${({ theme }) =>
        theme.applyStyles &&
        theme.applyStyles("dark", {
          filter: `drop-shadow(0px -1000px 0 rgb(from ${theme.colorSchemes.dark.palette.text.primary} r g b / calc(1 - var(--scroll-progress))))`,
          transform: `translateY(calc((1 - round(var(--scroll-progress))) * 1000px))`,
        })}
    }

    ${StyledIconButton} {
      border-radius: 50%;
      background-color: ${({ theme }) =>
        `color-mix(in srgb, ${theme.vars.palette.text.primary}, 
        transparent calc((1 - ${theme.vars.palette.action.focusOpacity}) * 100%))`};

      svg {
        font-size: 22px;
      }
    }
  }
`;

const IconText = styled.p`
  font-size: 13px;
  margin: 0;
  margin-left: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    height: 0;
  }
`;
//#endregion

const SearchComponent = ({ tabletMode, show, toggle, setToggle, isSearch, isShop, products }) => {
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const { t } = useTranslation();

  /**
   * Toggle search dialog
   */
  const toggleSearch = () => {
    setToggle(!show);
  };

  return (
    <Box display="flex" alignItems="center" flex={1} flexDirection={{ xs: "row-reverse", md: "row" }}>
      {tabletMode && isSearch ? (
        <Link to={"/"} title={t("home")}>
          <StyledIconButton aria-label="home">
            <HomeOutlined />
          </StyledIconButton>
        </Link>
      ) : (
        <Link to={"/store"} title={t("shop.explore", { ns: "client" })}>
          <StyledIconButton aria-label="explore">
            <Storefront />
          </StyledIconButton>
        </Link>
      )}
      <Box display="flex" alignItems="center" justifyContent={{ xs: "flex-end", md: "flex-start" }} flex={1}>
        <SearchInput
          {...{
            mobileMode,
            tabletMode,
            show,
            isFocus: toggle,
            isShop,
          }}
        />
        {tabletMode && isSearch ? (
          <Link to={"/cart"} title={t("login", { ns: "client" })}>
            <StyledIconButton aria-label="cart">
              <Badge
                color="primary"
                badgeContent={products?.length}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <ShoppingCartOutlined />
              </Badge>
            </StyledIconButton>
          </Link>
        ) : (
          <StyledIconButton aria-label="search toggle" onClick={toggleSearch} sx={{ mr: { xs: 0.3, md: 0 } }}>
            {show ? <SearchOff /> : <Search />}
          </StyledIconButton>
        )}
      </Box>
    </Box>
  );
};

const PopoverComponents = ({ mode, setMode, cartProducts, username, image, signOut, location }) => {
  const { t } = useTranslation();

  // Anchor for popoever & open state
  const [anchorElCart, setAnchorElCart] = useState(undefined);
  const [anchorEl, setAnchorEl] = useState(undefined);

  /**
   * Display cart popover on mouse enter
   */
  const handleCartPopover = (e) => {
    handleCartClose.cancel();
    setAnchorElCart(e.currentTarget);
    setAnchorEl(null);
  };

  /**
   * Hide cart popover on mouse leave
   */
  const handleCartClose = useCallback(
    debounce(() => {
      setAnchorElCart(null);
    }, 500),
    [anchorElCart]
  );

  /**
   * Display profile popover on mouse enter
   */
  const handleProfilePopover = (e) => {
    handleProfileClose.cancel();
    setAnchorEl(e.currentTarget);
    setAnchorElCart(null);
  };

  /**
   * Hide profile popover on mouse leave
   */
  const handleProfileClose = useCallback(
    debounce(() => {
      setAnchorEl(null);
    }, 500),
    [anchorEl]
  );

  return (
    <Grid
      size={{ xs: 12, md: "auto" }}
      sx={{
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        justifyContent: { xs: "space-evenly", md: "flex-end" },
      }}
    >
      <NavItem>
        <Stack direction="row" sx={{ color: "action.active" }} alignItems="center">
          <StyledIconButton className="nav" aria-label={t("notification")}>
            <Badge
              badgeContent={0}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <NotificationsOutlined />
            </Badge>
            <IconText>{t("notification")}</IconText>
          </StyledIconButton>
          <Box
            aria-owns={anchorElCart ? "mouse-over-popover-cart" : undefined}
            aria-haspopup="true"
            onMouseEnter={handleCartPopover}
            onMouseLeave={handleCartClose}
          >
            <Link to={"/cart"} title={t("cart.label", { ns: "client" })}>
              <StyledIconButton className="nav" aria-label={t("cart.label", { ns: "client" })}>
                <Badge
                  color="primary"
                  badgeContent={cartProducts?.length}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <ShoppingCartOutlined />
                </Badge>
                <IconText>{t("cart.label", { ns: "client" })}</IconText>
              </StyledIconButton>
            </Link>
            {anchorElCart !== undefined && (
              <Suspense fallback={null}>
                <MiniCart
                  {...{
                    anchorEl: anchorElCart,
                    handleClose: handleCartClose,
                    products: cartProducts,
                  }}
                />
              </Suspense>
            )}
          </Box>
          {username ? (
            <Box
              aria-owns={anchorEl ? "mouse-over-popover-profile" : undefined}
              aria-haspopup="true"
              onMouseEnter={handleProfilePopover}
              onMouseLeave={handleProfileClose}
            >
              <Link to={"/profile/detail"} title={t("profile")}>
                <StyledIconButton className="nav" aria-label={t("profile")}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: "16px" }} src={image ?? null} />
                  <IconText className="username">{username}</IconText>
                </StyledIconButton>
              </Link>
              {anchorEl !== undefined && (
                <Suspense fallback={null}>
                  <ProfilePopover
                    {...{
                      anchorEl,
                      setAnchorEl,
                      handleClose: handleProfileClose,
                      signOut,
                      mode,
                      setMode,
                      image,
                    }}
                  />
                </Suspense>
              )}
            </Box>
          ) : (
            <Link to={"/auth/login"} state={{ from: location }} title={t("login")}>
              <StyledIconButton className="nav" aria-label={t("login")}>
                <LockOutlined />
                <IconText className="username">{t("login")}</IconText>
              </StyledIconButton>
            </Link>
          )}
        </Stack>
      </NavItem>
    </Grid>
  );
};

const Navbar = () => {
  //#region construct
  const { t } = useTranslation();
  const { cartProducts } = useCart();
  const location = useLocation();
  const showMenu = useMatch("/");
  const isTransparent = matchRoutes([{ path: "/" }, { path: "/product/*" }], location);
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // Search
  const isStore = useMatch("/store");
  const isShop = useMatch("/shop/*");
  const isSearch = isStore || isShop;
  const [toggle, setToggle] = useState(undefined);
  const showSearch = (isSearch && toggle == undefined) || toggle;

  // Drawer open state
  const [openDrawer, setOpenDrawer] = useState(undefined);

  // Other
  const { username, image } = useAuth();
  const signOut = useLogout();

  /**
   * Set the drawer open state.
   * @param {boolean} value - The value to set the drawer open state to.
   */
  const handleToggleDrawer = (value) => {
    setOpenDrawer(value);
  };

  /**
   * Toggle the color mode.
   */
  const { mode, setMode } = useColorScheme();

  // Transparent trigger for the navbar.
  const opacityRef = useRef(0);
  const navRef = useRef(null);

  /**
   * Handle the window scroll event.
   * @param {Event} e - The event object.
   */
  const handleWindowScroll = (e) => {
    let body = document.body; //IE 'quirks'
    let element = document.documentElement; //IE with doctype
    element = element.clientHeight ? element : body;

    let opacity = element.scrollTop / 300;

    if (opacity < 1) {
      opacityRef.current = opacity;
    } else {
      opacityRef.current = 1;
    }

    handleChangeStyles();
  };

  /**
   * Change the styles of the navbar base on scroll progress.
   */
  const handleChangeStyles = () => {
    if (navRef.current) {
      navRef.current.style.setProperty("--scroll-progress", opacityRef.current);
    }
  };

  /**
   * Reset the styles of the navbar to full scroll.
   */
  const handleResetStyles = () => {
    if (navRef.current) {
      navRef.current.style.setProperty("--scroll-progress", "1");
    }
  };

  /**
   * Reset the navbar style to default top position.
   */
  const handleResetOpacity = () => {
    if (navRef.current) {
      navRef.current.style.setProperty("--scroll-progress", "0");
    }
  };

  /**
   * The window scroll listener.
   */
  const windowScrollListener = useCallback(handleWindowScroll, []);

  useEffect(() => {
    window.removeEventListener("scroll", windowScrollListener);
    if (tabletMode && isTransparent) window.addEventListener("scroll", windowScrollListener);
    handleResetStyles();

    return () => {
      window.removeEventListener("scroll", windowScrollListener);
      handleResetStyles();
    };
  }, [tabletMode, isTransparent]);

  useEffect(() => {
    if (tabletMode && isTransparent) {
      handleResetOpacity();
      setToggle(undefined);
    }
  }, [location.pathname]);

  // Check for go back button
  const canGoBack = location.key !== "default";
  const href = canGoBack ? -1 : "/";
  //#endregion

  return (
    <>
      <TopHeader>
        <Grid container size="grow">
          <Grid size={{ xs: 12, md: 6 }}>
            <ContactContainer>
              <Contact>
                <Phone sx={{ fontSize: 18, marginRight: 1 }} />
                +8419130248
              </Contact>
              <Contact>
                <Mail sx={{ fontSize: 18, marginRight: 1 }} />
                haductrong01629@gmail.com
              </Contact>
            </ContactContainer>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SocialContainer>
              <Social color="3B5999">
                <Facebook />
              </Social>
              <Social color="FF0000">
                <YouTube />
              </Social>
              <Social color="0A66C2">
                <LinkedIn />
              </Social>
              <Social color="55ACEE">
                <Twitter />
              </Social>
            </SocialContainer>
          </Grid>
        </Grid>
      </TopHeader>
      <StyledAppBar position="sticky" elevation={0} ref={navRef} enableColorOnDark>
        <Wrapper>
          <Grid container size="grow">
            <Grid
              size={{ xs: 12, md: "grow" }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "space-between", md: "flex-start" },
              }}
            >
              {tabletMode && (
                <Box display="flex" alignItems="center" flex={showSearch ? 0 : 1}>
                  {showMenu ? (
                    <StyledIconButton onClick={() => handleToggleDrawer(true)}>
                      <Menu />
                    </StyledIconButton>
                  ) : (
                    <Link to={href} title={t("back")}>
                      <StyledIconButton>
                        <KeyboardArrowLeft />
                      </StyledIconButton>
                    </Link>
                  )}
                  <Suspense fallback={null}>
                    <NavDrawer
                      {...{
                        openDrawer,
                        username,
                        image,
                        location,
                        products: cartProducts,
                        signOut,
                        mode,
                        setMode,
                        handleOpen: () => handleToggleDrawer(true),
                        handleClose: () => handleToggleDrawer(false),
                      }}
                    />
                  </Suspense>
                </Box>
              )}
              <Link to={"/"} title={t("home")}>
                <Logo className={showSearch ? "hidden" : ""}>
                  <LogoImage src="/full-logo.svg" alt="RING! logo" />
                </Logo>
              </Link>
              <SearchComponent
                {...{
                  tabletMode,
                  show: showSearch,
                  toggle,
                  setToggle,
                  isSearch,
                  isShop,
                  products: cartProducts,
                }}
              />
            </Grid>
            {!tabletMode && (
              <PopoverComponents
                {...{
                  mode,
                  setMode,
                  cartProducts,
                  username,
                  image,
                  signOut,
                  location,
                }}
              />
            )}
          </Grid>
        </Wrapper>
      </StyledAppBar>
    </>
  );
};

export default Navbar;
