// Books
export const marks = [
  {
    value: 0,
    label: "0 ₫",
  },
  {
    value: 3.325,
    label: "",
  },
  {
    value: 6.65,
    label: "100.000 ₫",
  },
  {
    value: 9.975,
    label: "",
  },
  {
    value: 13.3,
    label: "10tr ₫",
  },
];

export const suggestPrices = [
  {
    value: [0, 150000],
    label: "0 ₫ - 150.000 ₫",
  },
  {
    value: [150000, 300000],
    label: "150.000 ₫ - 300.000 ₫",
  },
  {
    value: [300000, 500000],
    label: "300.000 ₫ - 500.000 ₫",
  },
  {
    value: [500000, 700000],
    label: "500.000 ₫ - 700.000 ₫",
  },
  {
    value: [700000, 10000000],
    label: "700.000 ₫ trở lên",
  },
];

export const sortBooksBy = [
  {
    value: "createdDate",
    label: "Mới nhất",
  },
  {
    value: "totalOrders",
    label: "Bán chạy",
  },
  {
    value: "rating",
    label: "Yêu thích",
  },
  {
    value: "price",
    label: "Giá bán",
  },
];

export const booksAmount = [
  {
    value: 1,
    label: "Còn hàng",
  },
  {
    value: 0,
    label: "Tất cả",
  },
];

// Shops
export const sortShopsBy = [
  {
    value: "totalFollowers",
    label: "Nổi bật",
  },
  {
    value: "joinedDate",
    label: "Mới tham gia",
  },
  {
    value: "totalReviews",
    label: "Yêu thích",
  },
];

export const filterShopsBy = [
  {
    value: "ALL",
    label: "Tất cả",
  },
  {
    value: "FOLLOWED",
    label: "Đang theo dõi",
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
