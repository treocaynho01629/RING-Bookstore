import { Outlet } from "react-router";
import ScrollToTop from "./ScrollToTop";
import Navbar from "../navbar/Navbar";
import Footer from "./Footer";
import styled from "@emotion/styled";

const LayoutWrapper = styled.main`
  position: relative;
  min-height: 80dvh;

  ${({ theme }) => theme.breakpoints.up("sm_md")} {
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
    width: 750px;
  }

  ${({ theme }) => theme.breakpoints.up("md_lg")} {
    width: 970px;
  }

  ${({ theme }) => theme.breakpoints.up("lg")} {
    width: 1170px;
  }
`;

export default function PageLayout() {
  return (
    <>
      <Navbar />
      <LayoutWrapper>
        <ScrollToTop />
        <Outlet />
      </LayoutWrapper>
      <Footer />
    </>
  );
}
