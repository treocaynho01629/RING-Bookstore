"use client";

import { lazy, useLayoutEffect, useRef, useState } from "react";
import { styled, Theme } from "@mui/material/styles";
import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Rating,
  Divider,
  Skeleton,
} from "@mui/material";
import {
  Edit,
  ArrowBack,
  Info as InfoIcon,
  ShoppingCart as SaleInfoIcon,
  MenuBook as DetailIcon,
  ReceiptLong as OrdersIcon,
  Star as ReviewsIcon,
  StarBorder as StarBorderIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  OpenInNew,
  PieChart as PieChartIcon,
  ShowChart,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { currencyFormat, dateFormatter, getBookLanguage, getBookType, idFormatter, numFormat } from "@ring/shared";
import { useRouter } from "next/navigation";
import { revalidateBook } from "@/lib/actions";
import { SectionCard, SectionTitle } from "@/components/custom/Components";
import { capitalize } from "lodash-es";
import Grid from "@mui/material/Grid";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import Link from "next/link";
import ProductImages from "@/components/product/ProductImages";
import ProductFormDialog from "@/components/dialog/ProductFormDialog";
import Placeholder from "@/components/custom/Placeholder";
import LazyLoadComponent from "@/components/layout/LazyLoadComponent";

import type { BookDTO } from "@ring/shared/models/bookDTO";

const RecentOrdersComponent = lazy(() => import("@/components/product/RecentOrdersComponent"));
const RecentReviewsComponent = lazy(() => import("@/components/product/RecentReviewsComponent"));
const SalesLineChart = lazy(() => import("@/components/chart/SalesLineChart"));
const ReviewsDistributionPieChart = lazy(() => import("@/components/chart/ReviewsDistributionPieChart"));

//#region styled
const InfoLabel = styled(TableCell)`
  width: 25%;
  white-space: nowrap;
  font-weight: 500;
  color: ${({ theme }) => theme.vars?.palette?.text?.secondary ?? theme.palette.text.secondary};
  font-size: 14px;
  border: none;
  padding: 8px 0;
  vertical-align: top;
`;

const InfoValue = styled(TableCell)`
  padding: ${({ theme }) => theme.spacing(1, 0, 1, 1.25)};
  font-size: 14px;
  border: none;
  vertical-align: top;
  color: ${({
    theme,
    color,
  }: {
    theme?: Theme;
    color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  }) =>
    color
      ? (theme?.vars?.palette?.[color]?.main ?? theme?.palette?.[color]?.main)
      : (theme?.vars?.palette?.text?.primary ?? theme?.palette?.text?.primary)};
`;

const DescriptionContainer = styled(Box)`
  position: relative;
  margin-top: 10px;
`;

const Description = styled(Box)`
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  transition: all 0.3s ease;

  &.minimize {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 10;
    -webkit-box-orient: vertical;

    @media (max-width: 900px) {
      -webkit-line-clamp: 5;
    }
  }
`;

const Showmore = styled(Box)`
  font-size: 14px;
  font-weight: 500;
  padding: 15px 0;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.vars?.palette?.info?.main ?? theme.palette.info.main};
  cursor: pointer;
  user-select: none;

  &:hover {
    text-decoration: underline;
  }
`;

const BookTitle = styled(Typography)`
  font-size: 22px;
  font-weight: 450;
  line-height: normal;
  margin: 0 0 12px 0;

  ${({ theme }) => theme.breakpoints.down("md")} {
    font-size: 18px;
    margin: 10px 0;
  }
`;

const SecondaryTitle = styled(Typography)`
  font-size: 16px;
  font-weight: 450;
  line-height: normal;
  margin-top: 16px;
`;

const InfoTable = styled(Table)`
  width: 100%;
  margin-top: 12px;

  tbody tr {
    border-bottom: none;
  }
`;

const UserInfoRow = styled(Box)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.vars?.palette.text.secondary};

  .MuiRating-root {
    color: ${({ theme }) => theme.vars?.palette?.warning?.main};
  }
