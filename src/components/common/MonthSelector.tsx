import React from "react";
import { Calendar } from "lucide-react";

interface MonthSelectorProps {
  value: string; // YYYY-MM
  onChange: (value: string) => void;
  className?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = Array.from({ length: 11 }, (_, i) => 2025 + i); // 2025 to 2035

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const [yearStr, monthStr] = value.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const handleYearChange = (newYear: number) => {
    onChange(`${newYear}-${monthStr}`);
  };

  const handleMonthChange = (newMonth: number) => {
    onChange(`${yearStr}-${newMonth.toString().padStart(2, "0")}`);
  };

  return (
    <div
      className={`flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md px-2 py-2 pr-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-lg shadow-black/5 ${className}`}
    >
      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
        <Calendar className="w-4 h-4 text-primary-500" />
      </div>
      <div className="flex items-center gap-2">
        <select
          value={month}
          onChange={(e) => handleMonthChange(parseInt(e.target.value))}
          className="bg-transparent text-gray-900 dark:text-white font-black text-sm outline-none cursor-pointer hover:text-primary-500 transition-colors appearance-none"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={i + 1} className="text-gray-900">
              {name}
            </option>
          ))}
        </select>
        <div className="w-px h-4 bg-gray-200 dark:bg-white/10"></div>
        <select
          value={year}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="bg-transparent text-gray-900 dark:text-white font-black text-sm outline-none cursor-pointer hover:text-primary-500 transition-colors appearance-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y} className="text-gray-900">
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
