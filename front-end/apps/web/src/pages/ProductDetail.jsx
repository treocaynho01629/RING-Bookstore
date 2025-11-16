import { useState, useRef, lazy, Suspense, useEffect } from "react";
import { Box, Skeleton, Stack, useMediaQuery } from "@mui/material";
import { useParams, Navigate, NavLink, useSearchParams } from "react-router";
import { useGetBookDetailQuery, useGetRandomBooksQuery } from "../features/books/booksApiSlice";
import useTitle from "@ring/shared/useTitle";
import { useGetShopInfoQuery } from "../features/shops/shopsApiSlice";
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

const createCrumbs = (cate) => {
  if (cate) {
    return [
      createCrumbs(cate?.parent),
      <NavLink to={`/store/${cate?.slug}?cate=${cate?.id}`} end key={`crumb-${cate?.id}`}>
        {cate?.name}
      </NavLink>,
    ];
  }
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [isReview, setIsReview] = useState(searchParams.get("review") ?? undefined); //Is open review tab
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
  //useTitle(`${data?.title ?? "RING - Bookstore!"}`);

  useEffect(() => {
    if (isReview) scrollIntoTab();
  }, [isReview]);

  // Toggle review
  const handleToggleReview = (value) => {
    setIsReview(value);
    if (!value) {
      searchParams.delete("review");
    } else {
      searchParams.set("review", true);
    }
    setSearchParams(searchParams, { replace: true });
    scrollIntoTab();
  };

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

  return (
    <>
      {pending && (
        <Suspense fallBack={null}>
          <PendingModal open={pending} message="Đang gửi yêu cầu..." />
        </Suspense>
      )}
      <Box display="relative">
        <CustomBreadcrumbs separator="›" maxItems={4} aria-label="breadcrumb" className="solid">
          {data ? (
            [
              <NavLink to={"/store"} key={"store"}>
                Danh mục sản phẩm
              </NavLink>,
              createCrumbs(data?.category),
              <NavLink to={`/store?pubs=${data?.publisher?.id}`} key={"publisher"}>
                {data?.publisher?.name}
              </NavLink>,
              <NavLink to="#" key={"book-title"}>
                {data?.title}
              </NavLink>,
            ]
          ) : (
            <Skeleton variant="text" sx={{ fontSize: "16px" }} width={300} />
          )}
        </CustomBreadcrumbs>
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
        <CustomDivider>Có thể bạn sẽ thích</CustomDivider>
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
