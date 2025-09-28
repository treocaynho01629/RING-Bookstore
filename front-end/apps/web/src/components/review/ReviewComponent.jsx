import styled from "@emotion/styled";
import { useState, lazy, Suspense, Fragment, memo } from "react";
import {
  useGetReviewByBookIdQuery,
  useGetReviewsByBookIdQuery,
} from "../../features/reviews/reviewsApiSlice";
import {
  Message,
  MobileExtendButton,
  Showmore,
  Title,
} from "@ring/ui/Components";
import { numFormat } from "@ring/shared/utils/convert";
import { ReactComponent as EmptyIcon } from "@ring/shared/assets/empty";
import useAuth from "../../hooks/useAuth";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import EditOutlined from "@mui/icons-material/EditOutlined";

import Progress from "@ring/ui/Progress";
import Placeholder from "@ring/ui/Placeholder";
import ReviewItem from "./ReviewItem";

const ReviewSort = lazy(() => import("./ReviewSort"));
const ReviewForm = lazy(() => import("./ReviewForm"));
const ReviewInfo = lazy(() => import("./ReviewInfo"));
const AppPagination = lazy(() => import("../custom/AppPagination"));
const Dialog = lazy(() => import("@mui/material/Dialog"));
const DialogContent = lazy(() => import("@mui/material/DialogContent"));

//#region styled
const ReviewsWrapper = styled.div`
  position: relative;
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2.5)}`};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 0 ${({ theme }) => theme.spacing(1.5)};
  }
`;

const ReviewsContainer = styled.div`
  position: relative;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-bottom: ${({ theme }) => theme.spacing(2.5)};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-height: 200px;
  }
`;

const TitleContainer = styled.div`
  width: 100%;
  text-align: left;
`;

const ReviewSummary = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  margin: 0;
  margin-left: 5px;
  font-size: 14px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.vars.palette.warning.light};

  &.secondary {
    font-size: 14px;
    color: ${({ theme }) => theme.vars.palette.text.secondary};
  }
`;

const StyledEmptyIcon = styled(EmptyIcon)`
  height: 70px;
  width: 70px;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  fill: ${({ theme }) => theme.vars.palette.text.icon};
`;
//#endregion

const Pagination = memo(AppPagination);

