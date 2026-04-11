// Books
export const PRICE_MARKS: { value: number; label: string }[] = [
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

export const SUGGEST_PRICES: { value: [number, number]; label: string }[] = [
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
    label: "700.000 ₫+",
  },
];

export const MAX_PRICE = 10000000;
