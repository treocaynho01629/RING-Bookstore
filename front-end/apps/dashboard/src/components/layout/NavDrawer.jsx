import styled from "@emotion/styled";
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
} from "@mui/material";
import { NavLink } from "react-router";
import useAuth from "@ring/auth/useAuth";
import { navigationList } from "../../utils/navigate";
import MuiDrawer from "@mui/material/Drawer";

//#region styled
const drawerWidth = 250;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("all", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  backgroundColor: theme.vars.palette.background.default,
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: theme.vars.palette.background.default,
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
});

const ImageLogo = styled.img`
  width: 40px;
  height: 40px;
  padding: 0;
  transition: all 0.25s ease;
  margin: ${({ theme }) => theme.spacing(0, 1)};

  &.open {
    margin: ${({ theme }) => theme.spacing(0, 3)};
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${({ theme }) => theme.mixins.toolbar};
`;

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",

  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DrawerContainer = styled.div`
  width: 300px;
`;

const StyledListSubheader = styled(ListSubheader)(({ theme }) => ({
  backgroundColor: "transparent",
  fontSize: 14,
  fontWeight: 450,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  minHeight: 48,
  justifyContent: "center",
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),

  "&.Mui-selected": {
    color: theme.vars.palette.primary.main,

    ".MuiListItemIcon-root": {
      color: theme.vars.palette.primary.main,
    },
  },

  "&.open": {
    justifyContent: "initial",
    margin: theme.spacing(0, 1.5),
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 0,
  justifyContent: "center",

  "&.open": { marginRight: theme.spacing(3) },
}));
//#endregion

const NavDrawer = ({ open, setOpen, tabletMode }) => {
  const { roles } = useAuth();
  const [openList, setOpenList] = useState(true);
  const isAdmin = roles?.find((role) =>
    ["ROLE_ADMIN", "ROLE_GUEST"].includes(role)
  );

  const handleClick = (e, id) => {
    setOpenList((prevState) => ({ ...prevState, [id]: !prevState[id] }));
    setOpen(true);
    e.stopPropagation();
    e.preventDefault();
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const drawerContent = (
    <>
      <DrawerHeader>
        <NavLink to={"/"}>
          <ImageLogo
            src="/logo.svg"
            className={open ? "open" : ""}
            alt="RING! logo"
          />
        </NavLink>
      </DrawerHeader>
      <List
        disablePadding
        subheader={
          open && (
            <StyledListSubheader component="div" id="management-list-subheader">
              TỔNG QUAN
            </StyledListSubheader>
          )
        }
      >
        <ListItem key={0} disablePadding sx={{ display: "block" }}>
          <NavLink to={"/"} end>
            {({ isActive }) => (
              <StyledListItemButton
                className={open ? "open" : ""}
                selected={isActive}
              >
                <StyledListItemIcon className={open ? "open" : ""}>
                  <Speed />
                </StyledListItemIcon>
                <ListItemText
                  primary={"Dashboard"}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </StyledListItemButton>
            )}
          </NavLink>
        </ListItem>
      </List>
      <List
        disablePadding
        subheader={
          open && (
            <StyledListSubheader component="div" id="management-list-subheader">
              QUẢN LÝ
            </StyledListSubheader>
          )
        }
      >
        {navigationList.map(
          (item, index) =>
            (!item.isAdmin || isAdmin) && (
              <NavLink key={`link-${index}`} to={item.url} end>
                {({ isActive }) => (
                  <>
                    <ListItem
                      key={`item-${index}`}
                      disablePadding
                      sx={{ display: "block" }}
                    >
                      <StyledListItemButton
                        className={open ? "open" : ""}
                        selected={isActive}
                      >
                        <StyledListItemIcon className={open ? "open" : ""}>
                          {item.icon}
                        </StyledListItemIcon>
                        <ListItemText
                          primary={item.label}
                          sx={{ opacity: open ? 1 : 0 }}
                        />
                        {item.subItems &&
                          (openList[index] ? (
                            <ExpandLess
                              sx={{ display: open ? "block" : "none" }}
                              onClick={(e) => handleClick(e, index)}
                            />
                          ) : (
                            <ExpandMore
                              sx={{ display: open ? "block" : "none" }}
                              onClick={(e) => handleClick(e, index)}
                            />
                          ))}
                      </StyledListItemButton>
                    </ListItem>
                    {item.subItems && (
                      <Collapse
                        key={index}
                        in={openList[index]}
                        timeout={250}
                        unmountOnExit
                        sx={{ display: open ? "block" : "none" }}
                      >
                        <List sx={{ mx: 1.5 }} component="div" disablePadding>
                          {item.subItems?.map((sub, subIndex) => (
                            <NavLink
                              key={`sub-${index}-${subIndex}`}
                              to={sub.url}
                            >
                              <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary={sub.label} />
                              </ListItemButton>
                            </NavLink>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </>
                )}
              </NavLink>
            )
        )}
      </List>
    </>
  );

  return (
    <>
      {tabletMode ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
        >
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
