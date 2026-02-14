import { useState, useRef, lazy, Suspense, useEffect } from "react";
import { Box, Stack, useMediaQuery } from "@mui/material";
import { useParams, Navigate, useSearchParams } from "react-router";
import { useGetBookDetailQuery, useGetRandomBooksQuery } from "../features/books/booksApiSlice";
import { useTranslation } from "react-i18next";
import { useGetShopInfoQuery } from "../features/shops/shopsApiSlice";
import { createCategoryCrumbs } from "../utils/common-utils";
import useTitle from "@ring/shared/useTitle";
import Placeholder from "@ring/ui/Placeholder";
import CustomDivider from "../components/custom/CustomDivider";
import ProductContent from "../components/product/detail/ProductContent";
import CustomBreadcrumbs from "../components/custom/CustomBreadcrumbs";
import ProductSimple from "../components/product/ProductSimple";
import LazyLoadComponent from "../components/layout/LazyLoadComponent";

const PendingModal = lazy(() => import("@ring/ui"));
const ProductsSlider = lazy(() => import("../components/product/ProductsSlider"));
const ShopDisplay = lazy(() => import("../components/shop/ShopDisplay"));
const ProductDetailContainer = lazy(() => import("../components/product/detail/ProductDetailContainer"));
const ReviewComponent = lazy(() => import("../components/review/ReviewComponent"));

const RandomList = () => {
  const { data, isLoading, isFetching, isSuccess, isError } = useGetRandomBooksQuery({ amount: 10 });
  return <ProductsSlider {...{ isLoading, isFetching, data, isSuccess, isError }} />;
};

const ShopComponent = ({ id, name }) => {
  const { data } = useGetShopInfoQuery(id, { skip: !id });
  const placeholderProps = {
    width: "100%",
    border: ".5px solid",
    borderColor: "divider",
    height: { xs: 98, md: 133 },
  };
  const placeholder = <Placeholder sx={placeholderProps} />;

  return (
    <LazyLoadComponent threshold={0.2} sx={placeholderProps} placeholder={placeholder}>
      <ShopDisplay shop={data} name={name} />
    </LazyLoadComponent>
  );
};

const ProductDetail = () => {
  const { slug, id } = useParams(); // Book id/slug
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isReview, setIsReview] = useState(searchParams.get("review") ?? undefined); // Is open review tab
  const [pending, setPending] = useState(false); // For reviewing & changing address
  const reviewRef = useRef(null); // Ref for scroll
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // Fetch data
  const { data, isLoading, isFetching, isSuccess, isError, error } = useGetBookDetailQuery(
    slug ? { slug } : id ? { id } : null,
    {
      skip: !slug && !id,
    }
  );

  // Set title
  useTitle(data?.title ?? t("product.detail"));

  useEffect(() => {
    if (isReview) scrollIntoTab();
  }, [isReview]);

  /**
   * Toggle review tab
   * @param {boolean} state
   */
  const handleToggleReview = (state) => {
    setIsReview(state);
    if (!state) {
      searchParams.delete("review");
    } else {
      searchParams.set("review", true);
    }
    setSearchParams(searchParams, { replace: true });
    scrollIntoTab();
  };

  /**
   * Scroll to review tab
   */
  const scrollIntoTab = () => {
    reviewRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  let product;

  if (isLoading || isFetching) {
    product = <ProductContent />;
  } else if (isSuccess) {
    product = <ProductContent {...{ book: data, handleToggleReview, pending, setPending }} />;
  } else if (isError && error?.status === 404) {
    product = <Navigate to={"/missing"} replace />;
  } else {
    product = <ProductContent />;
  }

  const breadcrumbItems = [
    { label: t("category.title"), href: "/store", end: true },
    ...createCategoryCrumbs(data?.category),
    { label: data?.publisher?.name, href: `/store?pubs=${data?.publisher?.id}`, end: true },
    { label: data?.title, href: "#" },
  ].filter(Boolean);

  return (
    <>
      {pending && (
        <Suspense fallBack={null}>
          <PendingModal open={pending} message={t("pending")} />
        </Suspense>
      )}
      <Box display="relative">
        <CustomBreadcrumbs items={breadcrumbItems} loading={!data} type="solid" />
        {product}
        <Stack my={1} spacing={1} direction={{ xs: "column-reverse", md: "column" }}>
          <Stack spacing={1}>
            <ShopComponent id={data?.shopId} name={data?.shopName} />
            <LazyLoadComponent
              sx={{
                width: "100%",
                border: ".5px solid",
                borderColor: "divider",
                height: { xs: 610, md: 980 },
              }}
              placeholder={
                <Placeholder
                  sx={{
                    width: "100%",
                    border: ".5px solid",
                    borderColor: "divider",
                    height: { xs: 610, md: 980 },
                  }}
                />
              }
            >
              <ProductDetailContainer
                {...{
                  loading: isLoading || isFetching,
                  book: data,
                  reviewRef,
                  scrollIntoTab,
                  tabletMode,
                  pending,
                  setPending,
                }}
              />
            </LazyLoadComponent>
          </Stack>
          <Box
            ref={reviewRef}
            sx={(theme) => ({
              scrollMargin: theme.mixins.toolbar.minHeight,
            })}
          >
            <LazyLoadComponent
              sx={{
                width: "100%",
                border: ".5px solid",
                borderColor: "divider",
                height: { xs: 310, md: 410 },
              }}
              placeholder={
                <Placeholder
                  sx={{
                    width: "100%",
                    border: ".5px solid",
                    borderColor: "divider",
                    height: { xs: 310, md: 410 },
                  }}
                />
              }
            >
              <ReviewComponent
                {...{
                  book: data,
                  scrollIntoTab,
                  tabletMode,
                  pending,
                  setPending,
                  isReview,
                  handleToggleReview,
                }}
              />
            </LazyLoadComponent>
          </Box>
        </Stack>
        <CustomDivider>{t("product.recommend")}</CustomDivider>
        <LazyLoadComponent
          sx={{
            height: "auto",
            border: ".5px solid",
            borderColor: "action.hover",
            ["div"]: { opacity: 0 },
          }}
          placeholder={
            <Placeholder
              sx={{
                height: "auto",
                border: ".5px solid",
                borderColor: "action.hover",
              }}
            >
              <ProductSimple />
            </Placeholder>
          }
        >
          <RandomList />
        </LazyLoadComponent>
      </Box>
    </>
  );
};

export default ProductDetail;
