"use client";

import { ReactNode, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
// import ScrollToTop from "@ring/ui/ScrollToTop";
import Navbar from "./Navbar";
import NavDrawer from "./NavDrawer";

//#region styled
const LayoutWrapper = styled("div")`
  display: flex;
`;

const MainContainer = styled("div")`
  flex-grow: 1;
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.breakpoints.down("md")} {
    flex-grow: auto;
  }
`;

const LayoutContainer = styled("div")`
  position: relative;
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  flex: 1;
  width: 100%;

  ${({ theme }) => theme.breakpoints.up("sm_md")} {
    padding-right: ${({ theme }) => theme.spacing(2)};
    padding-left: ${({ theme }) => theme.spacing(2)};
    margin-right: auto;
    margin-left: auto;
    max-width: ${({ theme }) => theme.breakpoints.values["lg"]}px;
  }
`;
//#endregion

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [open, setOpen] = useState<boolean>(false);

  return (
    <LayoutWrapper>
      {/* <ScrollToTop /> */}
      <NavDrawer {...{ open, setOpen, tabletMode }} />
      <MainContainer>
        <Navbar open={open} setOpen={setOpen} />
        <LayoutContainer>{children}</LayoutContainer>
      </MainContainer>
    </LayoutWrapper>
  );
}
