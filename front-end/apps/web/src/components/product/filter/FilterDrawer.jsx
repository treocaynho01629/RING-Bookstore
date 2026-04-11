import styled from "@emotion/styled";
import { Fragment, useState, useEffect, memo, useRef } from "react";
import { bookTypeOptions } from "@ring/shared/enums/book";
import {
  useGetCategoriesScrollInfiniteQuery,
  useGetRelevantCategoriesScrollInfiniteQuery,
} from "../../../features/categories/categoriesApiSlice";
import {
  useGetPublishersScrollInfiniteQuery,
  useGetRelevantPublishersScrollInfiniteQuery,
} from "../../../features/publishers/publishersApiSlice";
import { SUGGEST_PRICES } from "@ring/shared/utils/filters";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash-es";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Collapse from "@mui/material/Collapse";
import Badge from "@mui/material/Badge";
import Check from "@mui/icons-material/Check";
import FilterAltOff from "@mui/icons-material/FilterAltOff";
import ClassOutlined from "@mui/icons-material/ClassOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import StarHalf from "@mui/icons-material/StarHalf";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PriceRangeSlider from "./PriceRangeSlider";

//#region styled
const DrawerContainer = styled.div`
  max-height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 550px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    max-width: 350px;
  }
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 250px;
`;

const Filter = styled.div``;

const FilterText = styled.h3`
  font-size: 16px;
  text-transform: capitalize;
  margin: 8px 0px;
  color: inherit;
  display: flex;
  align-items: center;
`;

const ContentText = styled.span`
  width: 100%;
  font-size: 14px;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  @supports (-webkit-line-clamp: 1) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
`;

const SliderContainer = styled.div`
  width: 100%;
`;

const StyledButton = styled.span`
  width: ${({ theme }) => `calc(50% - ${theme.spacing(0.5)})`};
  padding: 6px;
  background-color: ${({ theme }) => theme.vars.palette.action.focus};
  border: 1px solid transparent;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: width 0.2s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: ${({ theme }) => theme.vars.palette.action.hover};
    }
  }

  &.filled {
    width: 100%;
  }

  &.expanded {
    width: 100%;
    border-color: ${({ theme }) => theme.vars.palette.primary.main};
    background-color: ${({ theme }) => theme.vars.palette.action.hover};
  }

  &.checked,
  &.active {
    color: ${({ theme }) => theme.vars.palette.primary.dark};
    background-color: ${({ theme }) =>
      `color-mix(in srgb, ${theme.vars.palette.primary.light}, 
      transparent 90%)`};
    border-color: ${({ theme }) => theme.vars.palette.primary.main};
    font-weight: 450;
  }

  &.checked {
    border-style: dashed;
  }
`;

const StyledStack = styled(Stack)`
  margin-top: ${({ theme }) => theme.spacing(-0.5)};
  padding: 2px;
  border: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};

  ${StyledButton} {
    background-color: ${({ theme }) => theme.vars.palette.action.hover};
    width: ${({ theme }) => `calc(50% - ${theme.spacing(0.5)} - 2px)`};
  }
`;

const Message = styled.span`
  width: 100%;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.vars.palette.warning.main};
`;

const Showmore = styled.div`
  font-size: 14px;
  font-weight: 500;
  padding-top: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.vars.palette.info.main};
  cursor: pointer;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-top: 0;
  }
`;
//#endregion

const LIMIT_CATES = 4;
const LIMIT_PUBS = 4;

