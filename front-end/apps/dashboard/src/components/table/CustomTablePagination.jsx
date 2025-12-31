import { TablePagination } from "@mui/material";
import { useEffect, useState } from "react";

const CustomTablePagination = (props) => {
  const { pagination, onPageChange, onSizeChange, ...otherProps } = props;

  //Initial value
  const [page, setPage] = useState(pagination?.number ?? 0);
  const [size, setSize] = useState(pagination?.size ?? 10);

  //Update value
  useEffect(() => {
    setPage(pagination?.number);
    setSize(pagination?.size);
  }, [pagination]);

  //Change current page
  const handlePageChange = (e, page) => {
    if (onPageChange) onPageChange(page);
  };

  //Change amount display
  const handleChangeSize = (e) => {
    if (onSizeChange) onSizeChange(e.target.value);
  };

  return (
    <TablePagination
      {...otherProps}
      rowsPerPageOptions={[5, 10, 25, 50, 100]}
      component="div"
      labelRowsPerPage={"SL"}
      labelDisplayedRows={function defaultLabelDisplayedRows({
        from,
        to,
        count,
      }) {
        return `${from}–${to}/${count !== -1 ? count : `Có hơn ${to}`}`;
      }}
      page={page}
      rowsPerPage={size}
      showFirstButton
      showLastButton
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleChangeSize}
    />
  );
};

export default CustomTablePagination;