const ReviewComponent = ({
  book,
  scrollIntoTab,
  tabletMode,
  pending,
  setPending,
  isReview,
  handleToggleReview,
}) => {
  //#region construct
  const { username } = useAuth();
  const [openForm, setOpenForm] = useState(undefined);

  //Pagination & filter
  const [filterBy, setFilterBy] = useState("all");
  const [pagination, setPagination] = useState({
    number: 0,
    size: 8,
    sortBy: "createdDate",
  });

  //Fetch reviews
  const productReviewsCount = book?.reviewsInfo?.total;
  const haveReviews = !(!book || productReviewsCount == 0);
  const {
    data: userReview,
    isSuccess: doneReview,
    error: errorReview,
  } = useGetReviewByBookIdQuery(
    book?.id, //User's review of this product
    { skip: !username || !book }
  );
  const {
    data,
    isLoading,
    isFetching,
    isSuccess,
    isUninitialized,
    isError,
    error,
  } = useGetReviewsByBookIdQuery(
    {
      id: book?.id,
      page: pagination?.number,
      size: pagination?.size,
      sortBy: pagination?.sortBy,
      sortDir: "desc",
      rating: filterBy === "all" ? null : filterBy,
    },
    { skip: !haveReviews }
  );
  const loading = isLoading || isFetching || isError || isUninitialized;

  //Change page
  const handlePageChange = (page) => {
    setPagination({ ...pagination, number: page - 1 });
    scrollIntoTab();
  };

  const handleChangeOrder = (e) => {
    setPagination({ ...pagination, sortBy: e.target.value });
    scrollIntoTab();
  };

  const handleChangeFilter = (e) => {
    setFilterBy(e.target.value);
  };
  const handleChangeSize = (newValue) => {
    setPagination({ ...pagination, size: newValue, number: 0 });
  };
  const handleOpenForm = () => {
    setOpenForm(true);
  };
  const handleCloseForm = () => {
    setOpenForm(false);
  };

  let reviewsContent;
  let mainContent;

  if (isLoading && !isUninitialized) {
    reviewsContent = (
      <>
        {loading && (
          <Progress
            color={`${isError || isUninitialized ? "error" : "primary"}`}
          />
        )}
        {[
          ...Array(
            productReviewsCount > pagination?.size
              ? pagination?.size
              : productReviewsCount
          ),
        ].map((item, index) => (
          <Fragment key={`temp-review-${index}`}>
            <ReviewItem />
          </Fragment>
        ))}
      </>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    reviewsContent = (
      <>
        {doneReview && userReview && (
          <ReviewItem
            {...{ username, review: userReview, handleClick: handleOpenForm }}
          />
        )}
        {ids?.length ? (
          ids?.map((id, index) => {
            const review = entities[id];

            if (id != userReview?.id) {
              //User's review exclude cuz it already on top
              return (
                <Fragment key={`${id}-${index}`}>
                  <ReviewItem
                    {...{ username, review, handleClick: handleOpenForm }}
                  />
                </Fragment>
              );
            }
          })
        ) : (
          <Message>
            <StyledEmptyIcon />
            Chưa có đánh giá nào, hãy trở thành người đầu tiên!
          </Message>
        )}
        {ids?.length > 0 && ids?.length < pagination.size && (
          <Message color="warning">Không còn đánh giá nào!</Message>
        )}
      </>
    );
  } else if (isError) {
    reviewsContent = (
      <Message color="error">{error?.error || "Đã xảy ra lỗi"}</Message>
    );
  } else if (isUninitialized && productReviewsCount == 0) {
    reviewsContent = (
      <Message>
        <StyledEmptyIcon />
        Chưa có đánh giá nào, hãy trở thành người đầu tiên!
      </Message>
    );
  }

  mainContent = (
    <>
      {book?.reviewsInfo?.total > 0 && (
        <Suspense
          fallback={
            <Box display="flex">
              <Skeleton
                variant="text"
                sx={{
                  mr: 2,
                  fontSize: "16px",
                  display: { xs: "none", md: "block" },
                }}
                width={64}
              />
              <Skeleton
                variant="rectangular"
                sx={{ mr: 1, height: 40, width: 178 }}
              />
              <Skeleton variant="rectangular" sx={{ height: 40, width: 115 }} />
            </Box>
          }
        >
          <ReviewSort
            {...{
              sortBy: pagination?.sortBy,
              handleChangeOrder,
              filterBy,
              handleChangeFilter,
              count: book?.reviewsInfo?.rates,
            }}
          />
        </Suspense>
      )}
      {reviewsContent}
      {book?.reviewsInfo?.total > pagination.size && (
        <Suspense fallback={null}>
          <Pagination
            page={pagination?.number}
            size={pagination?.size}
            count={data?.totalPages ?? 0}
            sizes={[8, 16, 24]}
            onPageChange={handlePageChange}
            onSizeChange={handleChangeSize}
          />
        </Suspense>
      )}
    </>
  );
  //#endregion

  return (
    <ReviewsWrapper>
      <Title>
        <TitleContainer>
          {book ? (
            "Đánh giá sản phẩm"
          ) : (
            <Skeleton variant="text" sx={{ fontSize: "inherit" }} width="40%" />
          )}
          {tabletMode ? (
            <ReviewSummary>
              {book ? (
                <>
                  <Rating
                    name="product-rating"
                    value={book?.reviewsInfo?.rating ?? 0}
                    readOnly
                    sx={{ fontSize: 16 }}
                    icon={<Star sx={{ fontSize: 16 }} />}
                    emptyIcon={<StarBorder sx={{ fontSize: 16 }} />}
                  />
                  <Label>{(book?.reviewsInfo?.rating ?? 0).toFixed(1)}/5</Label>
                  <Label className="secondary">
                    ({numFormat.format(productReviewsCount ?? 0)} đánh giá)
                  </Label>
                </>
              ) : (
                <Skeleton
                  variant="text"
                  sx={{ fontSize: "16px" }}
                  width={200}
                />
              )}
            </ReviewSummary>
          ) : (
            <Suspense
              fallback={<Placeholder sx={{ height: { xs: 131, md: 140 } }} />}
            >
              <ReviewInfo
                {...{
                  handleClick: handleOpenForm,
                  book,
                  disabled: errorReview?.status == 403,
                  editable: haveReviews && userReview != null,
                }}
              />
            </Suspense>
          )}
        </TitleContainer>
        {tabletMode && (
          <MobileExtendButton
            disabled={!book}
            onClick={() => handleToggleReview(true)}
          >
            {book ? (
              <Label>
                Xem tất cả <KeyboardArrowRight fontSize="small" />
              </Label>
            ) : (
              <Label>
                <Skeleton
                  variant="text"
                  sx={{ fontSize: "inherit" }}
                  width={80}
                />
              </Label>
            )}
          </MobileExtendButton>
        )}
      </Title>
      <ReviewsContainer>
        {tabletMode ? reviewsContent : mainContent}
      </ReviewsContainer>
      {tabletMode &&
        book?.reviewsInfo?.total > 0 && ( //View all
          <Showmore onClick={() => handleToggleReview(true)}>
            <Label>
              Xem tất cả ({numFormat.format(productReviewsCount ?? 0)} đánh giá){" "}
              <KeyboardArrowRight fontSize="small" />
            </Label>
          </Showmore>
        )}
      {isReview !== undefined &&
        tabletMode && ( //Mobile component
          <Suspense fallback={null}>
            <Dialog
              fullScreen
              scroll="paper"
              closeAfterTransition={false}
              open={isReview}
              onClose={() => handleToggleReview(false)}
            >
              <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                <KeyboardArrowLeft
                  onClick={() => handleToggleReview(false)}
                  style={{ marginRight: "4px" }}
                />
                Đánh giá
              </DialogTitle>
              <Suspense fallback={<Placeholder />}>
                <DialogContent
                  dividers={true}
                  sx={{ padding: 1, paddingTop: 0 }}
                >
                  <ReviewInfo book={book} />
                  {mainContent}
                </DialogContent>
              </Suspense>
              <DialogActions>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  sx={{ marginY: "10px" }}
                  disabled={!book || errorReview?.status == 403}
                  onClick={() => setOpenForm(true)}
                  startIcon={<EditOutlined />}
                >
                  {errorReview?.status == 403
                    ? "Mua sản phẩm"
                    : haveReviews && userReview != null
                      ? "Sửa đánh giá"
                      : "Viết đánh giá"}
                </Button>
              </DialogActions>
            </Dialog>
          </Suspense>
        )}
      {openForm !== undefined && (
        <Suspense fallback={null}>
          <ReviewForm
            {...{
              username,
              bookId: book?.id,
              open: openForm,
              handleClose: handleCloseForm,
              mobileMode: tabletMode,
              pending,
              setPending,
              handlePageChange,
              review: haveReviews ? userReview : null,
            }}
          />
        </Suspense>
      )}
    </ReviewsWrapper>
  );
};

export default ReviewComponent;