const CateFilter = memo(({ cateId, shopId, onChangeCate }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false); // Open sub cate
  const [showmore, setShowmore] = useState(false);
  const childContainedRef = useRef(null);

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, isSuccess, isError } = (
    shopId ? useGetRelevantCategoriesScrollInfiniteQuery : useGetCategoriesScrollInfiniteQuery
  )({
    include: "children",
    id: shopId,
  });

  /**
   * Handle change cate
   * @param {Object} cate
   */
  const handleCateChange = (cate) => {
    onChangeCate({ id: cate?.id ?? "", slug: cate?.slug ?? "" });
  };

  /**
   * Handle click cate
   * @param {Event} e
   * @param {string} id
   */
  const handleClick = (e, id) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    e.stopPropagation();
  };

  /**
   * Handle show more
   */
  const handleShowMore = () => {
    const totalPages = data?.pages?.[0]?.totalPages;
    const currentPage = data?.pageParams?.[data?.pageParams?.length - 1] || 0;
    if (totalPages <= currentPage + 1) {
      setShowmore((prev) => !prev);
    } else {
      setShowmore(true);
    }

    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  };

  /**
   * Handle contained selected
   */
  const isCollapsable = data?.pages?.[0]?.totalElements > LIMIT_CATES;
  const containedSelected = () => {
    const checkId = childContainedRef.current || cateId;
    const cateIndex = data?.pages
      ?.flatMap((p) => p.content ?? [])
      .map((b) => b.id)
      .indexOf(+checkId);
    return checkId && (cateIndex < 0 || cateIndex >= LIMIT_CATES);
  };
  let catesContent;

  if (isLoading || isError) {
    catesContent = [...Array(LIMIT_CATES)].map((item, index) => (
      <Fragment key={`temp-cate-${index}`}>
        <Skeleton variant="rectangular" height={38} width="48%" />
      </Fragment>
    ));
  } else if (isSuccess) {
    const content = data?.pages?.flatMap((p) => p.content ?? []);
    const ids = content.map((b) => b.id);
    const entities = Object.fromEntries(content.map((b) => [b.id, b]));

    if (ids?.length) {
      let limitContent = [];
      let collapseContent = [];

      ids?.forEach((id, index) => {
        const cate = entities[id];
        const containedSelected = cate?.children && cate?.children.some((child) => child.id == cateId);
        if (containedSelected) childContainedRef.current = id;
        const item = (
          <Fragment key={`cate-${id}-${index}`}>
            <StyledButton
              className={`${cateId == id ? "active" : ""}${open[id] ? " expanded" : ""}`}
              onClick={() => handleCateChange(cate)}
            >
              <ContentText>{cate?.name}</ContentText>
              {cate.children?.length ? (
                open[id] ? (
                  <ExpandLess onClick={(e) => handleClick(e, id)} />
                ) : (
                  <Badge color="primary" variant="dot" invisible={!containedSelected}>
                    <ExpandMore onClick={(e) => handleClick(e, id)} />
                  </Badge>
                )
              ) : null}
            </StyledButton>
            {cate?.children && (
              <Collapse in={open[id]} sx={{ width: "100%" }} timeout="auto" unmountOnExit>
                <StyledStack spacing={1} direction="row" useFlexGap flexWrap="wrap">
                  {cate.children?.map((child, subIndex) => (
                    <StyledButton
                      key={`${child?.id}-${subIndex}`}
                      className={cateId == child?.id ? "active" : ""}
                      onClick={() => handleCateChange(child)}
                    >
                      <ContentText>{child?.name}</ContentText>
                    </StyledButton>
                  ))}
                </StyledStack>
              </Collapse>
            )}
          </Fragment>
        );

        if (index < LIMIT_CATES) {
          limitContent.push(item);
        } else {
          collapseContent.push(item);
        }
      });

      catesContent = (
        <>
          {limitContent}
          <Collapse in={showmore} sx={{ width: "100%" }} timeout="auto" unmountOnExit>
            <Stack spacing={{ xs: 1 }} direction="row" useFlexGap flexWrap="wrap">
              {collapseContent}
            </Stack>
          </Collapse>
        </>
      );
    } else {
      catesContent = <Message>{capitalize(t("message.no", { item: t("category.label") }))}</Message>;
    }
  }

  return (
    <Filter>
      <TitleContainer>
        <FilterText>
          <CategoryOutlined />
          &nbsp;{t("category.label")}
        </FilterText>
      </TitleContainer>
      <Stack spacing={{ xs: 1 }} direction="row" useFlexGap flexWrap="wrap">
        {catesContent}
        {isFetching && !isLoading && (
          <>
            <Skeleton variant="rectangular" height={38} width="48%" />
            <Skeleton variant="rectangular" height={38} width="48%" />
          </>
        )}
      </Stack>
      {!isFetching && isCollapsable && (
        <Showmore onClick={handleShowMore}>
          {!showmore || hasNextPage ? (
            <>
              {t("show.more")}
              <Badge color="primary" variant="dot" invisible={!containedSelected()}>
                <ExpandMore />
              </Badge>
            </>
          ) : (
            <>
              {t("show.less")} <ExpandLess />
            </>
          )}
        </Showmore>
      )}
    </Filter>
  );
});

