import styled from "@emotion/styled";
import { useState, useEffect, Fragment, memo, useRef } from "react";
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
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Collapse from "@mui/material/Collapse";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import Radio from "@mui/material/Radio";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FilterAltOff from "@mui/icons-material/FilterAltOff";
import ClassOutlined from "@mui/icons-material/ClassOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import StarHalf from "@mui/icons-material/StarHalf";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import PriceRangeSlider from "./PriceRangeSlider";
import SimpleBar from "simplebar-react";

//#region styled
const FilterWrapper = styled.div`
  position: sticky;
  top: ${({ theme }) => theme.mixins.toolbar.minHeight}px;
  overflow: hidden;
`;

const StyledSimpleBar = styled(SimpleBar)`
  padding: ${({ theme }) => `0 ${theme.spacing(2)} 0 ${theme.spacing(0.5)}`};
  max-height: ${({ theme }) => `calc(100dvh - ${theme.mixins.toolbar.minHeight}px)`};

  .simplebar-track {
    &.simplebar-vertical {
      .simplebar-scrollbar {
        &:before {
          background-color: ${({ theme }) => theme.vars.palette.divider};
        }
      }
    }
  }
`;

const TitleContainer = styled.div`
  width: 100%;
`;

const Filter = styled.div`
  padding: ${({ theme }) => theme.spacing(2)} 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  scroll-margin: ${({ theme }) => theme.mixins.toolbar.minHeight};
`;

const FilterText = styled.h3`
  font-size: 14px;
  text-transform: uppercase;
  margin: 5px 0px;
  color: inherit;
  display: flex;
  align-items: center;
`;

const LabelText = styled.span`
  font-size: 14px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;

  svg {
    color: ${({ theme }) => theme.vars.palette.warning.light};
    font-size: 18px;
  }

  &.warning {
    padding: ${({ theme }) => theme.spacing(1)} 0;
    color: ${({ theme }) => theme.vars.palette.warning.main};
  }
`;

const StyledListItemButton = styled(ListItemButton)`
  padding: 0;
  justify-content: space-between;

  &.secondary {
    padding-left: 16px;
    font-size: 13px;
    color: ${({ theme }) => theme.vars.palette.text.secondary};

    &.Mui-selected {
      color: ${({ theme }) => theme.vars.palette.primary.main};
    }
  }

  &.Mui-selected {
    color: ${({ theme }) => theme.vars.palette.primary.main};
  }
`;

const CheckPlaceholder = styled.div`
  padding: ${({ theme }) => theme.spacing(1)} 0;
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

const ButtonContainer = styled.div`
  position: sticky;
  bottom: 0;
  margin-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  &:before {
    content: "";
    position: absolute;
    left: ${({ theme }) => theme.spacing(-0.5)};
    width: ${({ theme }) => `calc(100% + ${theme.spacing(0.5)})`};
    height: 100%;
    background-color: ${({ theme }) => theme.vars.palette.background.default};
  }
