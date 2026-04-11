"use client";

import { useRef, useState, lazy, Suspense } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { getImageSrc } from "@ring/shared/enums/image";
import { styled } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import Carousel from "react-multi-carousel";

const LightboxImages = lazy(() => import("@ring/ui/LightboxImages"));

export type SrcSet = Record<number, string>;

//#region styled
const ImgContainer = styled("div")`
  position: relative;
  text-align: center;
  background-color: ${({ theme }) => theme.vars?.palette.background.paper};

  .react-multi-carousel-list {
    position: unset !important;
  }
`;

const ImageNumber = styled("span")`
  font-size: 14px;
  font-weight: 420;
  padding: 2px 8px;
  position: absolute;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50px;
  top: ${({ theme }) => theme.spacing(2)};
  left: ${({ theme }) => theme.spacing(2)};
  opacity: 0.9;
  z-index: 5;
  pointer-events: none;

  ${({ theme }) => theme.breakpoints.down("md")} {
    bottom: ${({ theme }) => theme.spacing(3)};
    right: ${({ theme }) => theme.spacing(3)};
    top: auto;
    left: auto;
  }
`;

const CustomArrowButton = styled("div")`
  position: absolute;
  background-color: ${({ theme }) => theme.vars?.palette.background.paper};
  border: 0.5px solid ${({ theme }) => theme.vars?.palette.divider};
  border-radius: 50%;
  height: 30px;
  width: 30px;
  font-size: 1.75em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  opacity: 0.8;
  z-index: 1;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  &.left {
    left: -10px;
  }
  &.right {
    right: -10px;
  }

  svg {
    font-size: inherit;
  }
`;

const ImageSlide = styled("div")`
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 450px;
  aspect-ratio: 1/1;
  background-clip: content-box;

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 0;
    border: none;
  }
`;

const StyledLazyImage = styled(LazyLoadImage)`
  object-fit: contain;
  width: 100%;
  max-height: 450px;
  aspect-ratio: 1/1;
  cursor: pointer;
`;

const StyledSkeleton = styled(Skeleton)`
  width: 100%;
  height: 100%;
  max-height: 450px;
  aspect-ratio: 1/1;
`;

const TopContainer = styled("div")`
  position: relative;
`;

const ThumbnailContainer = styled("div")`
  padding: ${({ theme }) => theme.spacing(2, 0, 0)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex-wrap: wrap;
  align-items: center;
`;

const SmallThumbnail = styled("div")<{ $active?: boolean }>`
  display: flex;
  border: 0.5px solid ${({ theme }) => theme.vars?.palette.divider};
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  aspect-ratio: 1/1;
  max-height: 52px;
  min-width: 52px;
  cursor: pointer;
  transition: opacity 0.25s ease;
  overflow: hidden;
  flex-shrink: 0;

  ${({ $active, theme }) =>
    $active &&
    `
    border: 2px solid ${theme.vars?.palette.primary.main};
  `}

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border: 1px solid ${({ theme }) => theme.vars?.palette.primary.light};
      opacity: 1;
    }
  }
`;

const StyledSmallLazyImage = styled(LazyLoadImage)`
  object-fit: contain;
  width: 100%;
  aspect-ratio: 1/1;
  background-color: ${({ theme }) => theme.vars?.palette.action.disabledBackground};
`;

const AddImageButton = styled("button")`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1/1;
  max-height: 52px;
  min-width: 52px;
  border: 1px dashed ${({ theme }) => theme.vars?.palette.divider};
  background-color: ${({ theme }) => theme.vars?.palette.action.hover};
  cursor: pointer;
  color: ${({ theme }) => theme.vars?.palette.text.secondary};
  transition: all 0.2s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${({ theme }) => theme.vars?.palette.primary.main};
      color: ${({ theme }) => theme.vars?.palette.primary.main};
      background-color: ${({ theme }) => theme.vars?.palette.action.selected};
    }
  }
`;
//#endregion

