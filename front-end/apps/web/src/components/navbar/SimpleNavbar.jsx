import styled from "@emotion/styled";
import { Link } from "react-router";
import { useColorScheme } from "@mui/material/styles";
import ContactSupportOutlined from "@mui/icons-material/ContactSupportOutlined";
import ContrastOutlined from "@mui/icons-material/ContrastOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import NightlightOutlined from "@mui/icons-material/NightlightOutlined";

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
  height: 46px;
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
    margin-left: 5px;
  }

  &:hover {
    color: ${({ theme }) => theme.vars.palette.text.primary};
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    p {
      display: none;
    }
    &:last-of-type {
      float: left;
    }
  }
`;

const Logo = styled.img`
  height: 45px;
  padding: 4px;

  ${({ theme }) => theme.breakpoints.down("md")} {
    filter: drop-shadow(
      0px -2000px 0 ${({ theme }) => theme.vars.palette.text.primary}
    );
    transform: translateY(2000px);
  }
`;
//#endregion

const SimpleNavbar = () => {
  const { mode, setMode } = useColorScheme();

  //Toggle color mode
  const toggleMode = () => {
    if (!mode) {
      return;
    } else if (mode === "system") {
      setMode("light");
    } else if (mode === "light") {
      setMode("dark");
    } else if (mode === "dark") {
      setMode("system");
    }
  };

  return (
    <Container>
      <Link to="/" tabIndex={-1}>
        <Logo src="/full-logo.svg" alt="RING! Logo" />
      </Link>
      <SimpleButton>
        <Link to="https://github.com/treocaynho01629/RING-Bookstore/issues">
          <ContactSupportOutlined />
          <p>Trợ giúp</p>
        </Link>
      </SimpleButton>
      {mode && (
        <SimpleButton aria-label="toggle-mode" onClick={toggleMode}>
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
    </Container>
  );
};

export default SimpleNavbar;
