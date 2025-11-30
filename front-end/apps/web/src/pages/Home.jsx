import styled from "@emotion/styled";
import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useGetCategoriesQuery } from "../features/categories/categoriesApiSlice";
import { useGetBooksQuery, useGetRandomBooksQuery } from "../features/books/booksApiSlice";
import { CustomTab, CustomTabs } from "../components/custom/CustomTabs";
import { useTranslation } from "react-i18next";
import { useGetPublishersQuery } from "../features/publishers/publishersApiSlice";
import { orderTabs } from "../utils/suggest";
import Button from "@mui/material/Button";
import Placeholder from "@ring/ui/Placeholder";
import Suggest from "../components/other/Suggest";
import CustomDivider from "../components/custom/CustomDivider";
import BannersSlider from "../components/other/BannersSlider";
import BarChart from "@mui/icons-material/BarChart";
import Book from "@mui/icons-material/Book";
import Bookmarks from "@mui/icons-material/Bookmarks";
import Category from "@mui/icons-material/Category";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GpsNotFixed from "@mui/icons-material/GpsNotFixed";
import ImportContacts from "@mui/icons-material/ImportContacts";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Replay from "@mui/icons-material/Replay";
import TableChart from "@mui/icons-material/TableChart";
import ThumbUpAlt from "@mui/icons-material/ThumbUpAlt";
import TrendingUp from "@mui/icons-material/TrendingUp";
import LazyLoadComponent from "../components/layout/LazyLoadComponent";

const ProductsSlider = lazy(() => import("../components/product/ProductsSlider"));
const BigProductsSlider = lazy(() => import("../components/product/BigProductsSlider"));
const Products = lazy(() => import("../components/product/Products"));
const Publishers = lazy(() => import("../components/other/Publishers"));
const Categories = lazy(() => import("../components/other/Categories"));
const ProductsTop = lazy(() => import("../components/product/ProductsTop"));

//#region styled
const Wrapper = styled.div`
  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-top: -${({ theme }) => theme.mixins.toolbar.minHeight + 11}px;
  }
`;

const ToggleGroupContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.vars.palette.divider};
  white-space: nowrap;
  padding: 0 10px;
  position: sticky;
  top: ${({ theme }) => theme.mixins.toolbar.minHeight + 16.5}px;
  z-index: 2;

  &.border {
    &::after {
      border-top: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    top: ${({ theme }) => theme.mixins.toolbar.minHeight + 4.5}px;
  }

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: -16px;
    width: 100%;
    height: calc(100% + 16px);
    background-color: ${({ theme }) => theme.vars.palette.background.default};
    z-index: -1;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.vars.palette.action.hover};
    z-index: -1;

    ${({ theme }) => theme.breakpoints.down("sm")} {
      border-left: none;
      border-right: none;
      border-top: none;
    }
  }
`;

const TitleContainer = styled.div`
  position: relative;
  width: 100%;
  font-size: 18px;
  font-weight: 450;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  padding: ${({ theme }) => `${theme.spacing(1.25)} ${theme.spacing(2)}`};
  z-index: 3;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    border-left: none;
    border-right: none;
    margin-bottom: 0px;
    font-size: 16px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing(2.5)} 0;
`;

const MoreButton = styled.span`
  font-size: 12px;
  font-weight: 450;
  color: ${({ theme }) => theme.vars.palette.info.light};
  cursor: pointer;
  display: flex;
  align-items: center;

  &.error {
    color: ${({ theme }) => theme.vars.palette.error.main};
  }
`;

const ContainerTitle = styled.span`
  font-size: 18px;
  font-weight: 450;
  display: flex;
  align-items: center;
  color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.text.primary};

  svg {
    color: inherit;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 16px;
  }
`;

const Container = styled.div`
  margin: ${({ theme }) => theme.spacing(2)} 0;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  ${TitleContainer} {
    border: none;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    border-left: none;
    border-right: none;
  }
`;

const SliderContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(0.5)};
  padding-top: 0;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 0;
  }
`;

const SaleContainer = styled.div`
  position: relative;
  padding: ${({ theme }) => theme.spacing(2.5)} 0;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  ul {
    margin: 0 -1.5px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    width: 100dvw;
    height: 100%;
    transform: translateX(-50%);
    border: 1px solid ${({ theme }) => theme.vars.palette.success.light};
    background-image: repeating-linear-gradient(
      45deg,
      ${({ theme }) => `color-mix(in srgb, ${theme.vars.palette.primary.main}, transparent 80%)`} 0,
      ${({ theme }) => `color-mix(in srgb, ${theme.vars.palette.primary.main}, transparent 80%)`} 10px,
      transparent 0,
      transparent 50%
    );
    background-size: 4em 4em;
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.success.light}, transparent 90%);
    border-left: none;
    border-right: none;
  }
`;
//#endregion

