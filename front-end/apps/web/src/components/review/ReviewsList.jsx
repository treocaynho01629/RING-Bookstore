import { Fragment, Suspense, useCallback, useState, useEffect, lazy } from "react";
import { useGetMyReviewsQuery } from "../../features/reviews/reviewsApiSlice";
import { Message } from "@ring/ui/Components";
import { capitalize, debounce } from "lodash-es";
import {
  LoadContainer,
  MessageContainer,
  PlaceholderContainer,
  StyledEmptyIcon,
  StyledDialogTitle,
} from "../custom/ProfileComponents";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Try from "@mui/icons-material/Try";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContent from "@mui/material/DialogContent";
import ReviewItem from "./ReviewItem";
import styled from "@emotion/styled";

const ReviewForm = lazy(() => import("./ReviewForm"));

//#region styled
const ReviewsContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;
//#endregion

const defaultSize = 5;

const ReviewsList = ({ mobileMode, tabletMode, pending, setPending, handleClose }) => {
  const { username } = useAuth();
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(undefined);
  const [contextReview, setContextReview] = useState(null);
  const [pagination, setPagination] = useState({
    number: 0,
    size: defaultSize,
    isMore: true,
  });

  // Fetch orders
  const { data, isLoading, isFetching, isSuccess, isError, error } = useGetMyReviewsQuery({
    page: pagination?.number,
    size: pagination?.size,
    loadMore: pagination?.isMore,
  });

  // Show more
  const handleShowMore = () => {
    if (isFetching || typeof data?.page !== "number" || data?.page < pagination?.number) return;
    const nextPage = data?.page + 1;
    if (nextPage < data?.totalPages) setPagination((prev) => ({ ...prev, number: nextPage }));
  };

  /**
   * Open the edit form
   */
  const handleOpenEdit = (review) => {
    setContextReview(review);
    setOpenForm(true);
  };

  /**
   * Close the edit form
   */
  const handleCloseForm = () => {
    setOpenForm(false);
  };

  /**
   * Handle window scroll
   */
  const handleWindowScroll = (e) => {
    const trigger = document.body.scrollHeight - 300 < window.scrollY + window.innerHeight;
    if (trigger) handleShowMore();
  };

  /**
   * Handle scroll
   */
  const handleScroll = (e) => {
    const trigger = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (trigger) handleShowMore();
  };

  const windowScrollListener = useCallback(debounce(handleWindowScroll, 500), [data]);
  const scrollListener = useCallback(debounce(handleScroll, 500), [data]);

  useEffect(() => {
    window.removeEventListener("scroll", windowScrollListener);
    if (!tabletMode) window.addEventListener("scroll", windowScrollListener);

    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [tabletMode, data]);

  let reviewsContent;

  if (isLoading || (isFetching && pagination.number == 0)) {
    reviewsContent = (
      <PlaceholderContainer>
        <LoadContainer>
          <CircularProgress color="primary" />
        </LoadContainer>
      </PlaceholderContainer>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    reviewsContent = (
      <>
        {ids?.length ? (
          ids?.map((id, index) => {
            const review = entities[id];

            return (
              <Fragment key={`${id}-${index}`}>
                <ReviewItem review={review} isPreview={true} handleClick={() => handleOpenEdit(review)} />
              </Fragment>
            );
          })
        ) : (
          <MessageContainer>
            <Message>
              <StyledEmptyIcon />
              {capitalize(t("message.empty", { item: t("review.label") }))}
            </Message>
          </MessageContainer>
        )}
      </>
    );
  } else if (isError) {
    reviewsContent = (
      <MessageContainer>
        <Message color="error">{error?.error || t("error.general")}</Message>
      </MessageContainer>
    );
  }

  return (
    <>
      <StyledDialogTitle>
        <a onClick={handleClose}>
          <KeyboardArrowLeft />
        </a>
        <Try />
        &nbsp;{t("review.title", { ns: "authenticated" })}
      </StyledDialogTitle>
      <DialogContent
        sx={{ py: 0, px: { xs: 1, sm: 2, md: 0 }, height: { xs: "100dvh", md: "auto" } }}
        onScroll={tabletMode ? scrollListener : undefined}
      >
        <ReviewsContainer>
          {reviewsContent}
          {pagination.number > 0 && isFetching && (
            <LoadContainer>
              <CircularProgress size={30} color="primary" />
            </LoadContainer>
          )}
          {data?.ids?.length > 0 && data?.ids?.length == data?.totalElements && (
            <Message color="warning">{capitalize(t("message.out", { item: t("review.label") }))}</Message>
          )}
        </ReviewsContainer>
      </DialogContent>
      {openForm !== undefined && (
        <Suspense fallback={null}>
          <ReviewForm
            {...{
              username,
              open: openForm,
              handleClose: handleCloseForm,
              mobileMode,
              pending,
              setPending,
              review: contextReview,
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default ReviewsList;