const PublisherFilter = memo(({ pubs, cateId, onChangePub }) => {
  const { t } = useTranslation();
  const [selectedPub, setSelectedPub] = useState(pubs || []);
  const [showmore, setShowmore] = useState(false);

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, isSuccess, isError } = (
    cateId ? useGetRelevantPublishersScrollInfiniteQuery : useGetPublishersScrollInfiniteQuery
  )({
    cateId,
  });

  /**
   * Handle change pub
   * @param {string} id
   */
  const handleChangePub = (id) => {
    const selectedIndex = selectedPub.indexOf(String(id));
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedPub, String(id));
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedPub.slice(1));
    } else if (selectedIndex === selectedPub.length - 1) {
      newSelected = newSelected.concat(selectedPub.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selectedPub.slice(0, selectedIndex), selectedPub.slice(selectedIndex + 1));
    }

    setSelectedPub(newSelected);
    handleUpdatePubs(newSelected);
  };

  /**
   * Handle update pubs
   * @param {Array} newSelected
   */
  const handleUpdatePubs = (newSelected) => {
    if (onChangePub) onChangePub(newSelected);
  };

  /**
   * Handle show more
   */
  const handleShowMore = () => {
    const totalPages = data?.pages?.[0]?.totalPages;
    const currentPage = data?.pageParams?.[data?.pageParams?.length - 1] || 0;
    if (totalPages <= currentPage + 1) {
      setShowmore((prev) => !prev);
    } else {
      setShowmore(true);
    }

    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  };

  const isSelected = (id) => selectedPub.indexOf(id) !== -1;
  const isCollapsable = data?.pages?.[0]?.totalElements > LIMIT_PUBS;
  let containedSelected = false;
  const isContained = (id) => {
    const pubIndex = data?.pages
      ?.flatMap((p) => p.content ?? [])
      .map((b) => b.id)
      .indexOf(id);
    return selectedPub?.length && (pubIndex < 0 || pubIndex >= LIMIT_PUBS);
  };
  let pubsContent;

  if (isLoading || isError) {
    pubsContent = [...Array(LIMIT_PUBS)].map((item, index) => (
      <Fragment key={`pub-temp-${index}`}>
        <Skeleton variant="rectangular" height={38} width="48%" />
      </Fragment>
    ));
  } else if (isSuccess) {
    const content = data?.pages?.flatMap((p) => p.content ?? []);
    const ids = content.map((b) => b.id);
    const entities = Object.fromEntries(content.map((b) => [b.id, b]));

    if (ids?.length) {
      let limitContent = [];
      let collapseContent = [];

      ids?.forEach((id, index) => {
        const pub = entities[id];
        const isItemSelected = isSelected(`${id}`);
        if (isItemSelected && !containedSelected) containedSelected = isContained(id);

        const item = (
          <StyledButton
            key={`pub-${id}-${index}`}
            className={isItemSelected ? "checked" : ""}
            onClick={() => handleChangePub(id)}
          >
            <ContentText>{pub?.name}</ContentText>
          </StyledButton>
        );

        if (index < LIMIT_PUBS) {
          limitContent.push(item);
        } else {
          collapseContent.push(item);
        }
      });

      pubsContent = (
        <>
          {limitContent}
          <Collapse in={showmore} sx={{ width: "100%" }} timeout="auto" unmountOnExit>
            <Stack spacing={{ xs: 1 }} direction="row" useFlexGap flexWrap="wrap">
              {collapseContent}
            </Stack>
          </Collapse>
        </>
      );
    } else {
      pubsContent = <Message>{capitalize(t("message.no", { item: t("publisher.label") }))}</Message>;
    }
  }

  return (
    <Filter>
      <TitleContainer>
        <FilterText>
          {" "}
          <ClassOutlined />
          &nbsp;{t("publisher.title")}
        </FilterText>
      </TitleContainer>
      <Stack spacing={{ xs: 1 }} direction="row" useFlexGap flexWrap="wrap">
        {pubsContent}
        {isFetching && !isLoading && (
          <>
            <Skeleton variant="rectangular" height={38} width="48%" />
            <Skeleton variant="rectangular" height={38} width="48%" />
          </>
        )}
      </Stack>
      {!isFetching && isCollapsable && (
        <Showmore onClick={handleShowMore}>
          {!showmore || hasNextPage ? (
            <>
              {t("show.more")}
              <Badge color="primary" variant="dot" invisible={!containedSelected}>
                <ExpandMore />
              </Badge>
            </>
          ) : (
            <>
              {t("show.less")} <ExpandLess />
            </>
          )}
        </Showmore>
      )}
    </Filter>
  );
});

