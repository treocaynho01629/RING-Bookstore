import { Breadcrumbs } from "@mui/material";
import styled from "@emotion/styled";
import Link from "next/link";

const BreadcrumbsContainer = styled.div`
  display: block;

  a.active {
    font-weight: 450;
    text-decoration: underline;
    color: ${({ theme }) => theme.vars.palette.primary.dark};
    pointer-events: none;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;

export default function CustomBreadcrumbs(props) {
  const { children } = props;

  return (
    <BreadcrumbsContainer>
      <Breadcrumbs {...props}>
        <Link href="/">Trang chủ</Link>
        {children}
      </Breadcrumbs>
    </BreadcrumbsContainer>
  );
}
