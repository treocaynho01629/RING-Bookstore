// Books
export const sortBooksBy = [
  {
    value: "createdDate",
    label: "search.sort.latest",
  },
  {
    value: "totalOrders",
    label: "search.sort.best-selling",
  },
  {
    value: "favorite",
    label: "search.sort.favorite",
  },
  {
    value: "price",
    label: "search.sort.price",
  },
];

export const booksAmount = [
  {
    value: 1,
    label: "search.sort.in-stock",
  },
  {
    value: 0,
    label: "all.label",
  },
];

// Shops
export const sortShopsBy = [
  {
    value: "totalFollowers",
    label: "search.sort.featured",
  },
  {
    value: "joinedDate",
    label: "joined.date",
  },
  {
    value: "totalReviews",
    label: "search.sort.favorite",
  },
];

// Reviews
export const sortReviewsBy = [
  {
    value: "createdDate",
    label: "review.sort.latest",
  },
  {
    value: "rating",
    label: "review.sort.favorite",
  },
];

export const filterShopsBy = [
  {
    value: "ALL",
    label: "all.label",
  },
  {
    value: "FOLLOWED",
    label: "shop.following",
  },
];

export const filterShopsValue = {
  ALL: null,
  FOLLOWED: true,
};

// Reviews
export const rateLabels = {
  1: "review.quality.bad",
  2: "review.quality.poor",
  3: "review.quality.average",
  4: "review.quality.good",
  5: "review.quality.excellent",
};

// Other
export const pageSizes = [12, 24, 48];
