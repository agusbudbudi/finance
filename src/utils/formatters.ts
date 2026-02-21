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
  date: string | Date | number | null | undefined,
  format: "short" | "long" | "medium" = "medium",
): string => {
  if (!date) return "N/A";

  let d: Date;
  
  if (typeof date === "number") {
    // Handle Excel Serial Date (e.g. 45352) vs Unix Timestamp
    if (date > 100000) { // Likely Unix Timestamp
      d = new Date(date);
    } else {
      // Excel serial date (approximate conversion)
      // Excel starts from 1900-01-01
      d = new Date((date - 25569) * 86400 * 1000);
    }
  } else if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const yr = parseInt(match[1]);
      const mo = parseInt(match[2]) - 1;
      const dy = parseInt(match[3]);
      d = new Date(yr, mo, dy);
      
      // PREVENT ROLLOVER: If JS rolled over (e.g. Feb 29 -> March 1), 
      // the components won't match the input. 
      // Instead of returning raw string, format it consistently.
      if (d.getFullYear() !== yr || d.getMonth() !== mo || d.getDate() !== dy) {
        const dd = String(dy).padStart(2, "0");
        const mm = String(mo + 1).padStart(2, "0");
        const yy = String(yr);

        if (format === "short") {
          return `${dd}/${mm}/${yy}`;
        } else if (format === "long") {
          // Manual fallback for month name since it's an "invalid" date
          const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
          ];
          return `${dy} ${months[mo]} ${yr}`;
        } else {
          const months = [
            "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
            "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
          ];
          return `${dy} ${months[mo]} ${yr}`;
        }
      }
    } else {
      d = new Date(date);
    }
    // If invalid string, return the string itself as fallback
    if (isNaN(d.getTime())) return date;
  } else {
    d = date;
  }

  // Final safety check
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return String(date || "Invalid Date");
  }

  try {
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
  } catch (e) {
    return String(date);
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
