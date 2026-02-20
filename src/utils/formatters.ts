/**
 * Format currency in IDR
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format currency without symbol
 */
export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (
  date: string | Date,
  format: "short" | "long" | "medium" = "medium",
): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } else if (format === "long") {
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } else {
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Get month name
 */
export const getMonthName = (monthStr: string): string => {
  const date = new Date(monthStr + "-01");
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

/**
 * Get current month string (YYYY-MM)
 */
export const getCurrentMonth = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 7);
};

/**
 * Parse month string to Date
 */
export const parseMonth = (monthStr: string): Date => {
  return new Date(monthStr + "-01");
};
