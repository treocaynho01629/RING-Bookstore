import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  FormControlLabel,
  Switch,
  Skeleton,
  TextField,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Button,
} from "@mui/material";
import { Search, MoreHoriz, Edit, Delete, Visibility, FilterAltOff, Add } from "@mui/icons-material";
import { Link } from "react-router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  useDeleteAllBooksMutation,
  useDeleteBookMutation,
  useDeleteBooksInverseMutation,
  useDeleteBooksMutation,
  useGetBooksQuery,
} from "../../features/books/booksApiSlice";
import { ItemTitle, FooterContainer, FooterLabel, StyledStockBar } from "../custom/Components";
import { currencyFormat, idFormatter, useDeepEffect, getBookType, getImageSize } from "@ring/shared";
import { publishersApiSlice } from "../../features/publishers/publishersApiSlice";
import { categoriesApiSlice } from "../../features/categories/categoriesApiSlice";
import { Progress } from "@ring/ui";
import CustomTableHead from "./CustomTableHead";
import CustomTablePagination from "./CustomTablePagination";

const ImageSize = getImageSize();
const BookType = getBookType();
const maxStocks = 199;

const headCells = [
  {
    id: "id",
    align: "center",
    width: "70px",
    disablePadding: false,
    sortable: true,
    label: "ID",
  },
  {
    id: "title",
    align: "left",
    width: "450px",
    disablePadding: false,
    sortable: true,
    label: "Sản phẩm",
  },
  {
    id: "shopId",
    align: "left",
    width: "120px",
    disablePadding: false,
    sortable: true,
    label: "Shop",
  },
  {
    id: "price",
    align: "left",
    width: "130px",
    disablePadding: false,
    sortable: true,
    label: "Giá(đ)",
  },
  {
    id: "amount",
    align: "left",
    width: "75px",
    disablePadding: false,
    sortable: true,
    label: "Số lượng",
  },
  {
    id: "action",
    width: "24px",
    disablePadding: false,
    sortable: false,
  },
];

