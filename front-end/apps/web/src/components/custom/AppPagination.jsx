import styled from "@emotion/styled";
import { Pagination, PaginationItem, MenuItem, paginationItemClasses } from "@mui/material";
import { pageSizes } from "../../utils/filters";
import { useTranslation } from "react-i18next";
import { StyledInput } from "./SortComponents";

//#region styled
const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${({ theme }) => theme.spacing(5)} 0;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    flex-direction: column;
    justify-content: center;
    margin: ${({ theme }) => theme.spacing(2)} 0;
  }
`;

const MoreContainer = styled.div`
  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-top: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledPagination = styled(Pagination)`
  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 100%;
    padding: 0 ${({ theme }) => theme.spacing(1)};

    &.hidden {
      display: none;
    }

    ul {
      display: flex;
      width: 100%;

      li {
        :first-of-type {
          flex-grow: 1;
          display: flex;
        }

        :last-of-type {
          flex-grow: 1;
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
`;

const StyledPageItem = styled(PaginationItem)`
  background-color: ${({ theme }) => theme.vars.palette.action.focus};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: ${({ theme }) => theme.vars.palette.primary.light};
      color: ${({ theme }) => theme.vars.palette.primary.contrastText};
    }
  }

  &.Mui-disabled {
    ${({ theme }) => theme.breakpoints.up("sm")} {
      display: none;
    }
  }

  &.${paginationItemClasses.ellipsis} {
    background-color: transparent;
    font-weight: bold;
  }
`;
//#endregion

const AppPagination = ({ page, count, size, onPageChange, onSizeChange, sizes }) => {
  const { t } = useTranslation();

  // Initial value
  const currPage = page + 1;
  const totalPages = count;

  /**
   * Handle change page
   * @param {Event} e
   * @param {number} page
   */
  const handlePageChange = (e, page) => {
    if (onPageChange) onPageChange(page);
  };

  /**
   * Handle change size
   * @param {Event} e
   */
  const handleChangeSize = (e) => {
    if (onSizeChange) onSizeChange(e.target.value);
  };

  return (
    <Container>
      <StyledPagination
        page={currPage ?? 1}
        count={totalPages}
        shape="rounded"
        color="primary"
        onChange={handlePageChange}
        renderItem={(item) => <StyledPageItem {...item} />}
        className={totalPages == 0 ? "hidden" : ""}
      />
      <MoreContainer>
        <StyledInput size="small" select value={size} onChange={handleChangeSize}>
          {(sizes ?? pageSizes).map((option, index) => (
            <MenuItem value={option} key={`option-${index}`}>
              {t("pagination.display", { count: option })}
            </MenuItem>
          ))}
        </StyledInput>
      </MoreContainer>
    </Container>
  );
};

export default AppPagination;
