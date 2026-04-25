"use client";

import { useState, forwardRef, useEffect, useMemo, type FormEvent, type ChangeEvent } from "react";
import {
  TextField,
  Autocomplete,
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
import {
  Check,
  Close as CloseIcon,
  AutoStories as AutoStoriesIcon,
  Info as InfoIcon,
  PermMedia as ImagesIcon,
  ShoppingCart as SaleInfoIcon,
  MenuBook as DetailIcon,
} from "@mui/icons-material";
import { getBookType, getBookLanguage } from "@ring/shared/enums/book";
import { BookLanguage } from "@ring/shared/models/bookLanguage";
import { BookType } from "@ring/shared/models/bookType";
import { Title, TitleContainer } from "../custom/Components";
import { publishersApiSlice } from "../../features/publishers/publishersApiSlice";
import { categoriesApiSlice } from "../../features/categories/categoriesApiSlice";
import { useGetPreviewShopsQuery } from "../../features/shops/shopsApiSlice";
import { currencyFormat } from "@ring/shared";
import { getImageSrc } from "@ring/shared/enums/image";
import { NumberFormatBase, NumericFormat, PatternFormat } from "react-number-format";
import { useCreateBookMutation, useUpdateBookMutation } from "../../features/books/booksApiSlice";
import { Instruction, DatePicker } from "@ring/ui";
import { useLocale, useTranslations } from "next-intl";
import usePendingModal from "@/hooks/usePendingModal";

import type { Dayjs } from "dayjs";
import type { BookDTO } from "@ring/shared/models/bookDTO";
import type { BookLanguageMeta, BookTypeMeta } from "@ring/shared/enums/book";
import type { BookRequest } from "@ring/shared/models/bookRequest";

import CustomDropZone, { type ExistingImage } from "../custom/CustomDropZone";
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
  thumbnailPublicId: undefined,
  removePublicIds: [],
  files: [],
};

interface PriceState {
  price: number;
  discount: number;
}

interface SelectOption {
  id: number;
  name: string;
  parentId?: number | null;
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
  initialSection?: string;
  onSubmitSuccess?: () => Promise<void> | void;
}

