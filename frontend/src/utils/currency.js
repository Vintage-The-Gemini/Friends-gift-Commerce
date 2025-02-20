// src/utils/currency.js
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseCurrency = (value) => {
  // Remove currency symbol, commas and spaces
  const cleanValue = value.replace(/[^0-9.-]+/g, "");
  return parseFloat(cleanValue);
};

export const validateAmount = (amount) => {
  const value = parseCurrency(amount);
  return !isNaN(value) && value > 0;
};
