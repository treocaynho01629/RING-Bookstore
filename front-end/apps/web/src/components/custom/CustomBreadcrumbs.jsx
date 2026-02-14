import { NavLink } from "react-router";
import { Breadcrumbs, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";

const BreadcrumbsContainer = styled.div`
  margin: 20px 10px;
  display: block;
  z-index: 3;

  a.active {
    font-weight: 450;
    text-decoration: underline;
    color: ${({ theme }) => theme.vars.palette.primary.dark};
    pointer-events: none;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    content-visibility: hidden;
    background-color: ${({ theme }) => theme.vars.palette.background.paper};
    position: fixed;
    top: 0;
    width: 100%;
    height: ${({ theme }) => theme.mixins.toolbar.minHeight + 4}px;
    margin: 0;
    z-index: ${({ theme }) => theme.zIndex.appBar - 1};

    &.transparent {
      display: none;
    }

    &.solid {
      position: relative;
      margin-top: -${({ theme }) => theme.mixins.toolbar.minHeight}px;
    }
  }
`;

const StyledMainCrumb = styled(NavLink)`
  background-color: ${({ theme }) => theme.vars.palette.primary.main};
  color: ${({ theme }) => theme.vars.palette.primary.contrastText};
  padding: 5px 15px;
`;

export default function CustomBreadcrumbs({ items, type = "default", loading = false }) {
  const { t } = useTranslation();

  return (
    <BreadcrumbsContainer className={type}>
      <Breadcrumbs separator="›" aria-label={t("breadcrumbs")} maxItems={4}>
        <StyledMainCrumb to={"/"}>{t("home")}</StyledMainCrumb>
        {items.map((item) => (
          <NavLink key={item.href} to={item.href} end={item.end}>
            {item.label}
          </NavLink>
        ))}
        {loading && <Skeleton variant="text" sx={{ fontSize: "16px" }} width={200} />}
      </Breadcrumbs>
    </BreadcrumbsContainer>
  );
}