const RangeFilter = memo(({ value, onChangeRange }) => {
  const { t } = useTranslation();
  const [valueInput, setValueInput] = useState(value || [0, 10000000]);

  /**
   * Handle update range
   * @param {Array} newValue
   */
  const handleUpdateRange = (newValue) => {
    if (onChangeRange) onChangeRange(newValue);
  };

  /**
   * Handle touch drag
   * @param {Event} e
   */
  const handleTouchDrag = (e) => {
    e.nativeEvent.defaultMuiPrevented = true;
  }; // Prevent drag slider along with drawer

  /**
   * Handle change range
   * @param {Array} value
   */
  const handleChangeRange = (value) => {
    setValueInput(value);
    handleUpdateRange(value);
  };

  const isSelected = (currValue) => valueInput[0] == currValue[0] && valueInput[1] == currValue[1];

  return (
    <Filter>
      <TitleContainer>
        <FilterText>
          <AttachMoneyOutlined />
          &nbsp;{t("search.price.range")}
        </FilterText>
      </TitleContainer>
      <Stack spacing={{ xs: 1 }} direction="row" useFlexGap flexWrap="wrap">
        {SUGGEST_PRICES.map((option, index) => {
          const isItemSelected = isSelected(option.value);

          return (
            <StyledButton
              key={`range-${index}`}
              className={`${isItemSelected ? "active" : ""}${index + 1 == SUGGEST_PRICES.length ? " filled" : ""}`}
              onClick={() => handleChangeRange(option.value)}
            >
              <ContentText>{option.label}</ContentText>
            </StyledButton>
          );
        })}
        <SliderContainer onTouchStart={handleTouchDrag}>
          <PriceRangeSlider
            {...{
              value: valueInput,
              onChange: handleChangeRange,
              disabledLabel: true,
            }}
          />
        </SliderContainer>
      </Stack>
    </Filter>
  );
});

const TypeFilter = memo(({ types, onChangeType }) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState(types || []);

  /**
   * Handle change type
   * @param {string} value
   */
  const handleChangeType = (value) => {
    const selectedIndex = selectedType.indexOf(value);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedType, value);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedType.slice(1));
    } else if (selectedIndex === selectedType.length - 1) {
      newSelected = newSelected.concat(selectedType.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selectedType.slice(0, selectedIndex), selectedType.slice(selectedIndex + 1));
    }

    setSelectedType(newSelected);
    handleUpdateType(newSelected);
  };

  /**
   * Handle update type
   * @param {Array} newSelected
   */
  const handleUpdateType = (newSelected) => {
    if (onChangeType) onChangeType(newSelected);
  };
  const isSelected = (type) => selectedType.indexOf(type) !== -1;

  return (
    <Filter>
      <TitleContainer>
        <FilterText>
          <Inventory2Outlined />
          &nbsp;{t("product.type.label")}
        </FilterText>
      </TitleContainer>
      <Stack spacing={{ xs: 1 }} direction="row" useFlexGap flexWrap="wrap">
        {bookTypeOptions.map((option, index) => {
          const isItemSelected = isSelected(option.value);

          return (
            <StyledButton
              key={`type-${index}`}
              className={isItemSelected ? "checked" : ""}
              onClick={() => handleChangeType(option.value)}
            >
              <ContentText>{t(option.label)}</ContentText>
            </StyledButton>
          );
        })}
      </Stack>
    </Filter>
  );
});

