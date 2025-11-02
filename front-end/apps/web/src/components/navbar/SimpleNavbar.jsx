import styled from "@emotion/styled";
import { Link } from "react-router";
import { useColorScheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { LocaleType } from "@ring/shared/enums/locales";
import ContactSupportOutlined from "@mui/icons-material/ContactSupportOutlined";
import ContrastOutlined from "@mui/icons-material/ContrastOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import NightlightOutlined from "@mui/icons-material/NightlightOutlined";
import Language from "@mui/icons-material/Language";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

//#region styled
const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(3)}`};
  margin: auto;
  z-index: ${({ theme }) => theme.zIndex.appBar};

  ${({ theme }) => theme.breakpoints.down("md")} {
    text-align: center;
    padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(1.5)}`};
  }
`;

const SimpleButton = styled.span`
  margin: 10px 0;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  float: right;
  display: flex;
  align-items: center;
  cursor: pointer;

  a {
    display: flex;
    align-items: center;
  }

  p {
    font-size: 13px;
    margin: 0;
    margin-left: 5px;
  }

  &:hover {
    color: ${({ theme }) => theme.vars.palette.text.primary};
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    float: left;

    p {
      display: none;
    }

    &:first-of-type {
      float: right;
      margin-left: 24px;
    }
  }
`;

const Logo = styled.img`
  height: 45px;
  padding: 4px;

  ${({ theme }) => theme.breakpoints.down("md")} {
    filter: drop-shadow(0px -2000px 0 ${({ theme }) => theme.vars.palette.text.primary});
    transform: translateY(2000px);
  }
`;

const StyledMenu = styled(Menu)`
  .MuiPaper-root {
    margin-top: ${({ theme }) => theme.spacing(1)};
    background-color: ${({ theme }) => theme.vars.palette.action.hover};

    .MuiMenu-list {
      padding: ${({ theme }) => theme.spacing(0.5)};
    }

    .MuiMenuItem-root {
      &.Mui-selected {
        background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.primary.dark}, transparent 40%);
        color: ${({ theme }) => theme.vars.palette.primary.main};

        ${({ theme }) =>
          theme.applyStyles &&
          theme.applyStyles("dark", {
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.light}, transparent 70%)`,
          })}
      }
    }
  }
`;
//#endregion

const SimpleNavbar = () => {
  const { mode, setMode } = useColorScheme();
  const { t, i18n } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElTheme, setAnchorElTheme] = useState(null);
  const open = Boolean(anchorEl);
  const openTheme = Boolean(anchorElTheme);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setAnchorElTheme(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAnchorElTheme(null);
  };

  const handleClickTheme = (event) => {
    setAnchorElTheme(event.currentTarget);
    setAnchorEl(null);
  };

  const handleCloseTheme = () => {
    setAnchorElTheme(null);
    setAnchorEl(null);
  };

  const handleChangeLanguage = (locale) => {
    i18n.changeLanguage(locale.value);
    handleClose();
  };

  const handleChangeTheme = (theme) => {
    setMode(theme);
    handleCloseTheme();
  };

  return (
    <Container>
      <Link to="/" tabIndex={-1}>
        <Logo src="/full-logo.svg" alt="RING! Logo" />
      </Link>
      <SimpleButton>
        <Link to="https://github.com/treocaynho01629/RING-Bookstore/issues">
          <ContactSupportOutlined />
          <p>{t("help")}</p>
        </Link>
      </SimpleButton>
      {mode && (
        <SimpleButton
          id="theme-button"
          aria-label="toggle-mode"
          aria-controls={openTheme ? "theme-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openTheme ? "true" : undefined}
          onClick={handleClickTheme}
        >
          {mode === "dark" ? (
            <NightlightOutlined />
          ) : mode === "light" ? (
            <LightModeOutlined />
          ) : mode === "system" ? (
            <ContrastOutlined />
          ) : (
            ""
          )}
          &nbsp;
        </SimpleButton>
      )}
      <SimpleButton
        id="language-button"
        aria-label="Toggle language menu"
        aria-controls={open ? "language-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Language />
        &nbsp;
      </SimpleButton>
      <StyledMenu
        id="theme-menu"
        anchorEl={anchorElTheme}
        open={openTheme}
        onClose={handleCloseTheme}
        slotProps={{
          list: {
            "aria-labelledby": "theme-buttons",
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
        <MenuItem selected={mode === "light"} onClick={() => handleChangeTheme("light")}>
          <ListItemIcon>
            <LightModeOutlined fontSize="small" />
          </ListItemIcon>
          {t("theme.light")}
        </MenuItem>
        <MenuItem selected={mode === "dark"} onClick={() => handleChangeTheme("dark")}>
          <ListItemIcon>
            <NightlightOutlined fontSize="small" />
          </ListItemIcon>
          {t("theme.dark")}
        </MenuItem>
        <MenuItem selected={mode === "system"} onClick={() => handleChangeTheme("system")}>
          <ListItemIcon>
            <ContrastOutlined fontSize="small" />
          </ListItemIcon>
          {t("theme.system")}
        </MenuItem>
      </StyledMenu>
      <StyledMenu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
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
          <MenuItem key={index} selected={i18n.language == locale.value} onClick={() => handleChangeLanguage(locale)}>
            {locale.label}
          </MenuItem>
        ))}
      </StyledMenu>
    </Container>
  );
};

export default SimpleNavbar;
