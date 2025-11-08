import styled from "@emotion/styled";
import { rateLabels } from "../../utils/filters";
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
  return (
    <SortContainer>
      <SortLabel>Lọc theo</SortLabel>
      <TextField size="small" select value={sortBy} onChange={handleChangeOrder} sx={{ marginRight: 1, width: 190 }}>
        <MenuItem value={"createdDate"}>Xếp theo mới nhất</MenuItem>
        <MenuItem value={"rating"}>Xếp theo đánh giá</MenuItem>
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
          Tất cả đánh giá
        </MenuItem>
        {[...Array(5)].map((item, index) => (
          <MenuItem key={`filter-item=${index}`} value={index + 1}>
            {index + 1} sao ({count[index]})
          </MenuItem>
        ))}
      </TextField>
    </SortContainer>
  );
};

export default ReviewSort;
