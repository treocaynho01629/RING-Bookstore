import { useState, forwardRef, useEffect } from "react";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  MenuItem,
  useMediaQuery,
  Button,
  TextareaAutosize,
  Grid,
} from "@mui/material";
import { Check, Add, Close as CloseIcon, AutoStories as AutoStoriesIcon } from "@mui/icons-material";
import { getBookLanguage, getBookType } from "@ring/shared";
import { Title } from "../custom/Components";
import { publishersApiSlice } from "../../features/publishers/publishersApiSlice";
import { categoriesApiSlice } from "../../features/categories/categoriesApiSlice";
import { useGetPreviewShopsQuery } from "../../features/shops/shopsApiSlice";
import { currencyFormat } from "@ring/shared";
import { NumberFormatBase, NumericFormat, PatternFormat } from "react-number-format";
import { useCreateBookMutation, useUpdateBookMutation } from "../../features/books/booksApiSlice";
import { Instruction, DatePicker } from "@ring/ui";
import CustomDropZone from "../custom/CustomDropZone";
import dayjs from "dayjs";
import PropTypes from "prop-types";

const BookLanguage = getBookLanguage();
const BookType = getBookType();

const NumericFormatCustom = forwardRef(function NumericFormatCustom(props, ref) {
  const { onChange, ...other } = props;

  const format = (numStr) => {
    if (numStr === "") return "";
    return currencyFormat.format(numStr);
  };

  return (
    <NumberFormatBase
      {...other}
      getInputRef={ref}
      onValueChange={(values, sourceInfo) => {
        let newValue = values.floatValue;

        //Threshold
        if (newValue < 0) newValue = 0;
        if (newValue > 10000000) newValue = 10000000;

        if (onChange) onChange({ target: { value: newValue } });
      }}
      format={format}
    />
  );
});

NumericFormatCustom.propTypes = { onChange: PropTypes.func.isRequired };

