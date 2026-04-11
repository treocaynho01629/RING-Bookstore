import { useEffect, useMemo, useRef, useState, type Dispatch, type MouseEvent, type SetStateAction } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { BrokenImage, Close, Delete, MoreVert, PermMedia, RestartAlt } from "@mui/icons-material";
import { Button, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, styled } from "@mui/material";
import { useTranslations } from "next-intl";

type UploadFile = File & { preview?: string };

export type ExistingImage = {
  publicId?: string | undefined;
  name?: string;
  url?: string | null;
};

type PreviewItem = {
  key: string;
  publicId?: string | undefined;
  name: string;
  url: string;
  file?: File;
  isRemoved: boolean;
};

interface CustomDropZoneProps {
  thumbnailPublicId: string | undefined;
  setThumbnailPublicId: (publicId: string | undefined) => void;
  removePublicIds: string[];
  setRemovePublicIds: Dispatch<SetStateAction<string[]>> | ((value: string[]) => void);
  images: ExistingImage[] | null;
  setImages: Dispatch<SetStateAction<ExistingImage[]>>;
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}

//#region styled
const StyledSection = styled("section")`
  width: 100%;
`;

const DropZoneContainer = styled("div")`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  background-color: ${({ theme }) => theme.vars?.palette?.action?.focus};
  border: 2.5px dashed ${({ theme }) => theme.vars?.palette?.divider};
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;

  &.accept {
    background-color: ${({ theme }) =>
      `color-mix(in srgb, ${theme?.vars?.palette?.success?.light}, 
      transparent 70%)`};
    color: ${({ theme }) => theme.vars?.palette?.success?.main};
    border-color: ${({ theme }) => theme.vars?.palette?.success?.main};
  }

  &.focus {
    background-color: ${({ theme }) =>
      `color-mix(in srgb, ${theme?.vars?.palette?.info?.light}, 
      transparent 70%)`};
    color: ${({ theme }) => theme.vars?.palette?.info?.main};
    border-color: ${({ theme }) => theme.vars?.palette?.info?.main};
  }

  &.error {
    background-color: ${({ theme }) =>
      `color-mix(in srgb, ${theme?.vars?.palette?.error?.light}, 
      transparent 70%)`};
    color: ${({ theme }) => theme.vars?.palette?.error?.main};
    border-color: ${({ theme }) => theme.vars?.palette?.error?.main};
  }

  input {
    display: none;
  }
`;

const DropZoneContent = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
  }
`;

const ErrorsContainer = styled("div")`
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.vars?.palette?.error?.main};

  @supports (-webkit-line-clamp: 5) {
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
  }
`;

const Tip = styled("span")`
  font-size: 1rem;
  text-align: center;
  font-style: italic;
  color: ${({ theme }) => theme.vars?.palette?.grey?.[600]};
`;

const ThumbContainer = styled("aside")`
  display: flex;
  margin: 16px 0px;
  overflow-x: scroll;
  scroll-behavior: smooth;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Thumb = styled("div")`
  display: flex;
  border: 0.5px solid ${({ theme }) => theme.vars?.palette?.action?.focus};
  height: 80px;
  width: 80px;
  aspect-ratio: 1/1;
  margin-right: 5px;
  box-sizing: border-box;
  justify-content: center;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 50%;
    font-size: 12px;
    font-weight: 450;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    color: ${({ theme }) => theme.vars?.palette?.grey?.[800]};
  }

  &.file {
    border: 2px solid ${({ theme }) => theme.vars?.palette?.warning?.main};
  }

  &.remove {
    border: 2px solid ${({ theme }) => theme.vars?.palette?.error?.main};

    &:before {
      background-image: linear-gradient(0deg, ${({ theme }) => theme.vars?.palette?.error?.main}, transparent 100%);
    }
  }

  &.thumbnail {
    &:before {
      background-image: linear-gradient(0deg, ${({ theme }) => theme.vars?.palette?.success?.main}, transparent 100%);
    }
  }

  &.main {
    border: 2px solid ${({ theme }) => theme.vars?.palette?.primary?.main};

    &:before {
      background-image: linear-gradient(0deg, ${({ theme }) => theme.vars?.palette?.primary?.main}, transparent 100%);
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 55px;
    width: 55px;

    &:before {
      font-size: 9px;
    }
  }
`;

const ThumbInner = styled("div")`
  display: flex;
  min-width: 0;
  overflow: hidden;
  justify-content: center;
`;

const ThumbImage = styled("img")`
  display: block;
  width: auto;
  height: 100%;
  object-fit: cover;
`;

const StyledIconButton = styled(IconButton)`
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 5px;
  padding: 1.9px;
  color: white;
  background-color: #0000008b;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #000000bc;
    }
  }

  svg {
    font-size: 15px;
  }
`;

