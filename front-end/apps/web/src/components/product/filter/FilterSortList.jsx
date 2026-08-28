import { booksAmount, sortBooksBy } from "../../../utils/filters";
import {
  SortWrapper,
  SortContainer,
  MainContainer,
  AltContainer,
  FilterTitle,
  StyledInput,
  StyledSortButton,
} from "../../custom/SortComponents";
import { useTranslation } from "react-i18next";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Sort from "@mui/icons-material/Sort";
import Straight from "@mui/icons-material/Straight";
import QuickPagination from "../../custom/QuickPagination";

const FilterSortList = ({
  mobileMode,
  pagination,
  totalPages,
  onOpenPagination,
  onChangeOrder,
  onChangeDir,
  onChangeAmount,
  onPageChange,
  onOpenFilters,
  isChanged,
  onChangePaginationMode,
}) => {
  const { t } = useTranslation();
  const isUnknownSort = !sortBooksBy.some((option) => option.value === pagination?.sortBy);

  /**
   * Change order by value
   * @param {Event} e
   */
  const handleChangeOrder = (e) => {
    if (onChangeOrder) onChangeOrder(e.target.value);
  };

  /**
   * Change direction
   */
  const handleChangeDir = () => {
    let newValue = pagination?.sortDir == "desc" ? "asc" : "desc";
    if (onChangeDir) onChangeDir(newValue);
  };

  /**
   * Handle mouse down
   * @param {Event} e
   */
  const handleMouseDown = (e) => {
    e.preventDefault();
  };

  /**
   * Change amount
   * @param {Event} e
   */
  const handleChangeAmount = (e) => {
    if (onChangeAmount) onChangeAmount(e.target.value);
  };

  /**
   * Handle set open
   */
  const handleSetOpen = () => {
    if (onOpenFilters) onOpenFilters();
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
            sx={{ mr: 1 }}
          >
            {sortBooksBy.map((option, index) => (
              <MenuItem key={`sort-${option.label}-${index}`} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
            {isUnknownSort && <MenuItem value={pagination?.sortBy}>{t("search.sort.default")}</MenuItem>}
          </StyledInput>
          <StyledInput
            size="small"
            select
            fullWidth={mobileMode}
            value={pagination?.amount}
            onChange={handleChangeAmount}
            sx={{ mr: 1 }}
          >
            {booksAmount.map((option, index) => (
              <MenuItem key={`amount-${option.label}-${index}`} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </StyledInput>
          <StyledSortButton
            fullWidth={mobileMode}
            onClick={handleSetOpen}
            endIcon={
              <Badge color="primary" variant="dot" invisible={!isChanged}>
                <Sort />
              </Badge>
            }
          >
            {t("search.filter.filtering")}
          </StyledSortButton>
        </MainContainer>
        {!mobileMode && (
          <AltContainer>
            <QuickPagination
              {...{
                page: pagination?.number,
                count: totalPages,
                mode: pagination.mode,
                onPageChange,
                onOpenPagination,
                onChangePaginationMode,
              }}
            />
          </AltContainer>
        )}
      </SortContainer>
    </SortWrapper>
  );
};

export default FilterSortList;