const defaultSize = 15;
const defaultMore = 5;

const cateToTabs = (cate) => {
  return cate?.children?.flatMap(function (child, index) {
    return {
      filters: { cateId: child?.id },
      label: child?.name,
      slug: child?.slug,
    };
  });
};

const Loadable = ({ children, height = 300 }) => {
  const placeholder = <Placeholder sx={{ height }} />;
  return (
    <LazyLoadComponent threshold={0.2} placeholder={placeholder} sx={{ height }}>
      {children}
    </LazyLoadComponent>
  );
};

const SaleList = () => {
  const { t } = useTranslation();
  const { data, isLoading, isFetching, isSuccess, isError, refetch } = useGetBooksQuery({
    sortBy: "discount",
    sortDir: "desc",
  });

  return (
    <>
      <TitleContainer>
        <ContainerTitle color="error">
          <ThumbUpAlt />
          &nbsp;{t("landing.top.label")}
        </ContainerTitle>
        {isError ? (
          <MoreButton className="error" onClick={() => refetch()}>
            {t("reload")} <Replay />
          </MoreButton>
        ) : (
          <Link to={"/store?sort=discount&dir=desc"}>
            <MoreButton>
              {t("show.all")} <KeyboardArrowRight />
            </MoreButton>
          </Link>
        )}
      </TitleContainer>
      <ProductsSlider {...{ isLoading, isFetching, data, isSuccess, isError }} />
    </>
  );
};

