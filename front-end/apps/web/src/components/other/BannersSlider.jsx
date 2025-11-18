import styled from "@emotion/styled";
import { Fragment, useEffect, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useGetBannersQuery } from "../../features/banners/bannersApiSlice";
import { Link } from "react-router";
import { getImageSrc } from "@ring/shared/enums/image";
import Skeleton from "@mui/material/Skeleton";
import useMediaQuery from "@mui/material/useMediaQuery";
import Grid from "@mui/material/Grid";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

import Carousel from "react-multi-carousel";

//#region styled
const CustomDotButton = styled("span")(({ theme }) => ({
  "width": 8,
  "height": 8,
  "margin": "0 4px 15px",
  "borderRadius": "50%",
  "border": ".5px solid",
  "cursor": "pointer",
  "transition": "width .1s ease",
  "borderColor": theme.vars.palette.action.focus,
  "backgroundColor": theme.vars.palette.grey[400],
  ...theme.applyStyles("dark", {
    backgroundColor: theme.vars.palette.grey[700],
  }),

  "&.active": {
    width: 20,
    height: 6,
    marginTop: 2,
    opacity: 1,
    borderRadius: 5,
    borderColor: theme.vars.palette.primary.dark,
    backgroundColor: theme.vars.palette.primary.main,
  },
}));

const CustomArrowButton = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  border-radius: 50%;
  height: 24px;
  width: 24px;
  font-size: 1.5em;
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
      background-color: ${({ theme }) => theme.vars.palette.background.default};
    }
  }

  &.left {
    left: 6px;
  }
  &.right {
    right: 6px;
  }

  svg {
    font-size: inherit;
  }
`;

const BackdropContainer = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 70%;
  opacity: 0.9;
  display: none;
  z-index: -1;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: block;
    overflow: hidden;
  }
`;

const BackdropImage = styled(LazyLoadImage)`
  position: absolute;
  top: 0;
  left: -15%;
  filter: saturate(1.4) blur(20px);
  width: 130%;
  height: 130%;
  object-fit: fill;
  background-color: ${({ theme }) => theme.vars.palette.action.disabledBackground};
`;

const BackdropPlaceholder = styled(Skeleton)`
  position: absolute;
  top: 0;
  left: -5%;
  width: 110%;
  height: 100%;
`;

const SlideItemContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: visible;

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding-top: ${({ theme }) => theme.mixins.toolbar.minHeight + 10}px;
  }
`;

const StyledLazyImage = styled(LazyLoadImage)`
  width: 100%;
  height: 100%;
  object-fit: fill;
  background-color: ${({ theme }) => theme.vars.palette.action.disabledBackground};

  ${({ theme }) => theme.breakpoints.down("md")} {
    width: 90%;
    background-color: ${({ theme }) => theme.vars.palette.grey[400]};
  }
`;

const StyledSkeleton = styled(Skeleton)`
  width: 100%;
  height: 100%;
  aspect-ratio: 13/5;

  ${({ theme }) => theme.breakpoints.down("md")} {
    width: 90%;
    background-color: ${({ theme }) => theme.vars.palette.grey[400]};
  }
`;

const ExtraWrapper = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const ExtraSlider = styled.div`
  --scroll-offset: 0;

  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  transform: ${({ theme }) =>
    `translate3D(0, calc((var(--scroll-offset) + 1) * -50% - (${theme.spacing(1)} * (var(--scroll-offset) + 1))), 0)`};
  transition: transform 0.3s ease-out;
