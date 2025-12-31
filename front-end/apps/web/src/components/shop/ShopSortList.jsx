import { filterShopsBy, sortShopsBy } from "../../utils/filters";
import {
  SortWrapper,
  SortContainer,
  MainContainer,
  AltContainer,
  FilterTitle,
  StyledInput,
  StyledSortButton,
} from "../custom/SortComponents";
import { useTranslation } from "react-i18next";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Straight from "@mui/icons-material/Straight";
import TipsAndUpdatesOutlined from "@mui/icons-material/TipsAndUpdatesOutlined";
import QuickPagination from "../custom/QuickPagination";

const ShopSortList = ({
  mobileMode,
  pagination,
  keyword,
  onOpenPagination,
  onChangeOrder,
  onChangeDir,
  onChangeFollowed,
  onPageChange,
  onClearKeyword,
}) => {
  const { t } = useTranslation();

  /**
   * Change sort by
   * @param {Event} e
   */
  const handleChangeOrder = (e) => {
    if (onChangeOrder) onChangeOrder(e.target.value);
  };

  /**
   * Change sort direction
   */
  const handleChangeDir = () => {
    let newValue = pagination?.sortDir == "desc" ? "asc" : "desc";
    if (onChangeDir) onChangeDir(newValue);
  };

  /**
   * Mouse down
   * @param {Event} e
   */
  const handleMouseDown = (e) => {
    e.preventDefault();
  };

  /**
   * Change followed filter
   * @param {Event} e
   */
  const handleChangeFollowed = (e) => {
    if (onChangeFollowed) onChangeFollowed(e.target.value);
  };

  /**
   * Clear keyword
   */
  const handleClearKeyword = () => {
    if (onClearKeyword) onClearKeyword();
  };

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton
        aria-label={t("search.sort.toggle")}
        onClick={handleChangeDir}
        onMouseDown={handleMouseDown}
        sx={{ padding: 0, mr: -0.5 }}
        edge="end"
      >
        <Straight
          style={{
            transform: pagination?.sortDir == "desc" ? "scaleY(-1)" : "scaleY(1)",
          }}
        />
      </IconButton>
    </InputAdornment>
  );

  return (
    <SortWrapper>
      <SortContainer>
        <MainContainer>
          <FilterTitle>{t("search.sort.label")}</FilterTitle>
          <StyledInput
            size="small"
            select
            className="sort"
            fullWidth={mobileMode}
            value={pagination?.sortBy}
            onChange={handleChangeOrder}
            slotProps={{
              input: { endAdornment },
              select: { IconComponent: () => null },
            }}
          >
            {sortShopsBy.map((option, index) => (
              <MenuItem key={`sort-${option.label}-${index}`} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </StyledInput>
          <StyledInput
            size="small"
            select
            fullWidth={mobileMode}
            value={pagination?.followed}
            onChange={handleChangeFollowed}
          >
            {filterShopsBy.map((option, index) => (
              <MenuItem key={`filter-${option.label}-${index}`} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </StyledInput>
          <StyledSortButton
            fullWidth={mobileMode}
            onClick={handleClearKeyword}
            endIcon={<TipsAndUpdatesOutlined color={keyword && "warning"} />}
          >
            {t("search.keyword.label")}
          </StyledSortButton>
        </MainContainer>
        <AltContainer>
          <QuickPagination {...{ pagination, onPageChange, onOpenPagination }} />
        </AltContainer>
      </SortContainer>
    </SortWrapper>
  );
};

export default ShopSortList;
