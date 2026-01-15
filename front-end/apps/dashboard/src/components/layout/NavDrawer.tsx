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
} from "@mui/material";
import { navigationList } from "../../utils/navigate";
import { useSession } from "next-auth/react";
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
  backgroundColor: theme?.vars?.palette?.background?.default,
  overflowX: "hidden",
});

const closedMixin = (theme: Theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: theme?.vars?.palette?.background?.default,
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

const StyledListSubheader = styled(ListSubheader)(({ theme }) => ({
  backgroundColor: "transparent",
  fontSize: 14,
  fontWeight: 450,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  "minHeight": 48,
  "justifyContent": "center",
  "transition": theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),

  "&.Mui-selected": {
    "color": theme?.vars?.palette?.primary?.main,

    ".MuiListItemIcon-root": {
      color: theme?.vars?.palette?.primary?.main,
    },
  },

  "&.open": {
    justifyContent: "initial",
    margin: theme.spacing(0, 1.5),
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  "minWidth": 0,
  "justifyContent": "center",

  "&.open": { marginRight: theme.spacing(3) },
}));
//#endregion

const NavDrawer = ({
  open,
  setOpen,
  tabletMode,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  tabletMode: boolean;
}) => {
  const [openList, setOpenList] = useState<Record<number, boolean>>({ 0: true });
  const { data: session } = useSession();
  const { isAdmin } = session?.user ?? { isAdmin: false };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    setOpenList((prevState) => ({ ...prevState, [id]: !prevState[id] }));
    setOpen(true);
    e.stopPropagation();
    e.preventDefault();
  };

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
        <Link href={"/"}>
          <ImageLogo src="/logo.svg" className={open ? "open" : ""} alt="RING! logo" />
        </Link>
      </DrawerHeader>
      <List
        disablePadding
        subheader={open && <StyledListSubheader id="management-list-subheader">TỔNG QUAN</StyledListSubheader>}
      >
        <ListItem key={0} disablePadding sx={{ display: "block" }}>
          <Link href={"/"}>
            <StyledListItemButton className={open ? "open" : ""}>
              <StyledListItemIcon className={open ? "open" : ""}>
                <Speed />
              </StyledListItemIcon>
              <ListItemText primary={"Dashboard"} sx={{ opacity: open ? 1 : 0 }} />
            </StyledListItemButton>
          </Link>
        </ListItem>
      </List>
      <List
        disablePadding
        subheader={open && <StyledListSubheader id="management-list-subheader">QUẢN LÝ</StyledListSubheader>}
      >
        {navigationList.map(
          (item, index) =>
            (!item.isAdmin || isAdmin) && (
              <Link key={`link-${index}`} href={item.url}>
                <>
                  <ListItem key={`item-${index}`} disablePadding sx={{ display: "block" }}>
                    <StyledListItemButton className={open ? "open" : ""}>
                      <StyledListItemIcon className={open ? "open" : ""}>{item.icon}</StyledListItemIcon>
                      <ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />
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
                            <ListItemButton sx={{ pl: 4 }}>
                              <ListItemText primary={sub.label} />
                            </ListItemButton>
                          </Link>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </>
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