`;
//#endregion

export interface DetailProductContentProps {
  product: BookDTO | null;
  id: string;
}

const orderPlaceholderProps = {
  width: "100%",
  height: { xs: 180, md: 180 },
};

const reviewPlaceholderProps = {
  width: "100%",
  height: { xs: 288, md: 288 },
};

export default function DetailProductContent({ product, id }: DetailProductContentProps) {
  const t = useTranslations();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [initialEditSection, setInitialEditSection] = useState<string>("basic");
  const [minimize, setMinimize] = useState(true);
  const [overflowed, setOverflowed] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setMinimize(true);
  }, [product]);

  useLayoutEffect(() => {
    function updateOverflow() {
      if (descRef.current) {
        const el = descRef.current;
        if (el.scrollHeight > el.clientHeight) {
          setOverflowed(true);
        } else {
          if (minimize) setOverflowed(false);
        }
      }
    }
    window.addEventListener("resize", updateOverflow);
    updateOverflow();
    return () => window.removeEventListener("resize", updateOverflow);
  }, [minimize, product]);

  /**
   * Scroll to review section
   */
  const scrollToReview = () => {
    reviewRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /**
   * Scroll to order section
   */
  const scrollToOrder = () => {
    orderRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /**
   * Handle edit section - opens form and scrolls to the right section
   * @param {string} section - one of: basic, images, sale, detail
   */
  const handleEditSection = (section: string) => {
    setInitialEditSection(section);
    setFormOpen(true);
  };

  /**
   * Toggle minimize description
   */
  const toggleMinimize = () => setMinimize((p) => !p);

  /**
   * Breadcrumb items
   */
  const breadcrumbItems = [
    { label: capitalize(t("management.title", { label: t("product.label") })), href: "/product" },
    { label: product?.title || t("product.detail"), href: `/product/${id}` },
  ];

  /**
   * Update product on success
   */
  const handleUpdateSuccess = async () => {
    await revalidateBook(id);
    router.refresh();
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <CustomBreadcrumbs items={breadcrumbItems} />
        </Box>
        <Stack direction="row" spacing={2}>
          <Button component={Link} href="/product" startIcon={<ArrowBack />} variant="outlined" color="warning">
            {t("back")}
          </Button>
          <Button startIcon={<Edit />} variant="outlined" color="info" onClick={() => handleEditSection("basic")}>
            {t("update")}
          </Button>
        </Stack>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard>
            <ProductImages srcSetList={product?.srcSet ?? []} onAddImage={() => handleEditSection("images")} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard>
            <SectionTitle>
              <InfoIcon fontSize="small" />
              {t("basic")}
              <IconButton size="small" onClick={() => handleEditSection("basic")} sx={{ ml: "auto" }}>
                <Edit fontSize="small" />
              </IconButton>
            </SectionTitle>
            <>
              <BookTitle>{product?.title}</BookTitle>
              <UserInfoRow>
                <Box display="flex" alignItems="center" gap={0.5} onClick={scrollToReview} sx={{ cursor: "pointer" }}>
                  <Typography component="span" sx={{ fontWeight: 500 }}>
                    {(product?.rating ?? 0).toFixed(1)}
                  </Typography>
                  <Rating
                    value={product?.rating ?? 0}
                    readOnly
                    precision={0.5}
                    size="small"
                    icon={<ReviewsIcon fontSize="inherit" />}
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                  />
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Typography component="span">
                    {product?.totalRates
                      ? `(${numFormat.format(product.totalRates)}) ${t("review.label")}`
                      : t("product.recent.reviews.empty")}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <Typography component="span" onClick={scrollToOrder} sx={{ cursor: "pointer" }}>
                  {t("product.sold")}: {numFormat.format(product?.totalOrders ?? 0)}
                </Typography>
              </UserInfoRow>
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" flexWrap="wrap" gap={3} sx={{ fontSize: 14 }}>
                  <span>
                    {t("publisher.label")}:&nbsp;
                    <Link href={`/publisher/${product?.publisher?.id}`}>{product?.publisher?.name || "-"}</Link>
                  </span>
                  <span>
                    {t("category.label")}:&nbsp;
                    <Link href={`/category/${product?.category?.id}`}>{product?.category?.name || "-"}</Link>
                  </span>
                  <span>
                    {t("shop.label")}:&nbsp;
                    <Link href={`/shop/${product?.shopId}`}>{product?.shopName || "-"}</Link>
                  </span>
                </Stack>
              </Box>
              <SecondaryTitle>{t("product.description")}</SecondaryTitle>
              <DescriptionContainer>
                <Description ref={descRef} className={minimize ? "minimize" : ""}>
                  {product?.description || "-"}
                </Description>
                {overflowed && (
                  <Showmore onClick={toggleMinimize}>
                    {minimize ? (
                      <>
                        {t("show.more")} <KeyboardArrowDown fontSize="small" />
                      </>
                    ) : (
                      <>
                        {t("show.less")} <KeyboardArrowUp fontSize="small" />
                      </>
                    )}
                  </Showmore>
                )}
              </DescriptionContainer>
            </>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard>
            <SectionTitle>
              <SaleInfoIcon fontSize="small" />
              {t("product.sale.info")}
              <IconButton size="small" onClick={() => handleEditSection("sale")} sx={{ ml: "auto" }}>
                <Edit fontSize="small" />
              </IconButton>
            </SectionTitle>
            <InfoTable>
              <TableBody>
                <TableRow>
                  <InfoLabel>{t("product.price.original")}</InfoLabel>
                  <InfoValue color="primary">{currencyFormat.format(product?.price || 0)}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("product.price.discount")}</InfoLabel>
                  <InfoValue>
                    {product?.discount ? (
                      <>
                        {currencyFormat.format(-(product?.price || 0) * Number(product?.discount || 0))}
                        <Chip
                          label={`-${(Number(product?.discount || 0) * 100).toFixed(0)}%`}
                          color="success"
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </>
                    ) : (
                      "-"
                    )}
                  </InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("quantity.label")}</InfoLabel>
                  <InfoValue color={product?.amount && product?.amount > 0 ? undefined : "error"}>
                    {product?.amount ?? 0}
                  </InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("product.sale.size")}</InfoLabel>
                  <InfoValue>{product?.size || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("product.sale.weight")}</InfoLabel>
                  <InfoValue>{product?.weight ? `${product?.weight} g` : "-"}</InfoValue>
                </TableRow>
              </TableBody>
            </InfoTable>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard>
            <SectionTitle>
              <DetailIcon fontSize="small" />
              {t("product.detail")}
              <IconButton size="small" onClick={() => handleEditSection("detail")} sx={{ ml: "auto" }}>
                <Edit fontSize="small" />
              </IconButton>
            </SectionTitle>
            <InfoTable>
              <TableBody>
                <TableRow>
                  <InfoLabel>{t("id")}</InfoLabel>
                  <InfoValue>{idFormatter(Number(product?.id))}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("product.pages")}</InfoLabel>
                  <InfoValue>{product?.pages || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("language.label")}</InfoLabel>
                  <InfoValue>{product?.language ? t(getBookLanguage(product?.language).label) : "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("product.date")}</InfoLabel>
                  <InfoValue>{product?.date ? dateFormatter(new Date(product?.date)) : "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("product.author")}</InfoLabel>
                  <InfoValue>{product?.author || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("product.type.label")}</InfoLabel>
                  <InfoValue>{product?.type ? t(getBookType(product?.type).label) : "-"}</InfoValue>
                </TableRow>
              </TableBody>
            </InfoTable>
          </SectionCard>
        </Grid>
        <Grid size={12} container ref={orderRef}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionCard>
              <SectionTitle>
                <OrdersIcon fontSize="small" />
                {t("product.recent.orders.label")}
                <IconButton component={Link} href={`/product/order?productId=${id}`} size="small" sx={{ ml: "auto" }}>
                  <OpenInNew fontSize="small" />
                </IconButton>
              </SectionTitle>
              <LazyLoadComponent
                threshold={0.15}
                sx={orderPlaceholderProps}
                placeholder={<Placeholder sx={orderPlaceholderProps} />}
              >
                <RecentOrdersComponent id={id} enabled={!!product} />
              </LazyLoadComponent>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionCard>
              <SectionTitle>
                <ShowChart fontSize="small" />
                {t("analytics.sales")}
              </SectionTitle>
              <LazyLoadComponent
                threshold={0.15}
                sx={orderPlaceholderProps}
                placeholder={<Placeholder sx={orderPlaceholderProps} />}
              >
                <SalesLineChart
                  bookId={Number(id)}
                  shopId={product?.shopId}
                  startDate={new Date(new Date().setMonth(new Date().getMonth() - 6))}
                  endDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
                />
              </LazyLoadComponent>
            </SectionCard>
          </Grid>
        </Grid>
        <Grid size={12} container ref={reviewRef}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionCard>
              <SectionTitle>
                <ReviewsIcon fontSize="small" />
                {t("product.recent.reviews.label")}
                <IconButton component={Link} href={`/product/review?productId=${id}`} size="small" sx={{ ml: "auto" }}>
                  <OpenInNew fontSize="small" />
                </IconButton>
              </SectionTitle>
              <LazyLoadComponent
                threshold={0.15}
                sx={reviewPlaceholderProps}
                placeholder={<Placeholder sx={reviewPlaceholderProps} />}
              >
                <RecentReviewsComponent id={id} enabled={!!product} />
              </LazyLoadComponent>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionCard>
              <SectionTitle>
                <PieChartIcon fontSize="small" />
                {t("analytics.rating")}
              </SectionTitle>
              <LazyLoadComponent
                threshold={0.15}
                sx={reviewPlaceholderProps}
                placeholder={<Placeholder sx={reviewPlaceholderProps} />}
              >
                <ReviewsDistributionPieChart bookId={Number(id)} shopId={product?.shopId} />
              </LazyLoadComponent>
            </SectionCard>
          </Grid>
        </Grid>
      </Grid>
      {product && (
        <ProductFormDialog
          product={product as unknown as BookDTO}
          open={formOpen}
          handleClose={() => setFormOpen(false)}
          initialSection={initialEditSection}
          onSubmitSuccess={handleUpdateSuccess}
        />
      )}
    </Box>
  );
}