`;
//#endregion

const LIMIT_CATES = 10;
const LIMIT_PUBS = 10;

const CateFilter = memo(({ cateId, shopId, onChangeCate }) => {
  const { t } = useTranslation();

  const childContainedRef = useRef(null);
  const [open, setOpen] = useState(false); // Open sub cate
  const [showmore, setShowmore] = useState(false);

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, isSuccess, isError } = (
    shopId != null ? useGetRelevantCategoriesScrollInfiniteQuery : useGetCategoriesScrollInfiniteQuery
  )({
    include: "children",
    id: shopId,
  });

  /**
   * Handle change cate
   * @param {Object} cate
   */
  const handleCateChange = (cate) => {
    onChangeCate({ id: cate?.id, slug: cate?.slug });
  };

  /**
   * Handle open sub cate
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

  const isCollapsable = data?.pages?.[0]?.totalElements > LIMIT_CATES;
  let containedSelected = () => {
    const checkId = childContainedRef.current || cateId;
    const content = data?.pages?.flatMap((p) => p.content ?? []);
    const ids = content.map((b) => b.id);
    const cateIndex = ids?.indexOf(+checkId);
    return checkId && (cateIndex < 0 || cateIndex >= LIMIT_CATES);
  };
  let catesContent;

  if (isLoading || isError) {
    catesContent = [...Array(LIMIT_CATES)].map((item, index) => (
      <Fragment key={`temp-cate-${index}`}>
        <StyledListItemButton>
          <FilterText>
            <Skeleton variant="text" width={120} />
          </FilterText>
        </StyledListItemButton>
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
        const containedSelected = cate?.children && cate.children.some((child) => child.id == cateId);
        if (containedSelected) childContainedRef.current = id;
        const item = (
          <Fragment key={`cate-${id}-${index}`}>
            <StyledListItemButton selected={cateId == id} onClick={() => handleCateChange(cate)}>
              <FilterText>{cate?.name}</FilterText>
              {cate.children?.length ? (
                open[id] ? (
                  <ExpandLess onClick={(e) => handleClick(e, id)} />
                ) : (
                  <Badge color="primary" variant="dot" invisible={!containedSelected}>
                    <ExpandMore onClick={(e) => handleClick(e, id)} />
                  </Badge>
                )
              ) : null}
            </StyledListItemButton>
            {cate?.children && (
              <Collapse in={open[id]} timeout="auto" unmountOnExit>
                {cate.children?.map((child, subIndex) => (
                  <List key={`${child?.id}-${subIndex}`} component="div" disablePadding>
                    <StyledListItemButton
                      className="secondary"
                      selected={cateId == child?.id}
                      onClick={() => handleCateChange(child)}
                    >
                      <FilterText>{child?.name}</FilterText>
                    </StyledListItemButton>
                  </List>
                ))}
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
          <Collapse in={showmore} timeout="auto" unmountOnExit>
            {collapseContent}
          </Collapse>
        </>
      );
    } else {
      catesContent = (
        <StyledListItemButton>
          <LabelText className="warning">{capitalize(t("message.no", { item: t("category.label") }))}</LabelText>
        </StyledListItemButton>
      );
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
      <List sx={{ width: "100%", py: 0 }} component="nav" aria-labelledby="nested-list-categories">
        {catesContent}
        {isFetching && !isLoading && (
          <StyledListItemButton>
            <FilterText>
              <Skeleton variant="text" width={120} />
            </FilterText>
          </StyledListItemButton>
        )}
      </List>
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

const PublisherFilter = memo(({ pubs, cateId, onChangePubs, pubsRef }) => {
  const { t } = useTranslation();
  const [selectedPub, setSelectedPub] = useState(pubs || []);
  const [showmore, setShowmore] = useState(false);

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, isSuccess, isError } = (
    cateId ? useGetRelevantPublishersScrollInfiniteQuery : useGetPublishersScrollInfiniteQuery
  )({
    cateId,
  });

  useEffect(() => {
    setSelectedPub(pubs);
  }, [pubs]);

  /**
   * Handle change pub
   * @param {Event} e
   */
  const handleChangePub = (e) => {
    const selectedIndex = selectedPub.indexOf(e.target.value);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedPub, e.target.value);
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
    if (onChangePubs) onChangePubs(newSelected);
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
      <CheckPlaceholder key={`pub-temp-${index}`}>
        <Skeleton variant="text" sx={{ fontSize: "14px" }} width={200} />
      </CheckPlaceholder>
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
          <FormControlLabel
            key={`pub-${id}-${index}`}
            disabled={isFetching}
            control={
              <Checkbox
                value={id}
                checked={isItemSelected}
                onChange={handleChangePub}
                disableRipple
                name={pub?.name}
                color="primary"
                size="small"
              />
            }
            sx={{ fontSize: "14px", width: "100%", marginRight: 0 }}
            label={<LabelText>{pub?.name}</LabelText>}
          />
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
          <Collapse in={showmore} timeout="auto" unmountOnExit>
            {collapseContent}
          </Collapse>
        </>
      );
    } else {
      pubsContent = (
        <LabelText className="warning">{capitalize(t("message.no", { item: t("publisher.label") }))}</LabelText>
      );
    }
  }

  return (
    <Filter ref={pubsRef}>
      <TitleContainer>
        <FilterText>
          <ClassOutlined />
          &nbsp;{t("publisher.title")}
        </FilterText>
      </TitleContainer>
      <FormGroup sx={{ padding: 0, width: "100%" }}>
        {pubsContent}
        {isFetching && !isLoading && (
          <CheckPlaceholder>
            <Skeleton variant="text" sx={{ fontSize: "14px" }} width={200} />
          </CheckPlaceholder>
        )}
      </FormGroup>
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

const RangeFilter = memo(({ value, onChangeInputRange, onChangeRange, valueRef }) => {
  const { t } = useTranslation();

  const [valueInput, setValueInput] = useState(value || [0, 10000000]);

  useEffect(() => {
    setValueInput(value);
  }, [value]);

  /**
   * Handle select
   * @param {Event} e
   */
  const handleSelect = (e) => {
    let newValue = e.target.value.split(",").map(Number);
    setValueInput(newValue);
    handleUpdateInputRange(newValue);
  };

  /**
   * Handle change range
   * @param {Array} value
   */
  const handleChangeRange = (value) => {
    setValueInput(value);
    handleUpdateRange(value);
  };

  /**
   * Handle update input range
   * @param {Array} newValue
   */
  const handleUpdateInputRange = (newValue) => {
    if (onChangeInputRange) onChangeInputRange(newValue);
  };

  /**
   * Handle update range
   * @param {Array} newValue
   */
  const handleUpdateRange = (newValue) => {
    if (onChangeRange) onChangeRange(newValue);
  };

  const isSelected = (currValue) => valueInput[0] == currValue[0] && valueInput[1] == currValue[1];

  return (
    <Filter ref={valueRef}>
      <TitleContainer>
        <FilterText>
          <AttachMoneyOutlined />
          &nbsp;{t("search.price.range")}
        </FilterText>
      </TitleContainer>
      <FormGroup sx={{ padding: 0, width: "100%", mb: 1 }}>
        {SUGGEST_PRICES.map((option, index) => (
          <FormControlLabel
            key={`range-${index}`}
            control={
              <Radio
                value={option.value}
                checked={isSelected(option.value)}
                onChange={handleSelect}
                disableRipple
                disableTouchRipple
                disableFocusRipple
                name={option.label}
                color="primary"
                size="small"
              />
            }
            sx={{ fontSize: "14px", width: "100%", marginRight: 0 }}
            label={<LabelText>{option.label}</LabelText>}
          />
        ))}
      </FormGroup>
      <PriceRangeSlider {...{ value: valueInput, onChange: handleChangeRange }} />
    </Filter>
  );
});

const TypeFilter = memo(({ types, onChangeTypes, typesRef }) => {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState(types || []);

  useEffect(() => {
    setSelectedType(types);
  }, [types]);

  /**
   * Handle change type
   * @param {Event} e
   */
  const handleChangeType = (e) => {
    const selectedIndex = selectedType.indexOf(e.target.value);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedType, e.target.value);
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
    if (onChangeTypes) onChangeTypes(newSelected);
  };
  const isSelected = (type) => selectedType.indexOf(type) !== -1;

  return (
    <Filter ref={typesRef}>
      <TitleContainer>
        <FilterText>
          <Inventory2Outlined />
          &nbsp;{t("product.type.label")}
        </FilterText>
      </TitleContainer>
      <FormGroup sx={{ padding: 0, width: "100%" }}>
        {bookTypeOptions.map((option, index) => (
          <FormControlLabel
            key={`type-${index}`}
            control={
              <Checkbox
                value={option.value}
                checked={isSelected(option.value)}
                onChange={handleChangeType}
                disableRipple
                name={t(option.label)}
                color="primary"
                size="small"
              />
            }
            sx={{ fontSize: "14px", width: "100%", marginRight: 0 }}
            label={<LabelText>{t(option.label)}</LabelText>}
          />
        ))}
      </FormGroup>
    </Filter>
  );
});

const RateFilter = memo(({ rating, onChangeRating, rateRef }) => {
  const { t } = useTranslation();

  /**
   * Handle change rate
   * @param {Event} e
   */
  const handleChangeRate = (e) => {
    let newValue = e.target.value;
    if (onChangeRating) onChangeRating(newValue);
  };

  return (
    <Filter ref={rateRef}>
      <TitleContainer>
        <FilterText>
          <StarHalf />
          &nbsp;{t("review.label")}
        </FilterText>
      </TitleContainer>
      <FormGroup sx={{ padding: 0, width: "100%", mb: 1 }}>
        {[...Array(5)].map((item, index) => {
          const isItemSelected = index + 1 == rating;

          return (
            <FormControlLabel
              key={`rating-${index + 1}`}
              control={
                <Radio
                  value={index + 1}
                  checked={isItemSelected}
                  onClick={handleChangeRate}
                  disableRipple
                  disableTouchRipple
                  disableFocusRipple
                  name={`${index + 1} Star${index + 1 !== 1 ? "s" : ""}`}
                  color="primary"
                  size="small"
                />
              }
              sx={{ fontSize: "14px", width: "100%", marginRight: 0 }}
              label={
                <LabelText>
                  {[...Array(index + 1)].map((item, i) => (
                    <Star key={`s-${index}-${i}`} />
                  ))}
                  {[...Array(5 - (index + 1))].map((item, j) => (
                    <StarBorder key={`sb-${index}-${j}`} />
                  ))}
                  {index < 4 && <>&nbsp;{t("above")}</>}
                </LabelText>
              }
            />
          );
        })}
      </FormGroup>
    </Filter>
  );
});

const FilterList = memo(
  ({
    filters,
    onResetFilters,
    onChangeCate,
    onChangePubs,
    onChangeInputRange,
    onChangeRange,
    onChangeTypes,
    onChangeRating,
    pubsRef,
    typesRef,
    valueRef,
    rateRef,
  }) => {
    const { t } = useTranslation();

    return (
      <FilterWrapper>
        <StyledSimpleBar>
          <Stack spacing={{ xs: 1 }} useFlexGap flexWrap="wrap" divider={<Divider flexItem />}>
            <CateFilter
              {...{
                cateId: filters?.cate.id,
                shopId: filters?.shopId,
                onChangeCate,
              }}
            />
            {!filters?.shopId && (
              <PublisherFilter
                {...{
                  pubs: filters?.pubIds,
                  cateId: filters?.cate.id,
                  onChangePubs,
                  pubsRef,
                }}
              />
            )}
            <RangeFilter
              {...{
                value: filters?.value,
                onChangeInputRange,
                onChangeRange,
                valueRef,
              }}
            />
            <TypeFilter {...{ types: filters?.types, onChangeTypes, typesRef }} />
            <RateFilter {...{ rating: filters?.rating, onChangeRating, rateRef }} />
          </Stack>
          <ButtonContainer>
            <Button
              variant="contained"
              color="error"
              size="large"
              fullWidth
              onClick={onResetFilters}
              startIcon={<FilterAltOff />}
            >
              {t("search.filter.clear")}
            </Button>
          </ButtonContainer>
        </StyledSimpleBar>
      </FilterWrapper>
    );
  }
);

export default FilterList;