const ProductFormDialog = ({
  product = null,
  open,
  handleClose,
  shop,
  initialSection = "basic",
  onSubmitSuccess,
}: ProductFormDialogProps) => {
  //#region construct
  const t = useTranslations();
  const locale = useLocale();
  const { open: pending, showPending, hidePending } = usePendingModal();
  const fullScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [images, setImages] = useState<ExistingImage[]>([]);
  const [files, setFiles] = useState<File[]>(DEFAULT_FORM.files);
  const [thumbnailPublicId, setThumbnailPublicId] = useState<string | undefined>(DEFAULT_FORM.thumbnailPublicId);
  const [removePublicIds, setRemovePublicIds] = useState<string[]>(DEFAULT_FORM.removePublicIds);
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
  const [openPub, setOpenPub] = useState(false);
  const [openCate, setOpenCate] = useState(false);
  const [language, setLanguage] = useState<string>(DEFAULT_FORM.language);
  const [type, setType] = useState<string>(DEFAULT_FORM.type);
  const [err, setErr] = useState<{
    status?: number;
    data?: { message?: string; errors?: Record<string, string> };
  } | null>(null);
  const [errMsg, setErrMsg] = useState("");
  // Fetch shops data
  const { data: shops, isLoading: loadShops } = useGetPreviewShopsQuery(undefined, {
    skip: product != null || (!currShop && !openShop),
  });

  // Fetch publishers data
  const [getPublishers, { data: pubs, isLoading: loadingPubs }] = publishersApiSlice.useLazyGetPublishersQuery();

  // Fetch categories data
  const [getCategories, { data: cates, isLoading: loadingCates }] = categoriesApiSlice.useLazyGetCategoriesQuery();

  // Create book mutation
  const [createBook, { isLoading: creating }] = useCreateBookMutation();

  // Update book mutation
  const [updateBook, { isLoading: updating }] = useUpdateBookMutation();

  const existingImages: ExistingImage[] = useMemo(() => {
    if (!product) return [];
    const imageSets = product.srcSet ?? [];
    const publicIds = product.imagePublicIds ?? [];

    return (
      imageSets?.map((srcSet, index) => {
        const publicId = publicIds[index];
        const image: ExistingImage = {
          publicId,
          name: `image-${publicId}`,
          url: getImageSrc(srcSet as Record<number, string>, 120) ?? "",
        };
        return image;
      }) ?? []
    );
  }, [product]);

  // Scroll to section when dialog opens
  useEffect(() => {
    if (open && initialSection) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`section-${initialSection}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, initialSection]);

  useEffect(() => {
    if (product) {
      setImages(existingImages);
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
      setThumbnailPublicId(product?.imagePublicIds?.[0] ?? DEFAULT_FORM.thumbnailPublicId);
      setRemovePublicIds(DEFAULT_FORM.removePublicIds);
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
    setImages([]);
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
    setThumbnailPublicId(DEFAULT_FORM.thumbnailPublicId);
    setRemovePublicIds(DEFAULT_FORM.removePublicIds);
    setErr(null);
    setErrMsg("");
  };

  /**
   * Handle close dialog
   */
  const handleCloseDialog = () => {
    setFiles(DEFAULT_FORM.files);
    setRemovePublicIds(DEFAULT_FORM.removePublicIds);
    setThumbnailPublicId(
      product ? (product?.imagePublicIds?.[0] ?? DEFAULT_FORM.thumbnailPublicId) : DEFAULT_FORM.thumbnailPublicId
    );
    handleClose();
  };

  /**
   * Handle open publishers
   */
  const handleOpenPubs = () => {
    setOpenPub(true);
    if (!pubs) {
      getPublishers(
        {
          page: 0,
          size: 100,
        },
        true
      )
        .unwrap()
        .catch((rejected) => console.error(rejected));
    }
  };

  const handleClosePubs = () => {
    setOpenPub(false);
  };

  /**
   * Handle open categories
   */
  const handleOpenCates = () => {
    setOpenCate(true);
    if (!cates) {
      getCategories(
        {
          include: "children",
          page: 0,
          size: 999,
        },
        true
      )
        .unwrap()
        .catch((rejected) => console.error(rejected));
    }
  };

  const handleCloseCates = () => {
    setOpenCate(false);
  };

  /**
   * Handle open shops
   */
  const handleOpenShops = () => {
    setOpenShop(true);
  };

  const handleCloseShops = () => {
    setOpenShop(false);
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

    showPending();
    const { enqueueSnackbar } = await import("notistack");

    // Set data
    const formData = new FormData();
    const request: BookRequest = {
      price: price.price,
      discount: price.discount,
      amount,
      title,
      description,
      type: type as BookType,
      author,
      pubId: Number(pub),
      cateId: Number(cate),
      weight,
      size,
      pages,
      date: date.format("YYYY-MM-DD"),
      language: language as BookLanguage,
      shopId: product ? Number(product?.shopId) : Number(currShop),
      thumbnailPublicId: product ? thumbnailPublicId : undefined,
      removePublicIds: product ? removePublicIds : undefined,
    };
    const json = JSON.stringify(request);
    const blob = new Blob([json], { type: "application/json" });

    formData.append("request", blob);
    if (files) {
      if (product) {
        // Update
        // If remove original thumbnail, set new thumbnail
        if (!thumbnailPublicId) {
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
        // Create
        formData.append("thumbnail", files[0]);
        if (files.length > 1) {
          files.slice(1).forEach((file) => formData.append("images", file));
        }
      }
    }

    if (product) {
      // Update
      updateBook({ id: product?.id, updatedBook: formData })
        .unwrap()
        .then(async () => {
          if (product?.id != null) {
            await onSubmitSuccess?.();
          }
          setErrMsg("");
          setErr(null);
          enqueueSnackbar("Chỉnh sửa sản phẩm thành công!", {
            variant: "success",
          });
          hidePending();
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
          hidePending();
        });
    } else {
      // Create
      createBook(formData)
        .unwrap()
        .then(() => {
          clearInput();
          setErrMsg("");
          setErr(null);
          enqueueSnackbar("Thêm sản phẩm thành công!", { variant: "success" });
          hidePending();
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
          hidePending();
        });
    }
  };
  //#endregion

  const categoryOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] =
      cates?.ids?.flatMap((id) => {
        const parent = cates?.entities[id];
        if (!parent) return [];

        const parentOption: SelectOption = { id: Number(parent.id), name: parent.name ?? "", parentId: null };
        const childOptions: SelectOption[] =
          parent.children?.map((child) => ({
            id: Number(child.id),
            name: child.name ?? "",
            parentId: Number(parent.id),
          })) ?? [];

        return [parentOption, ...childOptions];
      }) ?? [];

    if (product?.category?.id && product?.category?.name) {
      const exists = options.some((item) => Number(item.id) === Number(product.category?.id));
      if (!exists) options.unshift({ id: Number(product.category.id), name: product.category.name, parentId: null });
    }

    return options;
  }, [cates, product?.category?.id, product?.category?.name]);

  const publisherOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] =
      pubs?.ids
        ?.map((id) => pubs?.entities[id])
        .filter(Boolean)
        .map((item) => ({ id: Number(item.id), name: item.name ?? "" })) ?? [];

    if (product?.publisher?.id && product?.publisher?.name) {
      const exists = options.some((item) => Number(item.id) === Number(product.publisher?.id));
      if (!exists) options.unshift({ id: Number(product.publisher.id), name: product.publisher.name });
    }

    return options;
  }, [pubs, product?.publisher?.id, product?.publisher?.name]);

  const shopOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] =
      shops?.ids
        ?.map((id) => shops?.entities[id])
        .filter(Boolean)
        .map((item) => ({ id: Number(item.id), name: item.name ?? "" })) ?? [];

    if (product?.shopId && product?.shopName) {
      const exists = options.some((item) => Number(item.id) === Number(product.shopId));
      if (!exists) options.unshift({ id: Number(product.shopId), name: product.shopName });
    }

    return options;
  }, [shops, product?.shopId, product?.shopName]);

  const selectedCategory = categoryOptions.find((item) => Number(item.id) === Number(cate)) ?? null;
  const selectedPublisher = publisherOptions.find((item) => Number(item.id) === Number(pub)) ?? null;
  const selectedShop = shopOptions.find((item) => Number(item.id) === Number(currShop)) ?? null;

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
        <form id="product-form-dialog" onSubmit={handleSubmit}>
          <Instruction style={{ display: errMsg ? "block" : "none" }}>{errMsg}</Instruction>
          <Grid container size="grow" spacing={1}>
            <TitleContainer id="section-basic">
              <InfoIcon fontSize="small" />
              <Title>{t("basic")}</Title>
            </TitleContainer>
            <TextField
              required
              id="title"
              label={t("title")}
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
              label={t("description")}
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
              <Autocomplete<SelectOption, false, false, false>
                options={categoryOptions}
                open={openCate}
                loading={loadingCates}
                onOpen={handleOpenCates}
                onClose={handleCloseCates}
                value={selectedCategory}
                getOptionLabel={(opt) => (typeof opt === "object" && opt?.name ? opt.name : "")}
                isOptionEqualToValue={(opt, val) => Number(opt?.id) === Number(val?.id)}
                onChange={(_, newValue) => setCate(newValue?.id ? String(newValue.id) : "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("category.label")}
                    fullWidth
                    error={!!err?.data?.errors?.cateId}
                    helperText={err?.data?.errors?.cateId}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li key={key} {...optionProps} style={{ marginLeft: option.parentId ? 16 : 0 }}>
                      {option.name}
                    </li>
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Autocomplete<SelectOption, false, false, false>
                options={publisherOptions}
                open={openPub}
                loading={loadingPubs}
                onOpen={handleOpenPubs}
                onClose={handleClosePubs}
                value={selectedPublisher}
                getOptionLabel={(opt) => (typeof opt === "object" && opt?.name ? opt.name : "")}
                isOptionEqualToValue={(opt, val) => Number(opt?.id) === Number(val?.id)}
                onChange={(_, newValue) => setPub(newValue?.id ? String(newValue.id) : "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("publisher.label")}
                    fullWidth
                    error={!!err?.data?.errors?.pubId}
                    helperText={err?.data?.errors?.pubId}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Autocomplete<SelectOption, false, false, false>
                options={shopOptions}
                open={openShop}
                loading={loadShops}
                onOpen={handleOpenShops}
                onClose={handleCloseShops}
                value={selectedShop}
                disabled={product != null}
                getOptionLabel={(opt) => (typeof opt === "object" && opt?.name ? opt.name : "")}
                isOptionEqualToValue={(opt, val) => Number(opt?.id) === Number(val?.id)}
                onChange={(_, newValue) => setCurrShop(newValue?.id ?? "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("store")}
                    fullWidth
                    error={!!err?.data?.errors?.shopId}
                    helperText={err?.data?.errors?.shopId}
                  />
                )}
              />
            </Grid>
            <TitleContainer id="section-images">
              <ImagesIcon fontSize="small" />
              <Title>{t("images")}</Title>
            </TitleContainer>
            <CustomDropZone
              {...{
                files,
                setFiles,
                images,
                setImages,
                thumbnailPublicId,
                setThumbnailPublicId,
                removePublicIds,
                setRemovePublicIds,
              }}
            />
            <TitleContainer id="section-sale">
              <SaleInfoIcon fontSize="small" />
              <Title>{t("product.sale.info")}</Title>
            </TitleContainer>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <NumericFormat
                required
                id="weight"
                label={t("product.sale.weight")}
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
                label={t("product.sale.size")}
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
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                required
                id="price"
                label={t("product.price.original")}
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
            <TitleContainer id="section-detail">
              <DetailIcon fontSize="small" />
              <Title>{t("product.detail")}</Title>
            </TitleContainer>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                locale={locale}
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
                    {t(option.label)}
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
                    {t(option.label)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
          type="submit"
          form="product-form-dialog"
          startIcon={<Check />}
        >
          {t("apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormDialog;
