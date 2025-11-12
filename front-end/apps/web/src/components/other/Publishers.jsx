import styled from "@emotion/styled";
import { useRef } from "react";
import { Link } from "react-router";
import { useGetPublishersQuery } from "../../features/publishers/publishersApiSlice";
import { LazyLoadImage } from "react-lazy-load-image-component";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";

//#region styled
const StyledLazyImage = styled(LazyLoadImage)`
  aspect-ratio: 1/1;
  height: 100px;
  width: 100px;
  object-fit: contain;

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    height: 80px;
    width: 80px;
  }
`;

const StyledSkeleton = styled(Skeleton)`
  aspect-ratio: 1/1;
  height: 100px;
  width: 100px;

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    height: 80px;
    width: 80px;
  }
`;

const ItemContainer = styled.div`
  padding: 4px;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const PubContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      .button-container {
        opacity: 1;
        visibility: visible;
      }
    }
  }
`;

const Wrapper = styled.div`
  position: relative;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  overflow-x: scroll;
  scroll-behavior: smooth;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.breakpoints.up("md")} {
    ${ItemContainer}:first-of-type {
      margin-left: 20px;
    }
    ${ItemContainer}:last-of-type {
      margin-right: 40px;
    }
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  right: 0;
  padding-left: 20px;
  height: 100%;
  background-image: linear-gradient(
    to left,
    ${({ theme }) => theme.vars.palette.background.paper},
    ${({ theme }) => theme.vars.palette.background.paper} 80%,
    transparent 100%
  );
  display: flex;
  align-items: center;
  transition: all 0.25s ease;
  opacity: 0;
  visibility: hidden;
  z-index: 2;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 1;
      visibility: visible;
    }
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;
  }
`;
//#endregion

const Publishers = () => {
  const { data: publishers, isLoading, isSuccess, isError } = useGetPublishersQuery();
  const slideRef = useRef();

  //Scroll
  const scrollSlide = (n) => {
    slideRef.current.scrollLeft += n;
  };

  let pubsContent;

  if (isLoading || isError) {
    pubsContent = [...Array(15)].map((item, index) => (
      <ItemContainer key={`pub-${index}`}>
        <StyledSkeleton variant="rectangular" animation={false} />
      </ItemContainer>
    ));
  } else if (isSuccess) {
    const { ids, entities } = publishers;

    pubsContent = ids?.length
      ? ids?.map((pubId, index) => {
          const pub = entities[pubId];

          return (
            <ItemContainer key={`pub-${pubId}-${index}`}>
              <Link to={`/store?pubs=${pubId}`} title={pub?.name}>
                <StyledLazyImage
                  src={pub?.image}
                  alt={`Publisher: ${pub?.name}`}
                  placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
                />
              </Link>
            </ItemContainer>
          );
        })
      : null;
  }

  return (
    <PubContainer>
      <Wrapper draggable={true} ref={slideRef}>
        {pubsContent}
      </Wrapper>
      <ButtonContainer className="button-container">
        <div>
          <IconButton aria-label="Scroll publishers to left" onClick={() => scrollSlide(-500)}>
            <KeyboardArrowLeft fontSize="small" />
          </IconButton>
          <IconButton aria-label="Scroll publishers to right" onClick={() => scrollSlide(500)}>
            <KeyboardArrowRight fontSize="small" />
          </IconButton>
        </div>
      </ButtonContainer>
    </PubContainer>
  );
};

export default Publishers;