const ProductsList = ({ tabs, value, title }) => {
  const { t } = useTranslation();
  const listRef = useRef(null); // Scroll ref
  const [tabValue, setTabValue] = useState(0); // Tab

  // Products
  const filters = tabs ? { ...tabs[tabValue]?.filters, sortDir: "desc" } : value || {};
  const { data, isLoading, isFetching, isSuccess, isError, refetch } = useGetBooksQuery(tabs || value ? filters : {}, {
    skip: !tabs && !value,
  });

  /**
   * Change tab value
   * @param {Event} e
   * @param {String} newValue
   */
  const handleChangeValue = (e, newValue) => {
    if (newValue !== null) {
      setTabValue(newValue);
      listRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  /**
   * Get params from filterse
   * @returns {String}
   */
  const getParams = () => {
    const { sortBy, keyword, cateId, rating, amount, pubIds, type, shopId, sellerId } = filters || {};

    const params = new URLSearchParams();
    if (sortBy) params.append("sort", sortBy);
    if (keyword) params.append("q", keyword);
    if (cateId) params.append("cate", cateId);
    if (rating) params.append("rating", rating);
    if (amount) params.append("amount", amount);
    if (type) params.append("type", type);
    if (shopId) params.append("shop", shopId);
    if (sellerId) params.append("sellerId", sellerId);
    if (pubIds) params.append("pubs", pubIds);
    return params.toString();
  };

  const slug = tabs ? tabs[tabValue]?.slug : null;

  return (
    <>
      {title && (
        <TitleContainer ref={listRef}>
          {title}
          {isError ? (
            <MoreButton className="error" onClick={() => refetch()}>
              {t("reload")} <Replay />
            </MoreButton>
          ) : (
            <Link to={`/store${slug ? `/${slug}` : ""}?${getParams()}`}>
              <MoreButton>
                {t("show.all")} <KeyboardArrowRight />
              </MoreButton>
            </Link>
          )}
        </TitleContainer>
      )}
      {tabs && (
        <ToggleGroupContainer className={title ? "" : "border"}>
          <CustomTabs value={tabValue} onChange={handleChangeValue} scrollButtons="auto">
            {(!tabs?.length ? [...Array(1)] : tabs)?.map((tab, index) => (
              <CustomTab
                key={`${title}-tabs-${t(tab?.label)}-${index}`}
                label={t(tab?.label) ?? t("updating")}
                value={index ?? ""}
              />
            ))}
          </CustomTabs>
        </ToggleGroupContainer>
      )}
      <SliderContainer>
        <ProductsSlider key={tabValue} {...{ isLoading, isFetching, data, isSuccess, isError }} />
      </SliderContainer>
    </>
  );
};

const RandomList = () => {
  const { t } = useTranslation();
  const { data, isLoading, isFetching, isSuccess, isError, refetch } = useGetRandomBooksQuery({ amount: 10 });
  return (
    <>
      <ProductsSlider {...{ isLoading, isFetching, data, isSuccess, isError }} />
      <ButtonContainer>
        {isError ? (
          <Button
            variant="outlined"
            color="error"
            size="medium"
            sx={{ width: 200 }}
            endIcon={<Replay sx={{ marginRight: "-10px" }} />}
            onClick={() => refetch()}
          >
            {t("reload")}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="medium"
            sx={{ width: 200 }}
            endIcon={<Replay sx={{ marginRight: "-10px" }} />}
            onClick={() => refetch()}
          >
            {t("refresh")}
          </Button>
        )}
      </ButtonContainer>
    </>
  );
};

const TopList = ({ categories }) => {
  const { t } = useTranslation();

  const listSize = 5;
  const listRef = useRef(null); // Scroll ref
  const [tabValue, setTabValue] = useState(categories?.ids[0] ?? null); // Tab

  // Products
  const { data, isLoading, isFetching, isSuccess, isError, refetch } = useGetBooksQuery(
    {
      cateId: tabValue,
      size: listSize,
      withDesc: true,
      sortBy: "totalOrders",
      sortDir: "desc",
    },
    { skip: !categories }
  );

  useEffect(() => {
    setTabValue(categories?.ids[0] ?? null);
  }, [categories]);

  /**
   * Change tab value
   * @param {Event} e
   * @param {String} newValue
   */
  const handleChangeValue = (e, newValue) => {
    if (newValue !== null) {
      setTabValue(newValue);
      listRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  let tabs;

  if (categories) {
    const { ids, entities } = categories;

    tabs = ids?.length ? (
      ids?.map((id, index) => {
        const cate = entities[id];

        return <CustomTab key={`top-tab-${id}-${index}`} label={cate?.name ?? t("updating")} value={id ?? ""} />;
      })
    ) : (
      <CustomTab label={t("updating")} value={""} />
    );
  } else {
    tabs = <CustomTab label={t("updating")} value={""} />;
  }

  return (
    <>
      <TitleContainer ref={listRef}>
        <ContainerTitle color="success">
          <BarChart />
          &nbsp;{t("landing.top.selling")}
        </ContainerTitle>
        {isError ? (
          <MoreButton className="error" onClick={() => refetch()}>
            {t("reload")} <Replay />
          </MoreButton>
        ) : (
          <Link to={`/store`}>
            <MoreButton>
              {t("show.all")} <KeyboardArrowRight />
            </MoreButton>
          </Link>
        )}
      </TitleContainer>
      {categories && (
        <ToggleGroupContainer>
          <CustomTabs value={tabValue} onChange={handleChangeValue} scrollButtons="auto">
            {tabs}
          </CustomTabs>
        </ToggleGroupContainer>
      )}
      <ProductsTop {...{ isLoading, isFetching, data, isSuccess, isError, size: listSize }} />
    </>
  );
};

const Home = () => {
  const { t } = useTranslation();

  // Initial value
  const navigate = useNavigate();
  const [catesWithChilds, setCatesWithChilds] = useState([]);
  const [cates, setCates] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [pagination, setPagination] = useState({
    number: 0,
    size: defaultSize,
    isMore: true,
  });

  // Fetch
  const {
    data: categories,
    isLoading: loadCates,
    isSuccess: doneCates,
  } = useGetCategoriesQuery({ include: "children" });
  const { data: publishers, isLoading: loadPubs, isSuccess: donePubs } = useGetPublishersQuery();
  const { data, isLoading, isSuccess, isError } = useGetBooksQuery({
    page: pagination?.number,
    size: pagination?.size,
    loadMore: pagination?.isMore,
  });

  useEffect(() => {
    if (!loadCates && doneCates && categories) {
      const { entities, ids } = categories;
      let catesWithChildren = [];
      let cates = [];

      ids.forEach((id) => {
        const cate = entities[id];
        cate?.children?.length ? catesWithChildren.push(cate) : cates.push(cate);
      });

      setCatesWithChilds(catesWithChildren);
      setCates(cates);
    }
  }, [categories]);

  useEffect(() => {
    if (!loadPubs && donePubs && publishers) {
      const { entities, ids } = publishers;
      let pubsList = ids?.map((id, index) => {
        const pub = entities[id];
        return { filters: { pubIds: [id + ""] }, label: pub?.name };
      });
      setPubs(pubsList);
    }
  }, [publishers]);

  /**
   * Show more products
   */
  const handleShowMore = () => {
    if (pagination?.number >= 5) {
      navigate("/store");
    } else {
      const nextPage = data?.ids?.length / defaultMore;
      if (nextPage >= 1) setPagination({ ...pagination, number: nextPage, size: defaultMore });
    }
  };

  return (
    <Wrapper>
      <BannersSlider />
      <Suggest />
      <CustomDivider>{t("landing.featured")}</CustomDivider>
      <SaleContainer>
        <SaleList />
      </SaleContainer>
      <Container>
        <Loadable>
          <ProductsList
            {...{
              value: { keyword: "toriyama" },
              title: (
                <ContainerTitle>
                  <GpsNotFixed color="primary" />
                  &nbsp;Akira Toriyama
                </ContainerTitle>
              ),
            }}
          />
        </Loadable>
      </Container>
      <Container>
        <TitleContainer>
          <ContainerTitle>
            <Category color="warning" />
            &nbsp;{t("category.title")}
          </ContainerTitle>
        </TitleContainer>
        <Loadable height={118} key={"cates"}>
          <Categories />
        </Loadable>
      </Container>
      <CustomDivider>{t("landing.newest")}</CustomDivider>
      <Container>
        <Loadable height={1140} key={"hot"}>
          <Products {...{ isLoading, data, isSuccess, isError }} />
          <ButtonContainer>
            {isError ? (
              <Button
                variant="outlined"
                color="error"
                size="medium"
                sx={{ width: 200 }}
                endIcon={<Replay sx={{ marginRight: "-10px" }} />}
                onClick={() => refetch()}
              >
                {t("reload")}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="medium"
                sx={{ width: 200 }}
                onClick={handleShowMore}
                endIcon={<ExpandMore sx={{ marginRight: "-10px" }} />}
              >
                {t("show.more")}
              </Button>
            )}
          </ButtonContainer>
        </Loadable>
      </Container>
      <Container>
        <Loadable key={"trending"}>
          <ProductsList
            key={"trending"}
            {...{
              tabs: orderTabs,
              title: (
                <ContainerTitle>
                  <TrendingUp color="success" />
                  &nbsp;{t("landing.trending")}
                </ContainerTitle>
              ),
            }}
          />
        </Loadable>
      </Container>
      <Container>
        <Loadable height={590}>
          <TopList categories={categories} />
        </Loadable>
      </Container>
      <Container>
        <Loadable>
          <ProductsList
            {...{
              value: { cateId: cates[0]?.id },
              title: (
                <ContainerTitle>
                  <Book color="primary" />
                  &nbsp;{cates[0]?.name}
                </ContainerTitle>
              ),
            }}
          />
        </Loadable>
      </Container>
      <Container>
        <Loadable>
          <ProductsList
            {...{
              tabs: pubs.slice(0, 4) || [],
              title: (
                <ContainerTitle>
                  <TableChart color="warning" />
                  &nbsp;{t("landing.top.publisher")}
                </ContainerTitle>
              ),
            }}
          />
        </Loadable>
      </Container>
      <Container>
        <Loadable>
          <ProductsList {...{ tabs: pubs.slice(5, 9) || [] }} />
        </Loadable>
      </Container>
      <Container>
        <TitleContainer>
          <ContainerTitle>
            <Category color="info" />
            &nbsp;{t("publisher.title")}
          </ContainerTitle>
        </TitleContainer>
        <Loadable height={115} key={"pubs"}>
          <Publishers />
        </Loadable>
      </Container>
      {catesWithChilds.map((cate, index) => {
        if (index < catesWithChilds?.length - 1) {
          const tabs = cateToTabs(cate);
          const title = cate.name;

          return (
            <Container key={`cate-${index}`}>
              <Loadable>
                <ProductsList
                  {...{
                    tabs,
                    title: (
                      <ContainerTitle>
                        <Bookmarks color={index % 2 == 0 ? "primary" : "info"} />
                        &nbsp;{title}
                      </ContainerTitle>
                    ),
                  }}
                />
              </Loadable>
            </Container>
          );
        }
      })}
      <CustomDivider>{t("landing.top.featured")}</CustomDivider>
      <Loadable height={430}>
        <BigProductsSlider />
      </Loadable>
      <Container>
        <Loadable>
          <ProductsList
            key={"categories3"}
            {...{
              tabs: cateToTabs(catesWithChilds[catesWithChilds.length - 1]),
              title: (
                <ContainerTitle>
                  <ImportContacts color="success" />
                  &nbsp;{catesWithChilds[catesWithChilds.length - 1]?.name}
                </ContainerTitle>
              ),
            }}
          />
        </Loadable>
      </Container>
      <CustomDivider>{t("product.recommend")}</CustomDivider>
      <Container>
        <Loadable>
          <RandomList />
        </Loadable>
      </Container>
    </Wrapper>
  );
};

export default Home;