const ProductFormDialog = ({ product = null, open, handleClose, shop, pending, setPending }) => {
  //#region construct
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [files, setFiles] = useState([]);
  const [thumbnailId, setThumbnailId] = useState(null);
  const [remove, setRemove] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState(0);
  const [pages, setPages] = useState(0);
  const [amount, setAmount] = useState(0);
  const [size, setSize] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState(dayjs("2001-01-01"));
  const [currShop, setCurrShop] = useState(shop ?? "");
  const [openShop, setOpenShop] = useState(false);
  const [price, setPrice] = useState({
    price: 0,
    discount: 0,
  });
  const [pub, setPub] = useState("");
  const [cate, setCate] = useState("");
  const [language, setLanguage] = useState(Object.keys(BookLanguage)[0]);
  const [type, setType] = useState(Object.keys(BookType)[0]);
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");
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

  //Fetch
  const { data: shops, isLoading: loadShops } = useGetPreviewShopsQuery(
    {},
    { skip: product != null || (!currShop && !openShop) }
  );
  const [getPublishers, { data: pubs }] = publishersApiSlice.useLazyGetPublishersQuery();
  const [getCategories, { data: cates }] = categoriesApiSlice.useLazyGetCategoriesQuery();
  const [createBook, { isLoading: creating }] = useCreateBookMutation();
  const [updateBook, { isLoading: updating }] = useUpdateBookMutation();

  useEffect(() => {
    if (product) {
      setTitle(product?.title);
      setDescription(product?.description);
      setWeight(product?.weight);
      setPages(product?.pages);
      setSize(product?.size);
      setAmount(product?.amount);
      setAuthor(product?.author);
      setDate(dayjs(product?.date));
      setLanguage(product?.language);
      setType(product?.type);
      setPrice({
        price: product?.price,
        discount: product?.discount,
      });
      setPub(product?.publisher?.id);
      setCate(product?.category?.id);
      setCurrShop(product?.shopId);
      setThumbnailId(product?.image?.id);
      setRemove([]);
      setErr([]);
      setErrMsg("");
    } else {
      clearInput();
    }
  }, [product]);

  const clearInput = () => {
    setTitle("");
    setDescription("");
    setWeight("");
    setPages("");
    setSize("");
    setAmount("");
    setAuthor("");
    setDate(dayjs("2001-01-01"));
    setLanguage("");
    setType("");
    setPrice({
      price: 0,
      discount: 0,
    });
    setPub("");
    setCate("");
    setCurrShop(currShop);
    setThumbnailId("");
    setRemove([]);
    setErr([]);
    setErrMsg("");
  };

  const handleCloseDialog = () => {
    setFiles([]);
    setRemove([]);
    setThumbnailId(product ? product.image?.id : "");
    handleClose();
  };

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

  const handleOpenShops = () => {
    setOpenShop(true);
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

  const handleInputChange = (e) => {
    let newValue = e.target.value === "" ? "" : Number(e.target.value);
    setPrice((prev) => ({ ...prev, price: newValue }));
  };

  const handleSaleChange = (e) => {
    let newValue = e.target.value === "" ? "" : Number(e.target.value);
    let discountValue = 1 - newValue / price.price;

    //Threshold
    if (discountValue < 0) discountValue = 0;
    if (discountValue > 1) discountValue = 1;

    if (discountValue != price.discount) setPrice((prev) => ({ ...prev, discount: discountValue }));
  };

  const handleDiscountChange = (e) => {
    let newValue = e.target.value;
    newValue = newValue.substring(0, newValue.length - 1) / 100;

    //Threshold
    if (newValue < 0) newValue = 0;
    if (newValue > 1) newValue = 1;

    setPrice((prev) => ({ ...prev, discount: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creating || updating || pending) return;

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    //Set data
    const formData = new FormData();
    const json = JSON.stringify({
      price: price.price,
      discount: price.discount,
      amount,
      title,
      description,
      type,
      author,
      pubId: pub,
      cateId: cate,
      weight,
      size,
      pages,
      date: date.format("YYYY-MM-DD"),
      language,
      shopId: product ? product?.shopId : currShop,
      thumbnailId: product ? thumbnailId : null,
      removeIds: product ? remove : null,
    });
    const blob = new Blob([json], { type: "application/json" });

    formData.append("request", blob);
    if (files) {
      if (product) {
        //Update
        if (!thumbnailId) {
          formData.append("thumbnail", files[0]);
          if (files?.length > 1) formData.append("images", files.splice(1, files?.length - 1));
        } else {
          files.forEach((file, i) => {
            formData.append("images", file);
          });
        }
      } else {
        //Create
        formData.append("thumbnail", files[0]);
        if (files?.length > 1) {
          files.splice(1, files?.length - 1).forEach((file, i) => {
            formData.append("images", file);
          });
        }
      }
    }

    if (product) {
      //Update
      updateBook({ id: product?.id, updatedBook: formData })
        .unwrap()
        .then((data) => {
          setErrMsg("");
          setErr([]);
          enqueueSnackbar("Chỉnh sửa sản phẩm thành công!", {
            variant: "success",
          });
          setPending(false);
          handleCloseDialog();
        })
        .catch((err) => {
          console.error(err);
          setErr(err);
          if (!err?.status) {
            setErrMsg("Server không phản hồi");
          } else if (err?.status === 409) {
            setErrMsg(err?.data?.message);
          } else if (err?.status === 403) {
            setErrMsg("Bạn không có quyền làm điều này!");
          } else if (err?.status === 400) {
            setErrMsg("Sai định dạng thông tin!");
          } else if (err?.status === 417) {
            setErrMsg("File ảnh quá lớn (Tối đa 2MB)!");
          } else {
            setErrMsg("Chỉnh sửa sản phẩm thất bại!");
          }
          enqueueSnackbar("Chỉnh sửa sản phẩm thất bại!", { variant: "error" });
          setPending(false);
        });
    } else {
      //Create
      createBook(formData)
        .unwrap()
        .then((data) => {
          clearInput();
          setErrMsg("");
          setErr([]);
          enqueueSnackbar("Thêm sản phẩm thành công!", { variant: "success" });
          setPending(false);
        })
        .catch((err) => {
          console.error(err);
          setErr(err);
          if (!err?.status) {
            setErrMsg("Server không phản hồi");
          } else if (err?.status === 409) {
            setErrMsg(err?.data?.message);
          } else if (err?.status === 403) {
            setErrMsg("Bạn không có quyền làm điều này!");
          } else if (err?.status === 400) {
            setErrMsg("Sai định dạng thông tin!");
          } else if (err?.status === 417) {
            setErrMsg("File ảnh quá lớn (Tối đa 2MB)!");
          } else {
            setErrMsg("Thêm sản phẩm thất bại!");
          }
          enqueueSnackbar("Thêm sản phẩm thất bại!", { variant: "error" });
          setPending(false);
        });
    }
  };
  //#endregion

  return (
    <Dialog
      open={open}
      scroll={"body"}
      maxWidth={"md"}
      fullWidth
      onClose={handleCloseDialog}
      fullScreen={fullScreen}
      closeAfterTransition={false}
      aria-modal
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <AutoStoriesIcon />
        &nbsp;{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      </DialogTitle>
      <DialogContent sx={{ pt: 0, px: { xs: 1, sm: 3 } }}>
        <form onSubmit={handleSubmit}>
          <Instruction display={errMsg ? "block" : "none"}>{errMsg}</Instruction>
          <Grid container size="grow" spacing={1}>
            <Grid size={12}>
              <Title>Thông tin sản phẩm</Title>
            </Grid>
            <Grid size={12}>
              <TextField
                required
                id="title"
                label="Tiêu đề"
                fullWidth
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={err?.data?.errors?.title}
                helperText={err?.data?.errors?.title}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                id="description"
                label="Mô tả"
                fullWidth
                multiline
                minRows={6}
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={err?.data?.errors?.description}
                helperText={err?.data?.errors?.description}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Danh mục"
                value={cate || ""}
                onChange={(e) => setCate(e.target.value)}
                select
                defaultValue=""
                fullWidth
                error={err?.data?.errors?.cateId}
                helperText={err?.data?.errors?.cateId}
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
                {product && !cates && (
                  <MenuItem key={`cate-${product?.category?.id}`} value={product?.category?.id}>
                    {product?.category?.name}
                  </MenuItem>
                )}
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
                        <MenuItem
                          sx={{ pl: 3, fontSize: 15 }}
                          key={`child-cate-${child?.id}-${childIndex}`}
                          value={child?.id}
                        >
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nhà xuất bản"
                value={pub || ""}
                onChange={(e) => setPub(e.target.value)}
                select
                defaultValue=""
                fullWidth
                error={err?.data?.errors?.pubId}
                helperText={err?.data?.errors?.pubId}
                slotProps={{
                  select: {
                    onOpen: handleOpenPubs,
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
                {product && !pubs && (
                  <MenuItem key={`pub-${product?.publisher?.id}`} value={product?.publisher?.id}>
                    {product?.publisher?.name}
                  </MenuItem>
                )}
                {pubs?.ids?.map((id, index) => {
                  const pub = pubs?.entities[id];

                  return (
                    <MenuItem key={`pub-${id}-${index}`} value={id}>
                      {pub?.name}
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
            </Grid>
            <Grid size={12}>
              <TextField
                label="Cửa hàng"
                value={currShop || ""}
                onChange={(e) => setCurrShop(e.target.value)}
                select
                fullWidth
                disabled={product != null}
                error={err?.data?.errors?.shopId}
                helperText={err?.data?.errors?.shopId}
                slotProps={{
                  select: {
                    onOpen: handleOpenShops,
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
                <MenuItem disabled>
                  <em>--Cửa hàng--</em>
                </MenuItem>
                {product && (
                  <MenuItem key={`shop-${product?.shopId}`} value={product?.shopId}>
                    {product?.shopName}
                  </MenuItem>
                )}
                {shops?.ids?.map((id, index) => {
                  const shop = shops?.entities[id];

                  return (
                    <MenuItem key={`shop-${id}-${index}`} value={id}>
                      {shop?.name}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
            <Grid size={12}>
              <CustomDropZone
                {...{
                  files,
                  setFiles,
                  thumbnailId,
                  setThumbnailId,
                  remove,
                  setRemove,
                  isMissing: !(files.length > 0) && err?.data?.errors?.thumbnail,
                  images: product
                    ? product?.previews
                      ? [product?.image].concat(product?.previews)
                      : [product?.image]
                    : null,
                }}
              />
            </Grid>
            <Grid size={12}>
              <Title>Chi tiết sản phẩm</Title>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <NumericFormat
                required
                id="weight"
                label="Khối lượng"
                suffix="g"
                fullWidth
                variant="outlined"
                value={weight}
                onValueChange={(values) => setWeight(values.floatValue)}
                error={err?.data?.errors?.weight}
                helperText={err?.data?.errors?.weight}
                customInput={TextField}
                allowNegative={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <PatternFormat
                required
                id="size"
                label="Kích thước"
                format="### x ### x ###"
                suffix="cm"
                fullWidth
                variant="outlined"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                error={err?.data?.errors?.size}
                helperText={err?.data?.errors?.size}
                customInput={TextField}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <NumericFormat
                required
                id="pages"
                label="Số trang"
                fullWidth
                variant="outlined"
                value={pages}
                onValueChange={(values) => setPages(values.value)}
                error={err?.data?.errors?.pages}
                helperText={err?.data?.errors?.pages}
                customInput={TextField}
                allowNegative={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                required
                label="Ngày xuất bản"
                value={date}
                className="custom-date-picker"
                onChange={(newValue) => setDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: err?.data?.errors?.date,
                    helperText: err?.data?.errors?.date,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="Ngôn ngữ"
                select
                required
                fullWidth
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {Object.values(BookLanguage).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="Hình thức"
                select
                required
                fullWidth
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {Object.values(BookType).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericFormat
                required
                id="amount"
                label="Số lượng"
                fullWidth
                variant="outlined"
                value={amount}
                onValueChange={(values) => setAmount(values.value)}
                error={err?.data?.errors?.amount}
                helperText={err?.data?.errors?.amount}
                customInput={TextField}
                allowNegative={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="author"
                label="Tác giả"
                fullWidth
                variant="outlined"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                error={err?.data?.errors?.author}
                helperText={err?.data?.errors?.author}
              />
            </Grid>
            <Grid size={12}>
              <Title>Giá sản phẩm</Title>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                required
                id="price"
                label="Giá"
                fullWidth
                value={price.price}
                onChange={handleInputChange}
                error={err?.data?.errors?.price}
                helperText={err?.data?.errors?.price}
                slotProps={{
                  input: { inputComponent: NumericFormatCustom },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                id="sale-price"
                label="Giá sale"
                fullWidth
                value={price.price * (1 - price.discount)}
                onChange={handleSaleChange}
                error={err?.data?.errors?.price}
                helperText={err?.data?.errors?.price}
                slotProps={{
                  input: { inputComponent: NumericFormatCustom },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <NumericFormat
                required
                id="discount"
                label="% Sale"
                fullWidth
                suffix="%"
                decimalScale={price.discount >= 1 ? 0 : 2}
                value={price.discount * 100}
                onChange={handleDiscountChange}
                error={err?.data?.errors?.discount}
                helperText={err?.data?.errors?.discount}
                customInput={TextField}
                allowNegative={false}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" size="large" onClick={handleClose} startIcon={<CloseIcon />}>
          Huỷ
        </Button>
        <Button variant="contained" color="primary" size="large" onClick={handleSubmit} startIcon={<Check />}>
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormDialog;
