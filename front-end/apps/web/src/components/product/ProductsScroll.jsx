import styled from "@emotion/styled";
import Progress from "@ring/ui/Progress";
import ProductPreview from "./ProductPreview";
import { trackWindowScroll } from "react-lazy-load-image-component";

//#region styled
const Container = styled.div`
  position: relative;
  max-height: 100%;
  width: 200px;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  ${({ theme }) => theme.breakpoints.down("md")} {
    width: auto;
    padding: 0 ${({ theme }) => theme.spacing(1)};
  }
`;

const SliderContainer = styled.div`
  -ms-overflow-style: none;
  scrollbar-width: none;
  display: flex;
  flex-direction: column;
  max-height: 950px;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    width: 100%;
    flex-direction: row;
  }
`;
//#endregion

const tempItems = [
  <ProductPreview key={"temp1"} />,
  <ProductPreview key={"temp2"} />,
  <ProductPreview key={"temp3"} />,
  <ProductPreview key={"temp4"} />,
];

const ProductsScroll = ({
  data,
  isError,
  isLoading,
  isFetching,
  isSuccess,
  isUninitialized = false,
  scrollPosition,
}) => {
  let productsScroll;
  const loading = isLoading || isFetching || isError || isUninitialized;

  if (loading) {
    productsScroll = tempItems;
  } else if (isSuccess) {
    const { ids, entities } = data;

    productsScroll = ids?.length
      ? [
          ids?.map((id, index) => {
            const book = entities[id];

            return (
              <div key={`${id}-${index}`}>
                <ProductPreview {...{ book, scrollPosition }} />
              </div>
            );
          }),
        ]
      : tempItems;
  } else {
    productsScroll = tempItems;
  }

  return (
    <Container>
      {loading && (
        <Progress
          color={`${isError || isUninitialized ? "error" : "primary"}`}
        />
      )}
      <SliderContainer>{productsScroll}</SliderContainer>
    </Container>
  );
};

export default trackWindowScroll(ProductsScroll);
