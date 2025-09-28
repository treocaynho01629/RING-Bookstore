import styled from "@emotion/styled";
import { useRef, useState, lazy, Suspense } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Skeleton from "@mui/material/Skeleton";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Carousel from "react-multi-carousel";

const LightboxImages = lazy(() => import("./LightboxImages"));

//#region styled
const ImgContainer = styled.div`
  position: relative;
  text-align: center;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  .react-multi-carousel-list {
    position: unset !important;
  }

  ${({ theme }) => theme.breakpoints.up("md")} {
    width: 100%;
    position: sticky;
    top: ${({ theme }) => theme.mixins.toolbar.minHeight + 15}px;
  }
`;

const ImageNumber = styled.span`
  font-size: 14px;
  font-weight: 420;
  padding: 2px 8px;
  position: absolute;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50px;
  top: ${({ theme }) => theme.spacing(3)};
  left: ${({ theme }) => theme.spacing(3)};
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

const MoreImageContainer = styled.div`
  padding: 10px;

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 5px;
  }
`;

const CustomArrowButton = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
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

  &:hover {
    opacity: 1;
    transform: scale(1.1);
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

const ImageSlide = styled.div`
  padding: 10px;
  padding-bottom: 0;
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

const SmallImageSlide = styled.div`
  display: flex;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  opacity: 0.5;
  aspect-ratio: 1/1;
  max-height: 85px;
  margin-right: ${({ theme }) => theme.spacing(0.5)};
  cursor: pointer;
  transition: opacity 0.25s ease;

  &.active {
    border: 3px solid ${({ theme }) => theme.vars.palette.primary.main};
    opacity: 1;
  }

  &:hover {
    border: 1px solid ${({ theme }) => theme.vars.palette.primary.light};
    opacity: 1;
  }
`;

const StyledSmallLazyImage = styled(LazyLoadImage)`
  display: inline-block;
  object-fit: contain;
  width: 100%;
  aspect-ratio: 1/1;
  max-height: 85px;
  background-color: ${({ theme }) =>
    theme.vars.palette.action.disabledBackground};
`;

const StyledSmallSkeleton = styled(Skeleton)`
  display: inline-block;
  width: 100%;
  height: 100%;
  max-height: 85px;
  aspect-ratio: 1/1;
`;

const TopContainer = styled.div`
  position: relative;

  ${CustomArrowButton} {
    display: none;
  }
`;
//#endregion

const responsive = {
  default: {
    breakpoint: {
      max: 3000,
      min: 900,
    },
    items: 1,
  },
  mobile: {
    breakpoint: {
      max: 900,
      min: 0,
    },
    items: 1,
  },
};

const responsiveGroup = {
  default: {
    breakpoint: {
      max: 3000,
      min: 900,
    },
    items: 5,
    slidesToSlide: 3,
    partialVisibilityGutter: 5,
  },
  mobile: {
    breakpoint: {
      max: 900,
      min: 0,
    },
    items: 6,
    slidesToSlide: 3,
    partialVisibilityGutter: 5,
  },
};
//Custom stuff
const CustomArrow = ({ onClick, className, direction }) => (
  <CustomArrowButton
    className={`${className ?? ""} ${direction}`}
    onClick={onClick}
  >
    {direction == "left" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
  </CustomArrowButton>
);

const ButtonGroup = ({ images, goToSlide, currentSlide, responsive }) => {
  return (
    <MoreImageContainer>
      <Carousel
        responsive={responsive}
        autoPlay={false}
        customLeftArrow={<CustomArrow direction="left" />}
        customRightArrow={<CustomArrow direction="right" />}
        removeArrowOnDeviceType={["mobile"]}
        minimumTouchDrag={80}
        partialVisible
      >
        {images?.length
          ? images.map((image, index) => (
              <SmallImageSlide
                key={index}
                className={`${index === currentSlide ? "active" : ""}`}
                onClick={() => goToSlide(index)}
              >
                <StyledSmallLazyImage
                  src={image?.src}
                  srcSet={image?.srcSet
                    .map((item) => `${item.src} ${item.width}w`)
                    .join(", ")}
                  sizes="70px"
                  alt={image?.alt}
                  placeholder={
                    <StyledSmallSkeleton
                      variant="rectangular"
                      animation={false}
                    />
                  }
                />
              </SmallImageSlide>
            ))
          : [...Array(4)].map((item, index) => (
              <SmallImageSlide key={index}>
                <StyledSmallSkeleton variant="rectangular" />
              </SmallImageSlide>
            ))}
      </Carousel>
    </MoreImageContainer>
  );
};

const ProductImages = ({ images }) => {
  let sliderRef = useRef();
  const [slideIndex, setSlideIndex] = useState(0);
  const [open, setOpen] = useState(undefined);

  const goToSlide = (index) => {
    if (sliderRef?.goToSlide) sliderRef.goToSlide(index);
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  let carousel = (
    <Carousel
      ref={(e) => (sliderRef = e)}
      responsive={responsive}
      autoPlay={!open}
      customLeftArrow={<CustomArrow direction="left" />}
      customRightArrow={<CustomArrow direction="right" />}
      removeArrowOnDeviceType={["mobile"]}
      pauseOnHover={true}
      arrows={open}
      rewindWithAnimation={true}
      autoPlaySpeed={15000}
      transitionDuration={200}
      beforeChange={(nextSlide) => {
        setSlideIndex(nextSlide);
      }}
      rewind
    >
      {images?.length ? (
        images.map((image, index) => (
          <ImageSlide key={index} onClick={handleOpen}>
            <StyledLazyImage
              src={image?.src}
              srcSet={image?.srcSet
                .map((item) => `${item.src} ${item.width}w`)
                .join(", ")}
              sizes={image?.sizes}
              alt={image?.alt}
              visibleByDefault={index == 0}
              placeholder={
                <StyledSkeleton variant="rectangular" animation={false} />
              }
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
          {images?.length ? (
            <ImageNumber>
              {slideIndex + 1}/{images.length}
            </ImageNumber>
          ) : (
            <ImageNumber>Đang tải...</ImageNumber>
          )}
          {carousel}
        </TopContainer>
        <ButtonGroup
          {...{
            images,
            goToSlide,
            currentSlide: slideIndex,
            responsive: responsiveGroup,
          }}
        />
      </ImgContainer>
      <Suspense fallback={null}>
        {open !== undefined && (
          <LightboxImages {...{ images, open, handleClose }} />
        )}
      </Suspense>
    </>
  );
};

export default ProductImages;
