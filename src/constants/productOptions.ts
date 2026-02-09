export const PRODUCT_CATEGORIES = [
  "SAREE",
  "LEHENGA",
  "SUITS",
  "KURTI",
  "DUPATTA"
] as const;

export const PRODUCT_TAGS = [
  "Most Loved",
  "Banarsi Saree",
  "Ghatchola Saree",
  "Georgette",
  "Dola Silk Lehenga",
  "Kota Doirya Lehenga",
  "Art Silk Lehenga"
] as const;

export const PRODUCT_COLORS = [
  "Multicolor",
  "Black",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "White",
  "Grey",
  "Brown"
] as const;

export const PRODUCT_SIZES = [
  "XS", // Added XS as it is common, even if not in user list initially, or should I stick strictly? User list: S, M, L, XL, XXL, FREE-SIZE, XXXL
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "FREE-SIZE"
] as const;