const RateFilter = memo(({ rating, onChangeRate }) => {
  const { t } = useTranslation();
  const handleChangeRate = (value) => {
    if (onChangeRate) onChangeRate(value);
  };

  return (
    <Filter>
      <TitleContainer>
        <FilterText>
          <StarHalf />
          &nbsp;{t("review.label")}
        </FilterText>
      </TitleContainer>
      <Stack spacing={{ xs: 1 }} direction="row" useFlexGap flexWrap="wrap">
        {[...Array(5)].map((item, index) => {
          const isItemSelected = index + 1 == rating;

          return (
            <StyledButton
              key={`type-${index}`}
              className={isItemSelected ? "active" : ""}
              onClick={() => handleChangeRate(index + 1)}
            >
              <ContentText>
                {`${index + 1}★`} {index < 4 && t("above")}
              </ContentText>
            </StyledButton>
          );
        })}
      </Stack>
    </Filter>
  );
});

const FilterDrawer = ({ filters, onApplyFilters, onResetFilters, open, handleClose, handleOpen, defaultFilters }) => {
  const { t } = useTranslation();
  const [currFilters, setCurrFilters] = useState(filters);

  /**
   * Handle update filters
   * @param {Object} filters
   */
  useEffect(() => {
    setCurrFilters(filters);
  }, [filters]);

  /**
   * Handle change cate
   * @param {Object} newValue
   */
  const onChangeCate = (newValue) => {
    setCurrFilters((prev) => ({
      ...prev,
      cate: prev.cate.id == newValue?.id ? { id: "", slug: "" } : newValue,
      pubs: defaultFilters?.pubIds,
    }));
  };

  /**
   * Handle change pub
   * @param {Array} newValue
   */
  const onChangePub = (newValue) => {
    setCurrFilters((prev) => ({ ...prev, pubIds: newValue }));
  };

  /**
   * Handle change range
   * @param {Array} newValue
   */
  const onChangeRange = (newValue) => {
    setCurrFilters((prev) => ({ ...prev, value: newValue }));
  };

  /**
   * Handle change type
   * @param {Array} newValue
   */
  const onChangeType = (newValue) => {
    setCurrFilters((prev) => ({ ...prev, types: newValue }));
  };

  /**
   * Handle change rate
   * @param {number} newValue
   */
  const onChangeRate = (newValue) => {
    setCurrFilters((prev) => ({
      ...prev,
      rating: prev.rating == newValue ? "" : newValue,
    }));
  };

  /**
   * Handle apply filter
   */
  const handleApplyFilter = () => {
    handleClose();
    if (onApplyFilters) onApplyFilters(currFilters);
  };

  /**
   * Handle reset filter
   */
  const handleResetFilter = () => {
    handleClose();
    if (onResetFilters) onResetFilters();
  };

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      disableBackdropTransition
      disableDiscovery
      swipeAreaWidth={8}
      disableSwipeToOpen={false}
    >
      <DrawerContainer>
        <DialogTitle sx={{ textTransform: "uppercase" }}>{t("search.filter.label")}</DialogTitle>
        <DialogContent dividers sx={{ px: 2, py: 1, flex: "1 1 auto", overflowY: "auto" }}>
          <CateFilter
            {...{
              cateId: currFilters?.cate.id,
              shopId: filters?.shopId,
              onChangeCate,
            }}
          />
          {!filters?.shopId && (
            <PublisherFilter
              {...{
                pubs: currFilters?.pubIds,
                cateId: currFilters?.cate.id,
                onChangePub,
              }}
            />
          )}
          <RangeFilter {...{ value: currFilters?.value, onChangeRange }} />
          <TypeFilter {...{ types: currFilters?.types, onChangeType }} />
          <RateFilter {...{ rating: currFilters?.rating, onChangeRate }} />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            size="large"
            onClick={handleResetFilter}
            startIcon={<FilterAltOff />}
          >
            {t("search.filter.clear")}
          </Button>
          <Button variant="contained" color="primary" size="large" onClick={handleApplyFilter} startIcon={<Check />}>
            {t("apply")}
          </Button>
        </DialogActions>
      </DrawerContainer>
    </SwipeableDrawer>
  );
};

export default FilterDrawer;