const Title = styled("h3")`
  margin: 0 0 10px;
  font-weight: 450;
`;

//#endregion

const MAX_FILES = 10;
const MAX_FILE_SIZE = 2000000;

const CustomDropZone = ({
  thumbnailPublicId,
  setThumbnailPublicId,
  removePublicIds,
  setRemovePublicIds,
  images,
  setImages,
  files,
  setFiles,
}: CustomDropZoneProps) => {
  const t = useTranslations();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemKey, setMenuItemKey] = useState<string | null>(null);
  const [dropErrors, setDropErrors] = useState<string[]>([]);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const prevFilesRef = useRef<File[]>([]);
  const toDropErrors = (rejections: readonly FileRejection[]) =>
    rejections.flatMap(({ file, errors }) =>
      errors.map(({ code }) => {
        if (code === "file-too-large")
          return `${file.name}: ${t("error.upload.limit", { size: `${MAX_FILE_SIZE / 1000000}MB` })}`;
        if (code === "file-invalid-type") return `${file.name}: ${t("error.upload.type")}`;
        if (code === "too-many-files") return `${file.name}: ${t("error.upload.count", { count: MAX_FILES })}`;
        return `${file.name}: ${t("error.upload.general")}`;
      })
    );

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles, fileRejections) => {
      const mappedErrors = toDropErrors(fileRejections);
      setDropErrors(mappedErrors);

      // Set preview url
      const nextFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      // Append new files to the back instead of replacing existing ones.
      setFiles((prev) => [...prev, ...nextFiles]);
    },
    onError: (error) => {
      console.error(error);
      setDropErrors([t("error.upload.general")]);
    },
  });

  const fileItems = useMemo(
    () =>
      files.map((file, index) => {
        const preview = (file as UploadFile).preview ?? "";
        return {
          key: `file-${file.name}-${file.size}-${file.lastModified}-${index}`,
          publicId: undefined,
          name: file.name,
          url: preview,
          file,
          isRemoved: false,
        };
      }),
    [files]
  );
  const existingItems = useMemo(
    () =>
      images?.length
        ? images?.map((image, index) => ({
            key: `existing-${image?.publicId ?? `no-id-${index}`}`,
            publicId: image?.publicId ?? undefined,
            name: image?.name,
            url: image?.url ?? "",
            isRemoved: removePublicIds.indexOf(image?.publicId ?? "") !== -1,
          }))
        : [],
    [images, removePublicIds]
  );

  useEffect(() => {
    const prevFiles = prevFilesRef.current;
    const removedFiles = prevFiles.filter((prevFile) => !files.includes(prevFile));
    removedFiles.forEach((file) => {
      const preview = (file as UploadFile).preview;
      if (preview) URL.revokeObjectURL(preview);
    });
    prevFilesRef.current = files;

    // Reset main image
    if (!files.length && existingItems.length) setThumbnailPublicId(existingItems[0]?.publicId);

    // Re-order previews
    if (thumbnailPublicId) {
      setPreviews([...existingItems, ...fileItems] as PreviewItem[]);
    } else {
      setPreviews([...fileItems, ...existingItems] as PreviewItem[]);
    }
  }, [files, images, removePublicIds]);

  useEffect(() => {
    return () => {
      prevFilesRef.current.forEach((file) => {
        const preview = (file as UploadFile).preview;
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, []);

  /**
   * Remove a file from the files array
   * @param key The key of the file to remove
   */
  const handleRemoveFile = (key: string | undefined) => {
    if (!key) return;
    const index = fileItems.findIndex((item) => item.key === key);
    setFiles((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  /**
   * Clear the files array
   */
  const handleClearFiles = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFiles([]);
    setDropErrors([]);
  };

  /**
   * Remove an image from the remove array
   * @param publicId The id of the image to remove
   */
  const handleRemoveImage = (publicId: string) => {
    const idx = removePublicIds.indexOf(publicId);
    const next = idx === -1 ? [...removePublicIds, publicId] : removePublicIds.filter((id) => id !== publicId);
    setRemovePublicIds(next);
  };

  const actionItem = useMemo(() => previews.find((item) => item.key === menuItemKey) ?? null, [menuItemKey, previews]);

  /**
   * Open the menu
   * @param event
   * @param key
   */
  const handleOpenMenu = (event: MouseEvent<HTMLElement>, key: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuItemKey(key);
  };

  /**
   * Close the menu
   */
  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuItemKey(null);
  };

  /**
   * Set the main thumbnail
   */
  const handleSetMain = () => {
    const itemIndex = previews.findIndex((item) => item.key === actionItem?.key);
    if (!actionItem || itemIndex === 0) {
      handleCloseMenu();
      return;
    }

    // File, set as thumbnail
    if (!actionItem.publicId) {
      setThumbnailPublicId(undefined);

      // Move file to first position
      const fileIndex = fileItems.findIndex((item) => item.key === actionItem.key);
      setFiles((prev) => {
        const next = [...prev];
        const [selected] = next.splice(fileIndex, 1);
        return [selected, ...next];
      });
    } else {
      // If existing image, set as main
      setThumbnailPublicId(actionItem.publicId);

      // Undo remove image
      setRemovePublicIds(removePublicIds.filter((publicId) => publicId !== actionItem.publicId));

      // Move image to first position
      const imageIndex = existingItems.findIndex((item) => item.key === actionItem.key);
      setImages((prev) => {
        const next = [...prev];
        const [selected] = next.splice(imageIndex, 1);
        return [selected, ...next];
      });
    }

    handleCloseMenu();
  };

  /**
   * Delete product image
   */
  const handleDelete = () => {
    const isMain = previews.findIndex((item) => item.key === actionItem?.key) === 0;
    if (isMain) {
      handleCloseMenu();
      return;
    }

    // If new image, remove file
    if (!actionItem?.publicId) {
      handleRemoveFile(actionItem?.key);
    } else {
      // If existing image, remove image
      handleRemoveImage(actionItem?.publicId);
      if (actionItem?.publicId == thumbnailPublicId) setThumbnailPublicId(undefined);
    }

    handleCloseMenu();
  };

  const isActionMain = previews.findIndex((item) => item.key === actionItem?.key) === 0;
  const enableButtons = Boolean(actionItem && !isActionMain);

  return (
    <StyledSection>
      <DropZoneContainer
        className={`${isFocused ? "focus" : ""} ${isDragAccept ? "accept" : ""} ${dropErrors.length ? "error" : ""}`}
        {...getRootProps({ isFocused, isDragAccept, isDragReject })}
      >
        <input {...getInputProps()} />
        <DropZoneContent>
          {dropErrors.length ? (
            <>
              <BrokenImage fontSize="large" color="error" />
              <ErrorsContainer>{dropErrors.join("\n")}</ErrorsContainer>
            </>
          ) : (
            <>
              <PermMedia fontSize="large" />
              <Title>{t("dropzone.instruction")}</Title>
              <Tip>{t("dropzone.info", { count: MAX_FILES, size: `${MAX_FILE_SIZE / 1000000}MB` })}</Tip>
            </>
          )}
          {files?.length > 0 ||
            (dropErrors.length > 0 && (
              <Button variant="contained" color="error" sx={{ mt: 1 }} onClick={handleClearFiles}>
                {t("dropzone.clear")}
              </Button>
            ))}
        </DropZoneContent>
      </DropZoneContainer>
      {previews.length > 0 && (
        <ThumbContainer>
          {previews.map((item, index) => {
            return (
              <Tooltip
                key={item.key}
                title={
                  index === 0
                    ? `${t("dropzone.thumbnail")}: ${item.name}`
                    : item.isRemoved
                      ? `${t("remove")}: ${item.name}`
                      : item?.publicId
                        ? (item?.name ?? "")
                        : `${t("dropzone.upload")}: ${item.name}`
                }
              >
                <Thumb
                  className={`${item.publicId == undefined ? "file" : ""} ${index === 0 ? "main" : ""} ${item.isRemoved ? "remove" : ""}`}
                >
                  {index !== 0 && (
                    <StyledIconButton onClick={(e) => handleOpenMenu(e, item.key)}>
                      <MoreVert />
                    </StyledIconButton>
                  )}
                  <ThumbInner>
                    <ThumbImage src={item.url} />
                  </ThumbInner>
                </Thumb>
              </Tooltip>
            );
          })}
        </ThumbContainer>
      )}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor && actionItem)} onClose={handleCloseMenu}>
        <MenuItem disabled={!enableButtons} onClick={handleSetMain}>
          <ListItemIcon>
            <PermMedia fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("dropzone.thumbnail")}</ListItemText>
        </MenuItem>
        <MenuItem disabled={!enableButtons} onClick={handleDelete}>
          <ListItemIcon>
            {actionItem?.publicId ? (
              actionItem?.isRemoved ? (
                <RestartAlt fontSize="small" />
              ) : (
                <Delete fontSize="small" />
              )
            ) : (
              <Close fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{actionItem?.isRemoved ? t("dropzone.restore") : t("dropzone.remove")}</ListItemText>
        </MenuItem>
      </Menu>
    </StyledSection>
  );
};

export default CustomDropZone;
