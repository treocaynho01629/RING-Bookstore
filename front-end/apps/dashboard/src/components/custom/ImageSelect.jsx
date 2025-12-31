import styled from "@emotion/styled";
import { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { AddAPhoto, Clear } from "@mui/icons-material";
import { Badge } from "@mui/material";

//#region styled
const getColor = (props) => {
  if (props.isDragAccept) {
    return props.theme.vars.palette.success.main;
  }
  if (props.isDragReject) {
    return props.theme.vars.palette.error.main;
  }
  if (props.isFocused) {
    return props.theme.vars.palette.info.main;
  }
  return props.theme.vars.palette.divider;
};

const CustomBadge = styled(Badge)`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: inherit;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  background-color: ${({ theme }) => theme.vars.palette.action.focus};
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  font-size: 14px;
  opacity: 0.8;
  transition: all 0.2s ease;
`;

const ImageContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  overflow: hidden;
`;

const Image = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
  z-index: 1;
  transition: all 0.2s ease;
`;

const ImageContainer = styled.div`
  position: relative;
  height: 150px;
  width: 150px;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: 50%;
  border: 1px dashed;
  border-color: ${(props) => getColor(props)};
  cursor: pointer;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      ${ImagePlaceholder} {
        opacity: 1;
        background-color: ${({ theme }) => theme.vars.palette.action.hover};
      }

      ${Image} {
        opacity: 0.5;
      }
    }
  }
`;

const Instruction = styled.p`
  width: 100%;
  margin-bottom: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  text-align: center;
`;

const BadgeButton = styled.span`
  display: flex;
  max-width: 100px;
  align-items: center;
  font-weight: 500;
  padding: 4px;
  border-radius: 50%;
  aspect-ratio: 1/1;
  font-size: 13px;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border: 3px solid ${({ theme }) => theme.vars.palette.divider};
  z-index: 3;
  cursor: pointer;

  svg {
    font-size: 16px;
    margin-right: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme }) => theme.vars.palette.error.main};
      transition: 0.2s ease;
    }
  }
`;
//#endregion

const ImageSelect = ({ image, handleRemoveImage, file, setFile }) => {
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    maxFiles: 1,
    maxSize: 2000000,
    multiple: false,
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      setFile(
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
    return () => file.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  let avatar;

  if (file?.length != 0) {
    avatar = (
      <Image
        src={file[0].preview}
        onLoad={() => {
          URL.revokeObjectURL(file[0].preview);
        }}
      />
    );
  } else if (image) {
    avatar = <Image src={image} />;
  }

  return (
    <section className="container">
      <ImageContainer {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
        <input {...getInputProps()} />
        <CustomBadge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          invisible={!image && !file?.length}
          badgeContent={
            <BadgeButton onClick={handleRemoveImage}>
              <Clear />
            </BadgeButton>
          }
        >
          <ImageContent>
            <ImagePlaceholder>
              <AddAPhoto fontSize="large" />
              Tải ảnh
            </ImagePlaceholder>
            {avatar}
          </ImageContent>
        </CustomBadge>
      </ImageContainer>
      <Instruction>Tối đa 2MB</Instruction>
    </section>
  );
};

export default ImageSelect;