`;

const ExtraContainer = styled.div`
  display: flex;
  position: relative;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledLink = styled(Link)`
  width: 100%;
  display: flex;
  justify-content: center;
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

const CustomArrow = ({ onClick, className, direction }) => (
  <CustomArrowButton className={`${className ?? ""} ${direction}`} onClick={onClick}>
    {direction == "left" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
  </CustomArrowButton>
);

const CustomDot = ({ onClick, active }) => {
  return <CustomDotButton className={active ? "active" : ""} onClick={onClick} />;
};

function Item({ banner, index }) {
  return (
    <SlideItemContainer key={`banner-${banner?.id}-${index}`}>
      {banner ? (
        <>
          <BackdropContainer>
            <BackdropImage
              aria-hidden
              src={getImageSrc(banner?.srcSet, 100)}
              visibleByDefault={index == 0}
              placeholder={<BackdropPlaceholder variant="rectangular" animation={false} />}
            />
          </BackdropContainer>
          <StyledLink to={banner?.url}>
            <StyledLazyImage
              src={getImageSrc(banner?.srcSet, 600)}
              srcSet={Object.values(banner?.srcSet)
                .map(([key, value]) => `${value} ${key}w`)
                .join(", ")}
              sizes="(min-width: 450px) 300px, (min-width: 760px) 600px, (min-width: 900px) 800px, 100vw"
              alt={`Banner: ${banner?.name}`}
              visibleByDefault={index == 0}
              placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
            />
          </StyledLink>
        </>
      ) : (
        <>
          <BackdropContainer>
            <BackdropPlaceholder variant="rectangular" />
          </BackdropContainer>
          <StyledSkeleton variant="rectangular" animation="wave" />
        </>
      )}
    </SlideItemContainer>
  );
}

function ExtraItem({ banner }) {
  if (banner) {
    return (
      <ExtraContainer>
        <StyledLink to={banner?.url}>
          <StyledLazyImage
            src={getImageSrc(banner?.srcSet, 400)}
            alt={`Extra banner: ${banner?.name}`}
            visibleByDefault={true}
            placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
          />
        </StyledLink>
      </ExtraContainer>
    );
  } else {
    return (
      <ExtraContainer>
        <StyledSkeleton variant="rectangular" />
      </ExtraContainer>
    );
  }
}

const ExtraBanners = ({ extraBanners, slideIndex, totalBanners }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    let newIndex = totalBanners <= 1 ? 0 : slideIndex >= totalBanners - 1 ? -1 : slideIndex;
    scrollRef.current.style.setProperty("--scroll-offset", newIndex);
  }, [slideIndex]);

  return (
    <ExtraWrapper>
      <ExtraSlider ref={scrollRef}>{extraBanners}</ExtraSlider>
    </ExtraWrapper>
  );
};

const BannersSlider = () => {
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [slideIndex, setSlideIndex] = useState(0);
  const { data, isLoading, isSuccess, isError } = useGetBannersQuery({
    byShop: false,
  });

  let bannersContent = [];
  let extraBanners = [];

  if (isLoading || isError) {
    bannersContent = <Item />;
    extraBanners = [<ExtraItem key={"temp-1"} />, <ExtraItem key={"temp-2"} />, <ExtraItem key={"temp-3"} />];
  } else if (isSuccess) {
    const { ids, entities } = data;

    if (ids?.length) {
      length = ids.length;

      ids?.map((id, index) => {
        const banner = entities[id];
        bannersContent.push(<Item key={`banner-${banner?.id}-${index}`} banner={banner} index={index} />);
        extraBanners.push(
          <Fragment key={`extra-${banner?.id}-${index}`}>
            <ExtraItem banner={banner} />
          </Fragment>
        );
      });

      //Dummy
      const dummy = entities[ids[0]];
      extraBanners.push(
        <Fragment key={`dummy-${dummy?.id}`}>
          <ExtraItem banner={dummy} />
        </Fragment>
      );
    } else {
      bannersContent = <Item />;
      extraBanners = [<ExtraItem key={"temp-1"} />, <ExtraItem key={"temp-2"} />, <ExtraItem key={"temp-3"} />];
    }
  }

  return (
    <Grid container spacing={1} size={12} mb={{ xs: 2.5, md: -1 }} mt={{ xs: 0, md: 2 }}>
      <Grid size={{ xs: 12, md: "grow" }}>
        <Carousel
          responsive={responsive}
          autoPlay
          infinite
          autoPlaySpeed={15000}
          customLeftArrow={<CustomArrow direction="left" />}
          customRightArrow={<CustomArrow direction="right" />}
          removeArrowOnDeviceType={["mobile"]}
          customDot={<CustomDot />}
          beforeChange={(nextSlide) => {
            setSlideIndex(nextSlide > 5 ? nextSlide - 6 : nextSlide < 2 ? nextSlide + 2 : nextSlide - 2);
          }}
          pauseOnHover
          keyBoardControl
          showDots
          minimumTouchDrag={80}
        >
          {bannersContent}
        </Carousel>
      </Grid>
      {!tabletMode && (
        <Grid size={4} display={{ xs: "none", md: "block" }} sx={{ position: "relative" }}>
          <ExtraBanners
            {...{
              extraBanners,
              slideIndex,
              totalBanners: data?.ids.length ?? 0,
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default BannersSlider;
