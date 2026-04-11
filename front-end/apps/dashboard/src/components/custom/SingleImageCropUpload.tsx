"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { AddAPhoto, Clear, EditOutlined, ZoomIn, ZoomOut } from "@mui/icons-material";
import {
  Badge,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Stack,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { getCroppedImg } from "@ring/shared/utils/canvas";

interface SingleImageCropUploadProps {
  image?: string | null;
  file: File[];
  setFile: (files: File[]) => void;
  onImageSelected?: () => void;
  onImageCleared?: () => void;
  helperText?: string;
}

const CROPPED_FILE_NAME = "cropped-image.png";

export default function SingleImageCropUpload({
  image,
  file,
  setFile,
  onImageSelected,
  onImageCleared,
  helperText,
}: SingleImageCropUploadProps) {
  const t = useTranslations();
  const fullScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageForCrop, setImageForCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const selectedFilePreview = useMemo(() => {
    if (!file?.length) return null;
    const previewFile = file[0] as File & { preview?: string };
    return previewFile.preview ?? URL.createObjectURL(previewFile);
  }, [file]);

  const currentPreview = selectedFilePreview ?? image ?? null;

  useEffect(() => {
    return () => {
      if (selectedFilePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedFilePreview);
      }
    };
  }, [selectedFilePreview]);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleOpenCrop = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const localUrl = URL.createObjectURL(selected);
    setImageForCrop(localUrl);
    event.target.value = "";
  };

  const handleCloseCrop = () => {
    if (imageForCrop?.startsWith("blob:")) {
      URL.revokeObjectURL(imageForCrop);
    }
    setImageForCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleCropComplete = (_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleApplyCrop = async () => {
    if (!imageForCrop || !croppedAreaPixels) return;
    const cropped = await getCroppedImg(imageForCrop, croppedAreaPixels);
    if (!cropped) {
      handleCloseCrop();
      return;
    }

    const croppedFile = new File([cropped], CROPPED_FILE_NAME, { type: "image/png" }) as File & { preview?: string };
    croppedFile.preview = URL.createObjectURL(croppedFile);
    setFile([croppedFile]);
    if (onImageSelected) onImageSelected();
    handleCloseCrop();
  };

  const handleClear = () => {
    setFile([]);
    if (onImageCleared) onImageCleared();
  };

  return (
    <Stack spacing={1.5} alignItems="center">
      <input ref={inputRef} hidden accept="image/*" type="file" onChange={handleOpenCrop} />
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        badgeContent={
          <IconButton
            size="small"
            color="error"
            onClick={handleClear}
            disabled={!currentPreview}
            sx={{
              "bgcolor": "grey.200",
              "border": "2px solid",
              "borderColor": "background.paper",
              "&:hover": { bgcolor: "grey.300" },
            }}
          >
            <Clear fontSize="small" />
          </IconButton>
        }
      >
        <Box
          onClick={openFilePicker}
          sx={{
            "width": 160,
            "height": 160,
            "borderRadius": "50%",
            "border": "1px dashed",
            "borderColor": "divider",
            "display": "flex",
            "alignItems": "center",
            "justifyContent": "center",
            "overflow": "hidden",
            "position": "relative",
            "bgcolor": "action.hover",
            "cursor": "pointer",
            "&:hover .image-edit-overlay": {
              opacity: 1,
            },
          }}
        >
          {currentPreview ? (
            <Box
              component="img"
              src={currentPreview}
              alt="preview"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Stack spacing={0.5} alignItems="center" color="text.secondary">
              <AddAPhoto fontSize="small" />
              <Typography variant="caption">{t("product.images")}</Typography>
            </Stack>
          )}
          <Box
            className="image-edit-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.35)",
              color: "common.white",
              opacity: currentPreview ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            <EditOutlined />
          </Box>
        </Box>
      </Badge>
      <Typography variant="caption" color="text.secondary">
        {helperText ?? "Max 2MB"}
      </Typography>

      <Dialog open={Boolean(imageForCrop)} maxWidth="sm" fullScreen={fullScreen} fullWidth onClose={handleCloseCrop}>
        <DialogTitle>{t("product.images")}</DialogTitle>
        <DialogContent
          dividers
          sx={{ minHeight: { xs: "65dvh", sm: 520 }, display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          {imageForCrop && (
            <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1", minHeight: { xs: 300, sm: 380 } }}>
              <Cropper
                image={imageForCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                showGrid={false}
                cropShape="rect"
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
                objectFit="cover"
              />
            </Box>
          )}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1 }}>
            <ZoomOut fontSize="small" />
            <Slider min={1} max={3} step={0.1} value={zoom} onChange={(_, value) => setZoom(Number(value))} />
            <ZoomIn fontSize="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleCloseCrop}>
            {t("cancel")}
          </Button>
          <Button onClick={handleApplyCrop}>{t("apply")}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
