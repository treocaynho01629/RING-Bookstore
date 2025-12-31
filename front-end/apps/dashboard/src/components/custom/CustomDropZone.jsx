import styled from "@emotion/styled";
import { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Close, Delete, PermMedia } from "@mui/icons-material";
import { Button, IconButton, Tooltip } from "@mui/material";

//#region styled
const getColor = (props) => {
  if (props.isDragAccept) {
    return props.theme.vars.palette.success.main;
  }
  if (props.isDragReject || props.isMissing) {
    return props.theme.vars.palette.error.main;
  }
  if (props.isFocused) {
    return props.theme.vars.palette.info.main;
  }
  return props.theme.vars.palette.primary.main;
};

const DropZoneContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  background-color: ${({ theme }) => theme.vars.palette.action.focus};
  border: 2.75px dashed;
  border-color: ${(props) => getColor(props)};
  cursor: pointer;
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
  }
`;

const ThumbContainer = styled.aside`
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

const Thumb = styled.div`
  display: flex;
  border: 0.5 solid ${({ theme }) => theme.vars.palette.action.focus};
  height: 80px;
  width: 80px;
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
    color: ${({ theme }) => theme.vars.palette.grey[800]};
  }

  &.file {
    border: 3px solid ${({ theme }) => theme.vars.palette.warning.main};

    &:before {
      background-image: linear-gradient(
        0deg,
        ${({ theme }) => theme.vars.palette.warning.main},
        transparent 100%
      ) !important;
    }
  }

  &.remove {
    border: 3px solid ${({ theme }) => theme.vars.palette.error.main};

    &:before {
      background-image: linear-gradient(
        0deg,
        ${({ theme }) => theme.vars.palette.error.main},
        transparent 100%
      ) !important;
    }
  }

  &.thumbnail {
    &:before {
      content: "<Thumbnail>";
      background-image: linear-gradient(0deg, ${({ theme }) => theme.vars.palette.success.main}, transparent 100%);
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

const ThumbInner = styled.div`
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

  &.left {
    right: unset;
    left: 2px;
  }

  svg {
    font-size: 15px;
  }
`;

const Title = styled.h3`
  margin: 0 0 10px;
  font-weight: 450;
`;

const ErrMsg = styled.b`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.vars.palette.error.main};
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
//#endregion

const CustomDropZone = ({ thumbnailId, setThumbnailId, remove, setRemove, images, files, setFiles, isMissing }) => {
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, fileRejections } = useDropzone({
    maxFiles: 10,
    maxSize: 2000000,
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  const handleRemoveFile = (index) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
    });
  };

  const handleChangeThumbnail = (index) => {
    setThumbnailId(null);
    setFiles((prev) => {
      let newFiles = [...prev];
      const thumb = newFiles.splice(index, 1);
      newFiles = thumb.concat(newFiles);
      return newFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
    });
  };

  const handleSetThumbnail = (id) => {
    const removeIndex = remove.indexOf(id);
    let newRemove = [];

    if (removeIndex === 0) {
      newRemove = newRemove.concat(remove.slice(1));
    } else if (removeIndex === remove.length - 1) {
      newRemove = newRemove.concat(remove.slice(0, -1));
    } else if (removeIndex > 0) {
      newRemove = newRemove.concat(remove.slice(0, removeIndex), remove.slice(removeIndex + 1));
    }

    setRemove(newRemove);
    setThumbnailId(id);
  };

  const handleClearFiles = () => {
    setFiles([]);
  };

  const handleRemoveImage = (id) => {
    const removeIndex = remove.indexOf(id);
    let newRemove = [];

    if (removeIndex === -1) {
      newRemove = newRemove.concat(remove, id);
    } else if (removeIndex === 0) {
      newRemove = newRemove.concat(remove.slice(1));
    } else if (removeIndex === remove.length - 1) {
      newRemove = newRemove.concat(remove.slice(0, -1));
    } else if (removeIndex > 0) {
      newRemove = newRemove.concat(remove.slice(0, removeIndex), remove.slice(removeIndex + 1));
    }

    setRemove(newRemove);
  };

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <ErrMsg>
      File: {file.path} - {file.size} bytes Quá lớn
    </ErrMsg>
  ));

  let previews = [];

  if (thumbnailId) {
    const thumbnail = images?.filter((image) => {
      return image.id == thumbnailId;
    })[0];

    if (thumbnail)
      previews.push(
        <Tooltip key={`thumbnail-${thumbnail.id}`} title={"Thumbnail: " + thumbnail.name}>
          <Thumb className="thumbnail">
            <ThumbInner>
              <ThumbImage src={thumbnail.url} />
            </ThumbInner>
          </Thumb>
        </Tooltip>
      );
  }

  if (files?.length) {
    files.forEach((file, index) => {
      previews.push(
        <Tooltip key={`file-${file.name}-${index}`} title={"Tải ảnh: " + file.name}>
          <Thumb className={`${!thumbnailId && index == 0 ? "thumbnail" : ""} file`}>
            <StyledIconButton onClick={() => handleRemoveFile(index)}>
              <Close />
            </StyledIconButton>
            {(thumbnailId || index > 0) && (
              <StyledIconButton className="left" onClick={() => handleChangeThumbnail(index)}>
                <PermMedia />
              </StyledIconButton>
            )}
            <ThumbInner>
              <ThumbImage
                src={file.preview}
                onLoad={() => {
                  URL.revokeObjectURL(file.preview);
                }}
              />
            </ThumbInner>
          </Thumb>
        </Tooltip>
      );
    });
  }

  if (images?.length) {
    images.forEach((image, index) => {
      if (image?.id != thumbnailId) {
        const isRemoved = remove.indexOf(image.id);

        previews.push(
          <Tooltip key={`preview-${image.id}-${index}`} title={isRemoved ? "Gỡ ảnh: " : "" + image.name}>
            <Thumb className={isRemoved != -1 ? "remove" : ""}>
              <StyledIconButton onClick={() => handleRemoveImage(image.id)}>
                <Delete />
              </StyledIconButton>
              <StyledIconButton className="left" onClick={() => handleSetThumbnail(image.id)}>
                <PermMedia />
              </StyledIconButton>
              <ThumbInner>
                <ThumbImage src={image.url} />
              </ThumbInner>
            </Thumb>
          </Tooltip>
        );
      }
    });
  }

  return (
    <section>
      <DropZoneContainer {...getRootProps({ isFocused, isDragAccept, isDragReject, isMissing })}>
        <input {...getInputProps()} style={{ display: "none" }} />
        <DropZoneContent>
          <PermMedia fontSize="large" />
          <Title>Kéo thả hoặc chọn file ảnh</Title>
          <span>Tối đa 10 ảnh (2MB)</span>
          {fileRejectionItems}
        </DropZoneContent>
      </DropZoneContainer>
      {previews?.length > 0 && (
        <>
          <ThumbContainer>{previews}</ThumbContainer>
          <ButtonContainer>
            <Button variant="outlined" color="error" onClick={handleClearFiles}>
              Xoá tất cả
            </Button>
          </ButtonContainer>
        </>
      )}
    </section>
  );
};

export default CustomDropZone;
