"use client";

import { useState, forwardRef, useEffect, type FormEvent, type ChangeEvent } from "react";
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
  Grid,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { Check, Add, Close as CloseIcon, AutoStories as AutoStoriesIcon } from "@mui/icons-material";
import { getBookType, getBookLanguage } from "@ring/shared/enums/book";
import { BookLanguage } from "@ring/shared/models/bookLanguage";
import { BookType } from "@ring/shared/models/bookType";
import { Title } from "../custom/Components";
import { publishersApiSlice } from "../../features/publishers/publishersApiSlice";
import { categoriesApiSlice } from "../../features/categories/categoriesApiSlice";
import { useGetPreviewShopsQuery } from "../../features/shops/shopsApiSlice";
import { currencyFormat } from "@ring/shared";
import { NumberFormatBase, NumericFormat, PatternFormat } from "react-number-format";
import { useCreateBookMutation, useUpdateBookMutation } from "../../features/books/booksApiSlice";
import { Instruction, DatePicker } from "@ring/ui";
import { useTranslations } from "next-intl";

import type { Dayjs } from "dayjs";
import type { BookDTO } from "@ring/shared/models/bookDTO";
import type { BookLanguageMeta, BookTypeMeta } from "@ring/shared/enums/book";

import CustomDropZone from "../custom/CustomDropZone";
import dayjs from "dayjs";

/**
 * Book language options
 */
const bookLanguageOptions: BookLanguageMeta[] = (Object.keys(BookLanguage) as (keyof typeof BookLanguage)[]).map((k) =>
  getBookLanguage(BookLanguage[k])
);

/**
 * Book type options
 */
const bookTypeOptions: BookTypeMeta[] = (Object.keys(BookType) as (keyof typeof BookType)[]).map((k) =>
  getBookType(BookType[k])
);

const DEFAULT_FORM = {
  title: "",
  description: "",
  weight: 0,
  pages: 0,
  size: "",
  amount: 0,
  author: "",
  date: dayjs("2001-01-01"),
  language: bookLanguageOptions[0]?.value ?? "",
  type: bookTypeOptions[0]?.value ?? "",
  price: {
    price: 0,
    discount: 0,
  },
  publisher: "",
  category: "",
  shop: "",
  thumbnailId: null,
  remove: [],
  files: [],
};

const DEFAULT_PAGINATION = {
  number: 0,
  totalPages: 0,
  totalElements: 0,
};

interface PaginationState {
  number: number;
  totalPages: number;
  totalElements: number;
}

interface PriceState {
  price: number;
  discount: number;
}

interface NumericFormatCustomProps {
  onChange?: (e: { target: { value: number } }) => void;
  [key: string]: unknown;
}

const NumericFormatCustom = forwardRef<HTMLInputElement, NumericFormatCustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;
    const handleChange = onChange as ((e: { target: { value: number } }) => void) | undefined;

    const format = (numStr: string): string => {
      if (numStr === "") return "";
      return currencyFormat.format(Number(numStr));
    };

    return (
      <NumberFormatBase
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          const rawValue = values.floatValue;
          const newValue = rawValue === undefined ? 0 : rawValue < 0 ? 0 : rawValue > 10000000 ? 10000000 : rawValue;

          handleChange?.({ target: { value: newValue } });
        }}
        format={format}
      />
    );
  }
);

export interface ProductFormDialogProps {
  product?: BookDTO | null;
  open: boolean;
  handleClose: () => void;
  shop?: string | number;
  pending: boolean;
  setPending: (value: boolean) => void;
}

