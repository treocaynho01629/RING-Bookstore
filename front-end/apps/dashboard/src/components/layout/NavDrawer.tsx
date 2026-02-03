"use client";

import { styled } from "@mui/material/styles";
import { useState } from "react";
import { ExpandLess, ExpandMore, Speed } from "@mui/icons-material";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  Collapse,
  ListSubheader,
  Drawer,
  Theme,
  Link as MuiLink,
} from "@mui/material";
import { navigationList } from "@/utils/navigate";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MuiDrawer from "@mui/material/Drawer";

//#region styled
const drawerWidth = 250;

const openedMixin = (theme: Theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("all", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  backgroundColor: theme?.vars?.palette?.background?.paper,
  overflowX: "hidden",
});

const closedMixin = (theme: Theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: theme?.vars?.palette?.background?.paper,
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
});

const ImageLogo = styled("img")`
  width: 40px;
  height: 40px;
  padding: 0;
  transition: all 0.25s ease;
  margin: ${({ theme }) => theme.spacing(0, 1)};

  &.open {
    margin: ${({ theme }) => theme.spacing(0, 3)};
  }
`;

const DrawerHeader = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ theme }) => theme.mixins.toolbar};
`;

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

const DrawerContainer = styled("div")`
  width: 300px;
`;

const StyledListSubheader = styled(ListSubheader)`
  background-color: transparent;
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 2rem;
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledListItemButton = styled(ListItemButton)`
  padding: ${({ theme }) => theme.spacing(0.75, 1.5)};
  font-weight: 500;
  transition: ${({ theme }) =>
    theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    })};

  &.Mui-selected {
    text-decoration: underline;
    color: ${({ theme }) => theme?.vars?.palette?.primary?.main};

    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 4px;
      height: 100%;
      background-color: ${({ theme }) => theme?.vars?.palette?.primary?.main};
    }

    .MuiListItemIcon-root {
      color: ${({ theme }) => theme?.vars?.palette?.primary?.main};
    }
  }

  ${({ theme }) => theme.breakpoints.up("md")} {
    .MuiListItemIcon-root {
      min-width: 0;
      margin-left: ${({ theme }) => theme.spacing(0.4)};
      justify-content: center;
    }

    .MuiListItemText-root {
      visibility: hidden;
    }

    &.open {
      justify-content: initial;
      padding: ${({ theme }) => theme.spacing(0.75, 3)};

      .MuiListItemIcon-root {
        margin-right: ${({ theme }) => theme.spacing(3)};
      }

      .MuiListItemText-root {
        visibility: visible;
      }
    }
  }
`;
//#endregion

interface NavDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  tabletMode: boolean;
}

const NavDrawer = ({ open, setOpen, tabletMode }: NavDrawerProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const [openList, setOpenList] = useState<Record<number, boolean>>({ 0: true });
  const { data: session } = useSession();
  const { isAdmin } = session?.user ?? { isAdmin: false };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleClickItem = (e: React.MouseEvent<SVGSVGElement>, id: number) => {
    setOpenList((prevState) => ({ ...prevState, [id]: !prevState[id] }));
    e.stopPropagation();
    e.preventDefault();
  };

  const drawerContent = (
    <>
      <DrawerHeader>
        <MuiLink
          component={Link}
          href={"/"}
          title={t("dashboard.label")}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ImageLogo src="/logo.svg" className={open ? "open" : ""} alt="RING! logo" />
        </MuiLink>
      </DrawerHeader>
      <List
        disablePadding
        subheader={
          open && <StyledListSubheader id="management-list-subheader">{t("dashboard.overview")}</StyledListSubheader>
        }
      >
        <Link href={"/"}>
          <ListItem key={0} disablePadding>
            <StyledListItemButton className={open ? "open" : ""} selected={pathname === "/"}>
              <ListItemIcon>
                <Speed />
              </ListItemIcon>
              <ListItemText primary={t("dashboard.label")} sx={{ opacity: open ? 1 : 0 }} />
            </StyledListItemButton>
          </ListItem>
        </Link>
      </List>
      <List
        disablePadding
        subheader={
          open && <StyledListSubheader id="management-list-subheader">{t("dashboard.management")}</StyledListSubheader>
        }
      >
        {navigationList.map(
          (item, index) =>
            (!item.isAdmin || isAdmin) && (
              <Link key={`link-${index}`} href={item.url}>
                <ListItem key={`item-${index}`} disablePadding>
                  <StyledListItemButton className={open ? "open" : ""} selected={pathname === item.url}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={t(item.label)} />
                    {item.subItems &&
                      (openList[index as keyof typeof openList] ? (
                        <ExpandLess
                          sx={{ display: open ? "block" : "none" }}
                          onClick={(e) => handleClickItem(e, index)}
                        />
                      ) : (
                        <ExpandMore
                          sx={{ display: open ? "block" : "none" }}
                          onClick={(e) => handleClickItem(e, index)}
                        />
                      ))}
                  </StyledListItemButton>
                </ListItem>
                {item.subItems && (
                  <Collapse
                    key={index}
                    in={openList[index as keyof typeof openList]}
                    timeout={250}
                    unmountOnExit
                    sx={{ display: open ? "block" : "none" }}
                  >
                    <List sx={{ mx: 1.5 }} component="div" disablePadding>
                      {item.subItems?.map((sub, subIndex) => (
                        <Link key={`sub-${index}-${subIndex}`} href={sub.url}>
                          <StyledListItemButton sx={{ pl: 4 }}>
                            <ListItemText primary={t(sub.label)} />
                          </StyledListItemButton>
                        </Link>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Link>
            )
        )}
      </List>
    </>
  );

  return (
    <>
      {tabletMode ? (
        <Drawer variant="temporary" open={open} onClose={handleDrawerClose} ModalProps={{ keepMounted: true }}>
          <DrawerContainer>{drawerContent}</DrawerContainer>
        </Drawer>
      ) : (
        <StyledDrawer variant="permanent" open={open}>
          {drawerContent}
        </StyledDrawer>
      )}
    </>
  );
};

export default NavDrawer;
