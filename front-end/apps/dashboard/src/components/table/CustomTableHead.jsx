import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { visuallyHidden } from "@mui/utils";
import {
  Box,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  tableCellClasses,
  tableRowClasses,
  tableSortLabelClasses,
  Button,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

//#region styled
const StyledTableCell = styled(TableCell)`
  transition: opacity 0.2s ease;
  background-color: transparent;
  white-space: nowrap;

  &.${tableCellClasses.head} {
    padding-top: ${({ theme }) => theme.spacing(1)};
    padding-bottom: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledTableRow = styled(TableRow)`
  &.${tableRowClasses.selected} {
    position: relative;

    .${tableCellClasses.root} {
      color: transparent;
    }

    .${tableSortLabelClasses.root} {
      opacity: 0;
      pointer-events: none;
    }
  }
`;

const StyledDeleteButton = styled(Button)`
  position: absolute;
  right: 8px;
  top: 0;
  bottom: 0;
  margin: auto;
  background-color: transparent;
  z-index: 1;
  visibility: visible;
  transition: all 0.2s ease;

  &.hidden {
    opacity: 0;
    visibility: hidden;
  }
`;

const CountLabel = styled.span`
  position: absolute;
  margin: auto;
  z-index: 1;
  visibility: visible;
  color: ${({ theme }) => theme.vars.palette.text.primary} !important;
  transition: all 0.2s ease;

  &.hidden {
    opacity: 0;
    visibility: hidden;
  }
`;
//#endregion

export default function CustomTableHead({
  headCells,
  onSelectAllClick,
  sortDir,
  sortBy,
  numSelected,
  onRequestSort,
  selectedAll,
  onSubmitDelete,
}) {
  const createSortHandler = (property) => (e) => {
    onRequestSort(e, property);
  };
  const handleSubmitDelete = () => {
    if (onSubmitDelete) onSubmitDelete();
  };

  return (
    <TableHead>
      <StyledTableRow
        className="header"
        role="select-all-checkbox"
        tabIndex={-1}
        selected={numSelected > 0}
        sx={{ bgcolor: "action.hover" }}
      >
        <StyledTableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && !selectedAll}
            checked={selectedAll}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "Select all" }}
          />
        </StyledTableCell>
        {headCells.map((headCell, index) => (
          <StyledTableCell
            key={`headcell-${headCell.id}-${index}`}
            align={headCell.align}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={sortBy === headCell.id ? sortDir : false}
            sx={{ minWidth: headCell.width }}
          >
            {index == 0 && (
              <CountLabel className={numSelected > 0 ? "" : "hidden"}>
                Đang chọn ({numSelected})
              </CountLabel>
            )}
            {index == headCells.length - 1 && onSubmitDelete && (
              <StyledDeleteButton
                className={numSelected > 0 ? "" : "hidden"}
                color="error"
                endIcon={<Delete />}
                disableRipple
                onClick={handleSubmitDelete}
              >
                Xoá
              </StyledDeleteButton>
            )}
            {headCell.sortable ? (
              <TableSortLabel
                active={sortBy === headCell.id}
                direction={sortBy === headCell.id ? sortDir : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {sortBy === headCell.id && (
                  <Box component="span" sx={visuallyHidden}>
                    {sortDir === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                )}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </StyledTableCell>
        ))}
      </StyledTableRow>
    </TableHead>
  );
}

CustomTableHead.propTypes = {
  headCells: PropTypes.array.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  numSelected: PropTypes.number.isRequired,
  selectedAll: PropTypes.bool.isRequired,
  sortDir: PropTypes.oneOf(["asc", "desc"]).isRequired,
  sortBy: PropTypes.string.isRequired,
};
