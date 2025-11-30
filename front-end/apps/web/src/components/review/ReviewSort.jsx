import styled from "@emotion/styled";
import { sortReviewsBy } from "../../utils/filters";
import { useTranslation } from "react-i18next";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Star from "@mui/icons-material/Star";

//#region styled
const SortContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SortLabel = styled.b`
  margin-right: 16px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;
//#endregion

const ReviewSort = ({ sortBy, handleChangeOrder, filterBy, handleChangeFilter, count }) => {
  const { t } = useTranslation();
  return (
    <SortContainer>
      <SortLabel>{t("search.filter.by")}</SortLabel>
      <TextField size="small" select value={sortBy} onChange={handleChangeOrder} sx={{ marginRight: 1, width: 190 }}>
        {sortReviewsBy.map((item) => (
          <MenuItem key={`sort-item=${item.value}`} value={item.value}>
            {t(item.label)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        select
        value={filterBy}
        onChange={handleChangeFilter}
        sx={{ width: 190 }}
        slotProps={{
          input: {
            startAdornment: <Star fontSize="inherit" sx={{ mr: 1, color: "warning.light" }} />,
          },
        }}
      >
        <MenuItem value={"all"} selected>
          {t("review.sort.all")}
        </MenuItem>
        {[...Array(5)].map((item, index) => (
          <MenuItem key={`filter-item=${index}`} value={index + 1}>
            {`${index + 1} ${index == 0 ? t("review.star") : t("review.stars")} (${count[index]})`}
          </MenuItem>
        ))}
      </TextField>
    </SortContainer>
  );
};

export default ReviewSort;