const responsive = {
  default: {
    breakpoint: { max: 3000, min: 900 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 900, min: 0 },
    items: 1,
  },
};

const CustomArrow = ({
  onClick,
  className,
  direction,
}: {
  onClick?: () => void;
  className?: string;
  direction: "left" | "right";
}) => (
  <CustomArrowButton className={`${className ?? ""} ${direction}`} onClick={onClick}>
    {direction === "left" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
  </CustomArrowButton>
);

export interface ProductImagesProps {
  srcSetList?: SrcSet[] | null;
  loadingLabel?: string;
  onAddImage?: () => void;
  productId?: string;
}

export default function ProductImages({ srcSetList, loadingLabel = "Loading...", onAddImage }: ProductImagesProps) {
  const sliderRef = useRef<{ goToSlide?: (index: number) => void } | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [open, setOpen] = useState<boolean | undefined>(undefined);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const goToSlide = (index: number) => {
    sliderRef.current?.goToSlide?.(index);
  };

  const carousel = (
    <Carousel
      ref={(e) => {
        sliderRef.current = e;
      }}
      responsive={responsive}
      autoPlay={!open}
      customLeftArrow={<CustomArrow direction="left" />}
      customRightArrow={<CustomArrow direction="right" />}
      removeArrowOnDeviceType={["mobile"]}
      pauseOnHover
      arrows={open}
      rewindWithAnimation
      autoPlaySpeed={15000}
      transitionDuration={200}
      beforeChange={(nextSlide) => setSlideIndex(nextSlide)}
      rewind
    >
      {srcSetList?.length ? (
        srcSetList.map((srcSet, index) => (
          <ImageSlide key={index} onClick={handleOpen}>
            <StyledLazyImage
              src={getImageSrc(srcSet, 450)}
              srcSet={Object.entries(srcSet)
                .map(([key, value]) => `${value} ${key}w`)
                .join(", ")}
              sizes="(min-width: 450px) 405px, 100vw"
              alt={`Image ${index + 1} of ${srcSetList.length}`}
              visibleByDefault={index === 0}
              placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
            />
          </ImageSlide>
        ))
      ) : (
        <ImageSlide>
          <StyledSkeleton variant="rectangular" />
        </ImageSlide>
      )}
    </Carousel>
  );

  return (
    <>
      <ImgContainer>
        <TopContainer>
          {srcSetList?.length ? (
            <ImageNumber>
              {slideIndex + 1}/{srcSetList.length}
            </ImageNumber>
          ) : (
            <ImageNumber>{loadingLabel}</ImageNumber>
          )}
          {carousel}
        </TopContainer>
        <ThumbnailContainer>
          {srcSetList?.length ? (
            <>
              {srcSetList.map((srcSet, index) => (
                <SmallThumbnail key={index} $active={index === slideIndex} onClick={() => goToSlide(index)}>
                  <StyledSmallLazyImage
                    src={getImageSrc(srcSet, 70)}
                    alt={`Thumbnail ${index + 1}`}
                    placeholder={
                      <Skeleton variant="rectangular" animation={false} sx={{ width: "100%", height: "100%" }} />
                    }
                  />
                </SmallThumbnail>
              ))}
              {onAddImage && (
                <AddImageButton type="button" onClick={onAddImage} title="Add image">
                  <AddPhotoAlternate fontSize="small" />
                </AddImageButton>
              )}
            </>
          ) : (
            <>
              {[...Array(4)].map((_, index) => (
                <SmallThumbnail key={index} $active={false}>
                  <Skeleton variant="rectangular" animation={false} sx={{ width: "100%", height: "100%" }} />
                </SmallThumbnail>
              ))}
            </>
          )}
        </ThumbnailContainer>
      </ImgContainer>
      <Suspense fallback={null}>
        {open !== undefined && (
          <LightboxImages srcSetList={srcSetList ?? undefined} open={open} handleClose={handleClose} />
        )}
      </Suspense>
    </>
  );
}
