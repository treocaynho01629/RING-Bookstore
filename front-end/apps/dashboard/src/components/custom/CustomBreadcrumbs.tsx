import Link from "next/link";
import { styled } from "@mui/material/styles";
import { Breadcrumbs } from "@mui/material";
import { useTranslations } from "next-intl";
import { Link as MuiLink } from "@mui/material";
import { Home } from "@mui/icons-material";
import { usePathname } from "next/navigation";

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

interface CustomBreadcrumbsProps {
  items: { label: string; href: string }[];
}

export default function CustomBreadcrumbs({ items }: CustomBreadcrumbsProps) {
  const t = useTranslations();
  const pathname = usePathname();

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
      {items.map((item) => (
        <MuiLink
          key={item.href}
          component={Link}
          href={item.href}
          title={item.label}
          underline="hover"
          color="inherit"
          className={pathname === item.href ? "active" : ""}
        >
          {item.label}
        </MuiLink>
      ))}
    </StyledBreadcrumbs>
  );
}