const ProductFormDialog = ({
  product = null,
  open,
  handleClose,
  shop,
  pending,
  setPending,
}: ProductFormDialogProps) => {
  //#region construct
  const t = useTranslations();
  const fullScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [files, setFiles] = useState<File[]>(DEFAULT_FORM.files);
  const [thumbnailId, setThumbnailId] = useState<number | null>(DEFAULT_FORM.thumbnailId);
  const [remove, setRemove] = useState<number[]>(DEFAULT_FORM.remove);
  const [title, setTitle] = useState(DEFAULT_FORM.title);
  const [description, setDescription] = useState(DEFAULT_FORM.description);
  const [weight, setWeight] = useState<number>(DEFAULT_FORM.weight);
  const [pages, setPages] = useState<number>(DEFAULT_FORM.pages);
  const [amount, setAmount] = useState<number>(DEFAULT_FORM.amount);
  const [size, setSize] = useState(DEFAULT_FORM.size);
  const [author, setAuthor] = useState(DEFAULT_FORM.author);
  const [date, setDate] = useState<Dayjs>(DEFAULT_FORM.date);
  const [currShop, setCurrShop] = useState<string | number>(shop ?? DEFAULT_FORM.shop);
  const [openShop, setOpenShop] = useState(false);
  const [price, setPrice] = useState<PriceState>(DEFAULT_FORM.price);
  const [pub, setPub] = useState(DEFAULT_FORM.publisher);
  const [cate, setCate] = useState(DEFAULT_FORM.category);
  const [language, setLanguage] = useState<string>(DEFAULT_FORM.language);
  const [type, setType] = useState<string>(DEFAULT_FORM.type);
  const [err, setErr] = useState<{
    status?: number;
    data?: { message?: string; errors?: Record<string, string> };
  } | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const [pubsPagination, setPubsPagination] = useState<PaginationState>({
    number: DEFAULT_PAGINATION.number,
    totalPages: DEFAULT_PAGINATION.totalPages,
    totalElements: DEFAULT_PAGINATION.totalElements,
  });
  const [catesPagination, setCatesPagination] = useState<PaginationState>({
    number: DEFAULT_PAGINATION.number,
    totalPages: DEFAULT_PAGINATION.totalPages,
    totalElements: DEFAULT_PAGINATION.totalElements,
  });

  // Fetch shops data
  const { data: shops, isLoading: loadShops } = useGetPreviewShopsQuery(undefined, {
    skip: product != null || (!currShop && !openShop),
  });

  // Fetch publishers data
  const [getPublishers, { data: pubs }] = publishersApiSlice.useLazyGetPublishersQuery();

  // Fetch categories data
  const [getCategories, { data: cates }] = categoriesApiSlice.useLazyGetCategoriesQuery();

  // Create book mutation
  const [createBook, { isLoading: creating }] = useCreateBookMutation();

  // Update book mutation
  const [updateBook, { isLoading: updating }] = useUpdateBookMutation();

  useEffect(() => {
    if (product) {
      setTitle(product?.title ?? DEFAULT_FORM.title);
      setDescription(product?.description ?? DEFAULT_FORM.description);
      setWeight(product?.weight ?? DEFAULT_FORM.weight);
      setPages(product?.pages ?? DEFAULT_FORM.pages);
      setSize(product?.size ?? DEFAULT_FORM.size);
      setAmount(product?.amount ?? DEFAULT_FORM.amount);
      setAuthor(product?.author ?? DEFAULT_FORM.author);
      setDate(product?.date ? dayjs(product?.date) : DEFAULT_FORM.date);
      setLanguage(product?.language ?? bookLanguageOptions[0]?.value ?? DEFAULT_FORM.language);
      setType(product?.type ?? bookTypeOptions[0]?.value ?? DEFAULT_FORM.type);
      setPrice({
        price: product?.price ?? DEFAULT_FORM.price.price,
        discount: product?.discount ?? DEFAULT_FORM.price.discount,
      });
      setPub(product?.publisher?.id?.toString() ?? DEFAULT_FORM.publisher);
      setCate(product?.category?.id?.toString() ?? DEFAULT_FORM.category);
      setCurrShop(product?.shopId ?? DEFAULT_FORM.shop);
      setThumbnailId(product?.image?.id ?? DEFAULT_FORM.thumbnailId);
      setRemove(DEFAULT_FORM.remove);
      setErr(null);
      setErrMsg("");
    } else {
      clearInput();
    }
  }, [product]);

  /**
   * Clear input
   */
  const clearInput = () => {
    setTitle(DEFAULT_FORM.title);
    setDescription(DEFAULT_FORM.description);
    setWeight(DEFAULT_FORM.weight);
    setPages(DEFAULT_FORM.pages);
    setSize(DEFAULT_FORM.size);
    setAmount(DEFAULT_FORM.amount);
    setAuthor(DEFAULT_FORM.author);
    setDate(DEFAULT_FORM.date);
    setLanguage(DEFAULT_FORM.language);
    setType(DEFAULT_FORM.type);
    setPrice({
      price: DEFAULT_FORM.price.price,
      discount: DEFAULT_FORM.price.discount,
    });
    setPub(DEFAULT_FORM.publisher);
    setCate(DEFAULT_FORM.category);
    setCurrShop(currShop);
    setThumbnailId(DEFAULT_FORM.thumbnailId);
    setRemove(DEFAULT_FORM.remove);
    setErr(null);
    setErrMsg("");
  };

  /**
   * Handle close dialog
   */
  const handleCloseDialog = () => {
    setFiles(DEFAULT_FORM.files);
    setRemove(DEFAULT_FORM.remove);
    setThumbnailId(product ? (product.image?.id ?? DEFAULT_FORM.thumbnailId) : DEFAULT_FORM.thumbnailId);
    handleClose();
  };

  /**
   * Handle open publishers
   */
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

  /**
   * Handle open categories
   */
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

  /**
   * Handle open shops
   */
  const handleOpenShops = () => {
    setOpenShop(true);
  };

  /**
   * Handle show more publishers
   */
  const handleShowMorePubs = () => {
    const currPage = (pubsPagination?.number ?? 0) + 1;
    if (currPage < (pubsPagination?.totalPages ?? 0)) {
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

  /**
   * Handle show more categories
   */
  const handleShowMoreCates = () => {
    const currPage = (catesPagination?.number ?? 0) + 1;
    if (currPage < (catesPagination?.totalPages ?? 0)) {
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

  /**
   * Handle input change
   * @param e - Change event
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? 0 : Number(e.target.value);
    setPrice((prev) => ({ ...prev, price: newValue }));
  };

  /**
   * Handle sale change
   * @param e - Change event
   */
  const handleSaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? 0 : Number(e.target.value);
    let discountValue = price.price ? 1 - newValue / price.price : 0;

    //Threshold
    if (discountValue < 0) discountValue = 0;
    if (discountValue > 1) discountValue = 1;

    if (discountValue !== price.discount) setPrice((prev) => ({ ...prev, discount: discountValue }));
  };

  /**
   * Handle discount change
   * @param e - Change event
   */
  const handleDiscountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const strVal = e.target.value;
    let numVal = Number(strVal.substring(0, strVal.length - 1)) / 100;

    // Threshold
    if (numVal < 0) numVal = 0;
    if (numVal > 1) numVal = 1;

    setPrice((prev) => ({ ...prev, discount: numVal }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (creating || updating || pending) return;

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    // Set data
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
      shopId: product ? product?.shopId : typeof currShop === "string" ? Number(currShop) : currShop,
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
          if (files.length > 1) {
            files.slice(1).forEach((file) => formData.append("images", file));
          }
        } else {
          files.forEach((file, i) => {
            formData.append("images", file);
          });
        }
      } else {
        //Create
        formData.append("thumbnail", files[0]);
        if (files.length > 1) {
          files.slice(1).forEach((file) => formData.append("images", file));
        }
      }
    }

    if (product) {
      //Update
      updateBook({ id: product?.id, updatedBook: formData })
        .unwrap()
        .then(() => {
          setErrMsg("");
          setErr(null);
          enqueueSnackbar("Chỉnh sửa sản phẩm thành công!", {
            variant: "success",
          });
          setPending(false);
          handleCloseDialog();
        })
        .catch((err: { status?: number; data?: { message?: string; errors?: Record<string, string> } }) => {
          console.error(err);
          setErr(err);
          if (!err?.status) {
            setErrMsg("Server không phản hồi");
          } else if (err?.status === 409) {
            setErrMsg(err?.data?.message ?? "");
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
        .then(() => {
          clearInput();
          setErrMsg("");
          setErr(null);
          enqueueSnackbar("Thêm sản phẩm thành công!", { variant: "success" });
          setPending(false);
        })
        .catch((err: { status?: number; data?: { message?: string; errors?: Record<string, string> } }) => {
          console.error(err);
          setErr(err);
          if (!err?.status) {
            setErrMsg("Server không phản hồi");
          } else if (err?.status === 409) {
            setErrMsg(err?.data?.message ?? "");
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
        <AutoStoriesIcon fontSize="inherit" sx={{ mr: 1 }} />
        &nbsp;{product ? t("product.edit") : t("product.add")}
      </DialogTitle>
      <DialogContent dividers={true}>
        <form onSubmit={handleSubmit}>
          <Instruction style={{ display: errMsg ? "block" : "none" }}>{errMsg}</Instruction>
          <Grid container size="grow" spacing={1}>
            <Title>{t("product.info")}</Title>
            <TextField
              required
              id="title"
              label={t("product.title")}
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!err?.data?.errors?.title}
              helperText={err?.data?.errors?.title}
            />
            <TextField
              required
              id="description"
              label={t("product.description")}
              fullWidth
              multiline
              minRows={6}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!err?.data?.errors?.description}
              helperText={err?.data?.errors?.description}
            />
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label={t("category.label")}
                value={cate || ""}
                onChange={(e) => setCate(e.target.value)}
                select
                defaultValue=""
                fullWidth
                error={!!err?.data?.errors?.cateId}
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
                  <em>--{t("all.label")}--</em>
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
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label={t("publisher.label")}
                value={pub || ""}
                onChange={(e) => setPub(e.target.value)}
                select
                defaultValue=""
                fullWidth
                error={!!err?.data?.errors?.pubId}
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
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t("store")}
                value={currShop || ""}
                onChange={(e) => setCurrShop(e.target.value)}
                select
                fullWidth
                disabled={product != null}
                error={!!err?.data?.errors?.shopId}
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
                  <em>--{t("store")}--</em>
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
            <Title>{t("product.images")}</Title>
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
            <Title>{t("product.detail")}</Title>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <NumericFormat
                required
                id="weight"
                label={t("product.weight")}
                suffix="g"
                fullWidth
                variant="outlined"
                value={weight}
                onValueChange={(values) => setWeight(values.floatValue ?? 0)}
                error={!!err?.data?.errors?.weight}
                helperText={err?.data?.errors?.weight}
                customInput={TextField}
                allowNegative={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <PatternFormat
                required
                id="size"
                label={t("product.size")}
                format="### x ### x ###"
                fullWidth
                variant="outlined"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                error={!!err?.data?.errors?.size}
                helperText={err?.data?.errors?.size}
                customInput={TextField}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <NumericFormat
                required
                id="pages"
                label={t("product.pages")}
                fullWidth
                variant="outlined"
                value={pages}
                onValueChange={(values) => setPages(Number(values.value) || 0)}
                error={!!err?.data?.errors?.pages}
                helperText={err?.data?.errors?.pages}
                customInput={TextField}
                allowNegative={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                required
                label={t("product.date")}
                value={date}
                className="custom-date-picker"
                onChange={(newValue: Dayjs | null) => setDate(newValue ?? dayjs("2001-01-01"))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!err?.data?.errors?.date,
                    helperText: err?.data?.errors?.date,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label={t("language.label")}
                select
                required
                fullWidth
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {bookLanguageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label={t("product.type.label")}
                select
                required
                fullWidth
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {bookTypeOptions.map((option) => (
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
                label={t("quantity.label")}
                fullWidth
                variant="outlined"
                value={amount}
                onValueChange={(values) => setAmount(Number(values.value) || 0)}
                error={!!err?.data?.errors?.amount}
                helperText={err?.data?.errors?.amount}
                customInput={TextField}
                allowNegative={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="author"
                label={t("product.author")}
                fullWidth
                variant="outlined"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                error={!!err?.data?.errors?.author}
                helperText={err?.data?.errors?.author}
              />
            </Grid>
            <Title>{t("product.price.label")}</Title>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                required
                id="price"
                label={t("product.price.label")}
                fullWidth
                value={price.price}
                onChange={handleInputChange}
                error={!!err?.data?.errors?.price}
                helperText={err?.data?.errors?.price}
                slotProps={{
                  input: { inputComponent: NumericFormatCustom },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                id="sale-price"
                label={t("product.price.sale")}
                fullWidth
                value={price.price * (1 - price.discount)}
                onChange={handleSaleChange}
                error={!!err?.data?.errors?.price}
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
                label={t("product.price.discount")}
                fullWidth
                suffix="%"
                decimalScale={price.discount >= 1 ? 0 : 2}
                value={price.discount * 100}
                onChange={handleDiscountChange}
                error={!!err?.data?.errors?.discount}
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
          {t("cancel")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)}
          startIcon={<Check />}
        >
          {t("apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormDialog;
