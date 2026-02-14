import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Menu from "@mui/material/Menu";
import HorizontalSplit from "@mui/icons-material/HorizontalSplit";
import VerticalSplit from "@mui/icons-material/VerticalSplit";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import AirlineStops from "@mui/icons-material/AirlineStops";
import Divider from "@mui/material/Divider";

//#region styled
const Container = styled.div`
  display: flex;
  align-items: center;
`;

const StyledButton = styled(IconButton)`
  border-radius: 0;
  padding: ${({ theme }) => theme.spacing(0.8)};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};

  &:last-child {
    border-left: none;
  }
`;

const Count = styled.span`
  font-size: 16px;
  display: flex;
  cursor: pointer;
  float: left;

  b {
    color: ${({ theme }) => theme.vars.palette.warning.light};
    text-decoration: underline;
  }
`;
//#endregion

const QuickPagination = ({ page, count, mode, onPageChange, onOpenPagination, onChangePaginationMode }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  /**
   * Handle page change
   * @param {number} page - The page number to change to
   */
  const handlePageChange = (page) => {
    if (onPageChange) onPageChange(page);
  };

  /**
   * Handle open jump to page dialog
   */
  const handleOpenPagination = () => {
    if (onOpenPagination) onOpenPagination();
    handleClose();
  };

  /**
   * Handle change pagination mode
   * @param {string} mode
   */
  const handleChangePaginationMode = (mode) => {
    if (onChangePaginationMode) onChangePaginationMode(mode);
    handleClose();
  };

  /**
   * Handle open pagination menu
   * @param {Event} event
   */
  const handleOpen = (event) => {
    if (mode) {
      setAnchorEl(event.currentTarget);
    } else {
      handleOpenPagination();
    }
  };

  /**
   * Handle close pagination menu
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container>
      {!isNaN(page) && (
        <Count onClick={handleOpen} aria-label={t("pagination.jump")}>
          <b>{page + 1}</b>/{isNaN(count) ? ".." : count === 0 ? "1" : count}
        </Count>
      )}
      {mode === "pages" && (
        <>
          &emsp;
          <StyledButton aria-label={t("pagination.prev")} disabled={page == 0} onClick={() => handlePageChange(page)}>
            <KeyboardArrowLeft />
          </StyledButton>
          <StyledButton
            aria-label={t("pagination.next")}
            disabled={!count || page + 1 == count}
            onClick={() => handlePageChange(page + 2)}
          >
            <KeyboardArrowRight />
          </StyledButton>
        </>
      )}
      {mode ? (
        <Menu
          id="pagination-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            list: {
              "aria-labelledby": "pagination-buttons",
            },
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <MenuItem onClick={handleOpenPagination}>
            <ListItemIcon>
              <AirlineStops fontSize="small" />
            </ListItemIcon>
            {t("pagination.jump")}
          </MenuItem>
          <Divider />
          <MenuItem selected={mode === "scroll"} onClick={() => handleChangePaginationMode("scroll")}>
            <ListItemIcon>
              <HorizontalSplit fontSize="small" />
            </ListItemIcon>
            {t("pagination.scroll")}
          </MenuItem>
          <MenuItem selected={mode === "pages"} onClick={() => handleChangePaginationMode("pages")}>
            <ListItemIcon>
              <VerticalSplit fontSize="small" />
            </ListItemIcon>
            {t("pagination.pages")}
          </MenuItem>
        </Menu>
      ) : null}
    </Container>
  );
};

export default QuickPagination;
