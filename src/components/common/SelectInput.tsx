import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectInputProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  className = "",
  wrapperClassName = "",
  children,
  ...props
}) => {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        className={`w-full appearance-none pr-10 ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/40" />
      </div>
    </div>
  );
};