function ProductFilters({ filters, setFilters }) {
  const inputRef = useRef();
  const [pubIds, setPubIds] = useState(filters.pubIds);
  const [types, setTypes] = useState(filters.types);
  const [pubsPagination, setPubsPagination] = useState({
    number: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [catesPagination, setCatesPagination] = useState({
    number: 0,
    totalPages: 0,
    totalElements: 0,
  });

  const [getPublishers, { data: pubs }] = publishersApiSlice.useLazyGetPublishersQuery();
  const [getCategories, { data: cates }] = categoriesApiSlice.useLazyGetCategoriesQuery();

  const handleOpenPubs = () => {
    if (!pubs) {
      getPublishers({
        page: pubsPagination?.number,
        loadMore: true,
      })
        .unwrap()
        .then((data) => {
          setPubsPagination({
            ...pubsPagination,
            number: data.page,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
          });
        })
        .catch((rejected) => console.error(rejected));
    }
  };

  const handleOpenCates = () => {
    if (!cates) {
      getCategories({
        include: "children",
        page: catesPagination?.number,
        loadMore: true,
      })
        .unwrap()
        .then((data) => {
          setCatesPagination({
            ...catesPagination,
            number: data.page,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
          });
        })
        .catch((rejected) => console.error(rejected));
    }
  };

  const handleShowMorePubs = () => {
    let currPage = (pubsPagination?.number || 0) + 1;
    if (!pubsPagination?.totalPages <= currPage) {
      getPublishers({
        page: currPage,
        loadMore: true,
      })
        .unwrap()
        .then((data) => {
          setPubsPagination({
            ...pubsPagination,
            number: data.page,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
          });
        })
        .catch((rejected) => console.error(rejected));
    }
  };

  const handleShowMoreCates = () => {
    let currPage = (catesPagination?.number || 0) + 1;
    if (!catesPagination?.totalPages <= currPage) {
      getCategories({
        include: "children",
        page: currPage,
        loadMore: true,
      })
        .unwrap()
        .then((data) => {
          setCatesPagination({
            ...catesPagination,
            number: data.page,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
          });
        })
        .catch((rejected) => console.error(rejected));
    }
  };

  const handleChangePubs = useCallback((e) => {
    const value = e.target.value;
    if (!pubIds?.includes(value)) setPubIds(value);
  }, []);

  const handleChangeTypes = useCallback((e) => {
    const value = e.target.value;
    if (!types?.includes(value)) setTypes(value);
  }, []);

  const handleChangeKeyword = useCallback((e) => {
    e.preventDefault();
    if (inputRef) setFilters((prev) => ({ ...prev, keyword: inputRef.current.value }));
  }, []);

  const handleApplyPubs = () => {
    setFilters((prev) => ({ ...prev, pubIds: pubIds }));
  };

  const handleApplyTypes = () => {
    setFilters((prev) => ({ ...prev, types: types }));
  };

  const resetFilter = useCallback(() => {
    setFilters({
      keyword: "",
      cate: "",
      pubIds: [],
      types: [],
    });
    setPubIds([]);
    setTypes([]);
    if (inputRef) inputRef.current.value = "";
  }, []);

  return (
    <Stack width="100%" spacing={1} my={2} direction={{ xs: "column", md: "row" }}>
      <TextField
        label="Nhà xuất bản"
        select
        size="small"
        fullWidth
        slotProps={{
          select: {
            multiple: true,
            value: pubIds,
            onChange: (e) => handleChangePubs(e),
            onOpen: handleOpenPubs,
            onClose: handleApplyPubs,
            renderValue: (selected) => {
              const filteredName = selected?.map((id) => pubs?.entities[id]?.name);
              return filteredName.join(", ");
            },
            MenuProps: {
              slotProps: {
                paper: {
                  style: {
                    maxHeight: 250,
                  },
                },
              },
            },
          },
        }}
      >
        {pubs?.ids?.map((id, index) => {
          const pub = pubs?.entities[id];

          return (
            <MenuItem key={`pub-${id}-${index}`} value={id}>
              <Checkbox sx={{ py: 0.5, pr: 1, pl: 0 }} disableRipple checked={pubIds?.includes(id)} />
              <ListItemText primary={pub?.name} />
            </MenuItem>
          );
        })}
        {pubsPagination?.totalPages > pubsPagination?.number + 1 && (
          <Box display="flex" justifyContent="center">
            <Button onClick={handleShowMorePubs} endIcon={<Add />} fullWidth>
              Tải thêm
            </Button>
          </Box>
        )}
      </TextField>
      <TextField
        label="Danh mục"
        value={filters.cate || ""}
        onChange={(e) => setFilters({ ...filters, cate: e.target.value })}
        select
        defaultValue=""
        size="small"
        fullWidth
        slotProps={{
          select: {
            onOpen: handleOpenCates,
            MenuProps: {
              slotProps: {
                paper: {
                  style: {
                    maxHeight: 250,
                  },
                },
              },
            },
          },
        }}
      >
        <MenuItem value="">
          <em>--Tất cả--</em>
        </MenuItem>
        {cates?.ids?.map((id, index) => {
          const cate = cates?.entities[id];
          const cateList = [];

          cateList.push(
            <MenuItem key={`cate-${id}-${index}`} value={id}>
              {cate?.name}
            </MenuItem>
          );
          {
            cate?.children?.map((child, childIndex) => {
              cateList.push(
                <MenuItem sx={{ pl: 3, fontSize: 15 }} key={`child-cate-${child?.id}-${childIndex}`} value={child?.id}>
                  {child?.name}
                </MenuItem>
              );
            });
          }

          return cateList;
        })}
        {catesPagination?.totalPages > catesPagination?.number + 1 && (
          <Box display="flex" justifyContent="center">
            <Button onClick={handleShowMoreCates} endIcon={<Add />} fullWidth>
              Tải thêm
            </Button>
          </Box>
        )}
      </TextField>
      <TextField
        label="Hình thức"
        select
        size="small"
        fullWidth
        slotProps={{
          select: {
            multiple: true,
            value: types,
            onChange: (e) => handleChangeTypes(e),
            onClose: handleApplyTypes,
            renderValue: (selected) => {
              const filteredLabel = selected?.map((value) => BookType[value].label);
              return filteredLabel.join(", ");
            },
            MenuProps: {
              slotProps: {
                paper: {
                  style: {
                    maxHeight: 250,
                  },
                },
              },
            },
          },
        }}
      >
        {Object.values(BookType).map((type, index) => (
          <MenuItem key={`type-${type.value}-${index}`} value={type.value}>
            <Checkbox sx={{ py: 0.5, pr: 1, pl: 0 }} disableRipple checked={types?.includes(type.value)} />
            <ListItemText primary={type.label} />
          </MenuItem>
        ))}
      </TextField>
      <form style={{ width: "100%" }} onSubmit={handleChangeKeyword}>
        <TextField
          placeholder="Tìm kiếm"
          autoComplete="products"
          id="products"
          size="small"
          inputRef={inputRef}
          fullWidth
          slotProps={{
            input: {
              startAdornment: <Search sx={{ marginRight: 1 }} />,
            },
          }}
        />
      </form>
      <Box display="flex" justifyContent="center">
        <Button sx={{ width: 125 }} color="error" onClick={resetFilter} startIcon={<FilterAltOff />}>
          Xoá bộ lọc
        </Button>
      </Box>
    </Stack>
  );
}

export default function TableProducts({ shop, isAdmin, userId, handleOpenEdit, pending, setPending }) {
  //#region construct
  const [selected, setSelected] = useState([]);
  const [deselected, setDeseletected] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [dense, setDense] = useState(true);
  const [filters, setFilters] = useState({
    keyword: "",
    cate: "",
    pubIds: [],
    types: [],
  });
  const [pagination, setPagination] = useState({
    number: 0,
    size: 10,
    totalPages: 0,
    sortBy: "id",
    sortDir: "desc",
  });

  //Actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextId, setContextId] = useState(null); //Current select product's id
  const openContext = Boolean(anchorEl);

  //Delete hooks
  const [deleteBook] = useDeleteBookMutation();
  const [deleteBooks] = useDeleteBooksMutation();
  const [deleteBooksInverse] = useDeleteBooksInverseMutation();
  const [deleteAll] = useDeleteAllBooksMutation();

  //Fetch books
  const { data, isLoading, isSuccess, isError, error, refetch } = useGetBooksQuery(
    {
      page: pagination?.number,
      size: pagination?.size,
      sortBy: pagination?.sortBy,
      sortDir: pagination?.sortDir,
      shopId: shop ?? "",
      userId: isAdmin ? null : userId,
      keyword: filters.keyword,
      cateId: filters.cate,
      types: filters.types,
      pubIds: filters.pubIds,
      amount: 0,
    },
    { skip: !userId }
  );

  //Set pagination after fetch
  useEffect(() => {
    if (!isLoading && isSuccess && data) {
      setPagination({
        ...pagination,
        totalPages: data?.totalPages,
        number: data?.page,
        size: data?.size,
      });
    }
  }, [data]);

  useDeepEffect(() => {
    handleChangePage(0);
  }, [filters]);

  const handleRequestSort = (e, property) => {
    const isAsc = pagination.sortBy === property && pagination.sortDir === "asc";
    const sortDir = isAsc ? "desc" : "asc";
    setPagination({ ...pagination, sortBy: property, sortDir: sortDir });
  };

  const handleSelectAllClick = (e) => {
    if (e.target.checked) {
      //Selected all
      setSelectedAll(true);
      return;
    }

    //Unselected all
    setSelected([]);
    setDeseletected([]);
    setSelectedAll(false);
  };

  //Select
  const handleClick = (e, id) => {
    if (selectedAll) {
      //Set unselected elements for reverse
      const deselectedIndex = deselected?.indexOf(id);
      let newDeselected = [];

      if (deselectedIndex === -1) {
        newDeselected = newDeselected.concat(deselected, id);
      } else if (deselectedIndex === 0) {
        newDeselected = newDeselected.concat(deselected.slice(1));
      } else if (deselectedIndex === deselected?.length - 1) {
        newDeselected = newDeselected.concat(deselected.slice(0, -1));
      } else if (deselectedIndex > 0) {
        newDeselected = newDeselected.concat(
          deselected.slice(0, deselectedIndex),
          deselected.slice(deselectedIndex + 1)
        );
      }

      setDeseletected(newDeselected);
      if (newDeselected.length == data?.totalElements) {
        setDeseletected([]);
        setSelectedAll(false);
      }
    } else {
      //Set main selected elements
      const selectedIndex = selected?.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected?.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
      }

      setSelected(newSelected);
      if (newSelected.length == data?.totalElements) {
        setSelectedAll(true);
        setSelected([]);
      }
    }
  };

  //Pagination
  const handleChangePage = useCallback(
    (page) => {
      setPagination({ ...pagination, number: page });
    },
    [pagination]
  );

  const handleChangeRowsPerPage = useCallback(
    (size) => {
      handleChangePage(0);
      const newValue = parseInt(size, 10);
      setPagination({ ...pagination, size: newValue });
    },
    [pagination]
  );

  const handleChangeDense = useCallback((e) => {
    setDense(e.target.checked);
  }, []);

  //Actions
  const handleOpenContext = (e, product) => {
    setAnchorEl(e.currentTarget);
    setContextId(product);
  };

  const handleCloseContext = () => {
    setAnchorEl(null);
    setContextId(null);
  };

  const handleDelete = async (id) => {
    if (pending) return;
    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    deleteBook(id)
      .unwrap()
      .then((data) => {
        //Unselected
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === 0) {
          newSelected = newSelected.concat(selected.slice(1));
          setSelected(newSelected);
        }

        enqueueSnackbar("Đã xoá sản phẩm!", { variant: "success" });
        setPending(false);
      })
      .catch((err) => {
        console.error(err);
        if (!err?.status) {
          enqueueSnackbar("Server không phản hồi!", { variant: "error" });
        } else if (err?.status === 409) {
          enqueueSnackbar(err?.data?.message, { variant: "error" });
        } else if (err?.status === 400) {
          enqueueSnackbar("Id không hợp lệ!", { variant: "error" });
        } else {
          enqueueSnackbar("Xoá sản phẩm thất bại!", { variant: "error" });
        }
        setPending(false);
      });
  };

  const handleDeleteMultiples = async () => {
    if (pending) return;
    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    if (selectedAll) {
      if (deselected.length == 0) {
        //Delete all
        deleteAll(shop)
          .unwrap()
          .then((data) => {
            //Unselected
            setSelected([]);
            setDeseletected([]);
            setSelectedAll(false);
            enqueueSnackbar("Đã xoá sản phẩm!", { variant: "success" });
            setPending(false);
          })
          .catch((err) => {
            console.error(err);
            if (!err?.status) {
              enqueueSnackbar("Server không phản hồi!", { variant: "error" });
            } else if (err?.status === 409) {
              enqueueSnackbar(err?.data?.message, { variant: "error" });
            } else if (err?.status === 400) {
              enqueueSnackbar("Id không hợp lệ!", { variant: "error" });
            } else {
              enqueueSnackbar("Xoá sản phẩm thất bại!", { variant: "error" });
            }
            setPending(false);
          });
      } else {
        //Delete books inverse
        deleteBooksInverse({
          shopId: shop ?? "",
          keyword: filters.keyword,
          cateId: filters.cate,
          types: filters.types,
          pubIds: filters.pubIds,
          amount: 0,
          ids: deselected,
        })
          .unwrap()
          .then((data) => {
            //Unselected
            setSelected([]);
            setDeseletected([]);
            setSelectedAll(false);
            enqueueSnackbar("Đã xoá sản phẩm!", { variant: "success" });
            setPending(false);
          })
          .catch((err) => {
            console.error(err);
            if (!err?.status) {
              enqueueSnackbar("Server không phản hồi!", { variant: "error" });
            } else if (err?.status === 409) {
              enqueueSnackbar(err?.data?.message, { variant: "error" });
            } else if (err?.status === 400) {
              enqueueSnackbar("Id không hợp lệ!", { variant: "error" });
            } else {
              enqueueSnackbar("Xoá sản phẩm thất bại!", { variant: "error" });
            }
            setPending(false);
          });
      }
    } else {
      //Delete books
      deleteBooks(selected)
        .unwrap()
        .then((data) => {
          //Unselected
          setSelected([]);
          setDeseletected([]);
          setSelectedAll(false);
          enqueueSnackbar("Đã xoá sản phẩm!", { variant: "success" });
          setPending(false);
        })
        .catch((err) => {
          console.error(err);
          if (!err?.status) {
            enqueueSnackbar("Server không phản hồi!", { variant: "error" });
          } else if (err?.status === 409) {
            enqueueSnackbar(err?.data?.message, { variant: "error" });
          } else if (err?.status === 400) {
            enqueueSnackbar("Id không hợp lệ!", { variant: "error" });
          } else {
            enqueueSnackbar("Xoá sản phẩm thất bại!", { variant: "error" });
          }
          setPending(false);
        });
    }
  };

  const isSelected = (id) =>
    (!selectedAll && selected?.indexOf(id) !== -1) || (selectedAll && deselected?.indexOf(id) === -1);
  const numSelected = selectedAll ? data?.totalElements - deselected?.length : selected?.length;
  const colSpan = headCells.length + 1;
  //#endregion

  let bookRows;

  if (isLoading) {
    bookRows = (
      <TableRow>
        <TableCell
          scope="row"
          padding="none"
          align="center"
          colSpan={colSpan}
          sx={{ position: "relative", height: 300 }}
        >
          <Progress color="primary" />
        </TableCell>
      </TableRow>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    bookRows = ids?.length ? (
      ids?.map((id, index) => {
        const book = entities[id];
        const isItemSelected = isSelected(id);
        const labelId = `enhanced-table-checkbox-${index}`;
        const stockProgress = Math.min((book.amount / maxStocks) * 100, 100);
        const stockStatus =
          stockProgress == 0 ? "error" : stockProgress < 20 ? "warning" : stockProgress < 80 ? "primary" : "info";

        return (
          <TableRow hover aria-checked={isItemSelected} tabIndex={-1} key={id}>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                onChange={(e) => handleClick(e, book.id)}
                checked={isItemSelected}
                inputProps={{
                  "aria-labelledby": labelId,
                }}
              />
            </TableCell>
            <TableCell component="th" id={labelId} scope="row" padding="none" align="center">
              <Link to={`/product/${id}`}>{idFormatter(id)}</Link>
            </TableCell>
            <TableCell align="left">
              <Link to={`/product/${id}`} style={{ display: "flex", alignItems: "center" }}>
                <LazyLoadImage
                  src={book?.image?.srcSet[ImageSize?.TINY?.value]}
                  height={45}
                  width={45}
                  style={{ marginRight: "10px" }}
                  placeholder={<Skeleton width={45} height={45} animation={false} variant="rectangular" />}
                />
                <Box>
                  <ItemTitle>{book.title}</ItemTitle>
                  <Box display="flex">
                    <ItemTitle className="secondary">Đã bán: {book.totalOrders}</ItemTitle>
                    <ItemTitle className="secondary">&emsp;Đánh giá: {book.rating.toFixed(1)}</ItemTitle>
                  </Box>
                </Box>
              </Link>
            </TableCell>
            <TableCell align="left">
              <ItemTitle>{book.shopName}</ItemTitle>
            </TableCell>
            <TableCell align="left">
              <ItemTitle>{currencyFormat.format(book.price * (1 - book.discount))}</ItemTitle>
              {book.discount > 0 && <ItemTitle className="secondary">-{book.discount * 100}%</ItemTitle>}
            </TableCell>
            <TableCell align="left">
              <Box>
                <StyledStockBar color={stockStatus} variant="determinate" value={stockProgress} />
                <ItemTitle className="secondary">{book.amount} trong kho</ItemTitle>
              </Box>
            </TableCell>
            <TableCell align="right">
              <IconButton onClick={(e) => handleOpenContext(e, id)}>
                <MoreHoriz />
              </IconButton>
            </TableCell>
          </TableRow>
        );
      })
    ) : (
      <TableRow>
        <TableCell scope="row" padding="none" align="center" colSpan={colSpan} sx={{ height: 300 }}>
          <Box>Không tìm thấy sản phẩm nào!</Box>
        </TableCell>
      </TableRow>
    );
  } else if (isError) {
    bookRows = (
      <TableRow>
        <TableCell scope="row" padding="none" align="center" colSpan={colSpan} sx={{ height: 300 }}>
          <Box>{error?.error || "Đã xảy ra lỗi"}</Box>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Paper sx={{ width: "100%", height: "100%" }} elevation={3}>
      <button onClick={refetch}>refetch</button>
      <Toolbar>
        <ProductFilters {...{ filters, setFilters }} />
      </Toolbar>
      <TableContainer component={Paper}>
        <Table stickyHeader size={dense ? "small" : "medium"}>
          <CustomTableHead
            headCells={headCells}
            numSelected={numSelected}
            sortBy={pagination.sortBy}
            sortDir={pagination.sortDir}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            onSubmitDelete={handleDeleteMultiples}
            selectedAll={selectedAll}
          />
          <TableBody>{bookRows}</TableBody>
        </Table>
      </TableContainer>
      <FooterContainer>
        <Box pl={2}>
          <FormControlLabel
            control={<Switch checked={dense} onChange={handleChangeDense} />}
            label={<FooterLabel>Thu gọn</FooterLabel>}
          />
        </Box>
        <CustomTablePagination
          pagination={pagination}
          onPageChange={handleChangePage}
          onSizeChange={handleChangeRowsPerPage}
          count={data?.totalElements ?? 0}
        />
      </FooterContainer>
      <Menu open={openContext} onClose={handleCloseContext} anchorEl={anchorEl}>
        <Link to={`/product/${contextId}`}>
          <MenuItem>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xem chi tiết</ListItemText>
          </MenuItem>
        </Link>
        <MenuItem onClick={() => handleOpenEdit(contextId)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Thay đổi</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDelete(contextId)}>
          <ListItemIcon>
            <Delete color="error" fontSize="small" />
          </ListItemIcon>
          <ListItemText color="error">Xoá</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
