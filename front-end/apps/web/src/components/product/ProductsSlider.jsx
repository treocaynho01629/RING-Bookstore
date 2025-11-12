import styled from "@emotion/styled";
import Carousel from "react-multi-carousel";
import ProductSimple from "./ProductSimple";
import { trackWindowScroll } from "react-lazy-load-image-component";
import { Message } from "@ring/ui/Components";
import { Fragment } from "react";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Progress from "@ring/ui/Progress";

//#region styled
const Container = styled.div`
  position: relative;
  max-height: 380px;
  padding: ${({ theme }) => `${theme.spacing(0.25)} 0`};

  .react-multi-carousel-list {
    position: unset !important;
    padding-bottom: 0.5px;
  }

  ${({ theme }) => theme.breakpoints.down("sm_md")} {
    padding: 0;
  }
`;

const ProductContainer = styled.div`
  &.hidden {
    visibility: hidden;
  }
`;

const MessageContainer = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CustomArrowButton = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
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

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 1;
      transform: scale(1.1);
      background-color: ${({ theme }) => theme.vars.palette.background.default};
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
//#endregion

const responsive = {
  default: {
    breakpoint: { max: 3000, min: 992 },
    items: 5,
    slidesToSlide: 5,
  },
  laptop: {
    breakpoint: { max: 992, min: 768 },
    items: 4,
    slidesToSlide: 4,
  },
  tablet: {
    breakpoint: { max: 768, min: 600 },
    items: 3,
    slidesToSlide: 3,
  },
  mobile: {
    breakpoint: { max: 600, min: 0 },
    items: 2,
    slidesToSlide: 2,
  },
};

const CustomArrow = ({ onClick, className, direction }) => (
  <CustomArrowButton className={`${className ?? ""} ${direction}`} onClick={onClick}>
    {direction == "left" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
  </CustomArrowButton>
);

const tempItems = [
  <ProductSimple key={"temp1"} />,
  <ProductSimple key={"temp2"} />,
  <ProductSimple key={"temp3"} />,
  <ProductSimple key={"temp4"} />,
  <ProductSimple key={"temp5"} />,
];

const ProductsSlider = ({
  data,
  isError,
  isLoading,
  isFetching,
  isSuccess,
  isUninitialized = false,
  scrollPosition,
}) => {
  let productsCarousel;
  const loading = isLoading || isFetching || isError || isUninitialized;

  if (loading) {
    productsCarousel = tempItems;
  } else if (isSuccess) {
    const { ids, entities } = data;

    productsCarousel = ids?.length ? (
      [
        ids?.map((id, index) => {
          const book = entities[id];

          return (
            <Fragment key={`${id}-${index}`}>
              <ProductSimple {...{ book, scrollPosition }} />
            </Fragment>
          );
        }),
      ]
    ) : (
      <ProductContainer className="hidden">
        <ProductSimple />
      </ProductContainer>
    );
  } else {
    productsCarousel = tempItems;
  }

  return (
    <Container>
      {loading && <Progress color={`${isError || isUninitialized ? "error" : "primary"}`} />}
      <Carousel
        responsive={responsive}
        customLeftArrow={<CustomArrow direction="left" />}
        customRightArrow={<CustomArrow direction="right" />}
        removeArrowOnDeviceType={["tablet", "mobile"]}
        transitionDuration={200}
        minimumTouchDrag={80}
      >
        {productsCarousel}
      </Carousel>
      {isSuccess && !data?.ids?.length && (
        <MessageContainer>
          <Message color="warning">Không có sản phẩm nào</Message>
        </MessageContainer>
      )}
    </Container>
  );
};

export default trackWindowScroll(ProductsSlider);
