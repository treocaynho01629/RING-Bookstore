import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { Home } from "@mui/icons-material";
import { Link, usePathname } from "@/i18n/navigation";
import { locales } from "@ring/shared/enums/locales";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Skeleton from "@mui/material/Skeleton";
import MuiLink from "@mui/material/Link";

//#region styled
const StyledBreadcrumbs = styled(Breadcrumbs)`
  display: block;

  a.active {
    font-weight: 450;
    text-decoration: underline;
    color: ${({ theme }) => theme.palette.primary.dark};
    pointer-events: none;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;
//#endregion

type AppHref = ComponentProps<typeof Link>["href"];

interface CustomBreadcrumbsProps {
  items: { label: string; href: string }[];
  loading?: boolean;
}

/**
 * Get pathname without locale prefix for matching hrefs.
 * next-intl adds locale prefix (e.g. /en/product/1, /vi/product/1) but hrefs use /product/1
 */
function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && locales.includes(segments[0])) {
    const withoutLocale = segments.slice(1).join("/");
    return withoutLocale ? `/${withoutLocale}` : "/";
  }
  return pathname;
}

export default function CustomBreadcrumbs({ items, loading = false }: CustomBreadcrumbsProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  return (
    <StyledBreadcrumbs separator="." aria-label="breadcrumb" maxItems={4}>
      <MuiLink
        component={Link}
        href={"/"}
        title={t("home")}
        sx={{ display: "flex", alignItems: "center" }}
        underline="hover"
        color="inherit"
      >
        <Home sx={{ mr: 0.5 }} fontSize="inherit" />
        {t("home")}
      </MuiLink>
      {loading ? (
        <Skeleton variant="text" width={100} height={24} />
      ) : (
        items.map((item) => (
          <MuiLink
            component={Link}
            key={item.href}
            href={item.href as AppHref}
            title={item.label}
            underline="hover"
            color="inherit"
            className={pathWithoutLocale === item.href ? "active" : ""}
          >
            {item.label}
          </MuiLink>
        ))
      )}
    </StyledBreadcrumbs>
  );
}
