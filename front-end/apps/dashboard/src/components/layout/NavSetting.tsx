"use client";

import {
  AccountBoxOutlined,
  ContrastOutlined,
  KeyboardArrowRight,
  HomeOutlined,
  LightModeOutlined,
  NightlightOutlined,
  ContactSupportOutlined,
  Logout,
} from "@mui/icons-material";
import {
  ListItemText,
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
  ButtonGroup,
  Button,
  ListSubheader,
  useColorScheme,
  styled,
  IconButton,
  Link as MuiLink,
  listItemIconClasses,
} from "@mui/material";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";

//#region preStyled
const DrawerContainer = styled("div")`
  width: 320px;
  height: 100%;
  padding: ${({ theme }) => theme.spacing(1.5)};
  position: relative;
  overflow: hidden;
`;

const HeaderContainer = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const SyledAvatar = styled(Avatar)`
  width: 85px;
  height: 85px;
  box-shadow: 4px 4px 0 0 ${({ theme }) => theme?.vars?.palette.action.disabled};
`;

const StyledItemButton = styled(ListItemButton)`
  padding: ${({ theme }) => theme.spacing(0.75, 1.5)};

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

const Wave = styled("span")`
  position: absolute;
  width: 120%;
  aspect-ratio: 1/1;
  border-radius: 43%;
  top: 0;
  right: 14%;
  background: hsl(from ${({ theme }) => theme?.vars?.palette.primary.main} calc(h - 30) s l / 0.2);

  &:nth-of-type(2) {
    background: hsl(from ${({ theme }) => theme?.vars?.palette.primary.main} calc(h + 30) s l / 0.3);
    right: 7%;
    transform: scale(0.9) rotate(120deg);
  }

  &:nth-of-type(3) {
    background: hsl(from ${({ theme }) => theme?.vars?.palette.primary.main} h s l / 0.4);
    right: 0;
    transform: scale(0.8) rotate(240deg);
  }
`;

const WaveContainer = styled("section")`
  position: absolute;
  top: -200px;
  right: -30%;
  width: 100%;
  z-index: -1;
`;
//#endregion

const NavSetting = ({
  open,
  setOpen,
  image,
  username,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  image?: string | null;
  username?: string | null;
}) => {
  const t = useTranslations();
  const { mode, setMode } = useColorScheme();
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={open}
      onClose={handleDrawerClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{ backdrop: { invisible: true } }}
    >
      <DrawerContainer>
        <Box pb={1}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <IconButton onClick={handleDrawerClose} sx={{ padding: 0.5 }}>
              <KeyboardArrowRight fontSize="medium" />
            </IconButton>
            <Link href="https://github.com/treocaynho01629/RING-Bookstore/issues" title={t("help")}>
              <IconButton sx={{ padding: 0.5 }}>
                <ContactSupportOutlined fontSize="medium" />
              </IconButton>
            </Link>
          </Box>
          <HeaderContainer>
            <MuiLink component={Link} href={"/"} sx={{ textAlign: "center", color: "inherit", textDecoration: "none" }}>
              <SyledAvatar alt={username ?? undefined} src={image ?? undefined} />
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 500 }}>
                {username}&nbsp;
              </Typography>
            </MuiLink>
            <Button
              variant="text"
              color="error"
              fullWidth
              size="large"
              sx={{ textTransform: "uppercase", fontWeight: 600 }}
              onClick={() => signOut()}
              startIcon={<Logout />}
            >
              {t("signout.label")}
            </Button>
          </HeaderContainer>
        </Box>
        <Divider />
        <List>
          <Link href={"/"}>
            <ListItem disablePadding onClick={handleDrawerClose}>
              <StyledItemButton>
                <ListItemIcon>
                  <HomeOutlined />
                </ListItemIcon>
                <ListItemText primary={t("home")} />
              </StyledItemButton>
            </ListItem>
          </Link>
          <Link href={"/"}>
            <ListItem disablePadding onClick={handleDrawerClose}>
              <StyledItemButton>
                <ListItemIcon>
                  <AccountBoxOutlined />
                </ListItemIcon>
                <ListItemText primary={t("profile.label")} />
              </StyledItemButton>
            </ListItem>
          </Link>
        </List>
        <Divider />
        <List
          sx={{ m: 1.5 }}
          subheader={
            <ListSubheader sx={{ backgroundColor: "transparent" }} id="management-list-subheader">
              MÀU NỀN
            </ListSubheader>
          }
        >
          <ListItem disablePadding>
            <ButtonGroup fullWidth variant="outlined" color="success" aria-label="Theme button group">
              <Button
                variant={mode === "light" ? "contained" : "outlined"}
                startIcon={<LightModeOutlined />}
                onClick={() => setMode("light")}
              >
                Sáng
              </Button>
              <Button
                variant={mode === "system" ? "contained" : "outlined"}
                startIcon={<ContrastOutlined />}
                onClick={() => setMode("system")}
                sx={{ whiteSpace: "nowrap", padding: 2 }}
              >
                Hệ thống
              </Button>
              <Button
                variant={mode === "dark" ? "contained" : "outlined"}
                startIcon={<NightlightOutlined />}
                onClick={() => setMode("dark")}
              >
                Tối
              </Button>
            </ButtonGroup>
          </ListItem>
        </List>
        <WaveContainer>
          <Wave></Wave>
          <Wave></Wave>
          <Wave></Wave>
        </WaveContainer>
      </DrawerContainer>
    </Drawer>
  );
};

export default NavSetting;
