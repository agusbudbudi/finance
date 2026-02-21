import React, { useState, useEffect } from "react";

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string | number;
  onChange: (value: string) => void;
  // Optional prefix, defaults to empty or "Rp " if desired. Let's keep it simple for now as per design.
  prefix?: string; 
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className = "",
  prefix = "Rp ",
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Format a raw number string into a localized currency string
  const formatValue = (val: string | number) => {
    if (val === "" || val === null || val === undefined) return "";
    
    // Convert to string and strip non-digits
    const numericString = String(val).replace(/\D/g, "");
    
    if (!numericString) return "";

    // Format with dots for thousands separator (Indonesian locale)
    const formattedNumber = new Intl.NumberFormat("id-ID").format(
      Number(numericString)
    );
    
    return `${prefix}${formattedNumber}`;
  };

  // Sync internal display state when external value changes
  useEffect(() => {
    setDisplayValue(formatValue(value));
  }, [value, prefix]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Strip everything except digits to pass back to the parent
    const numericString = rawValue.replace(/\D/g, "");
    
    // Update local display immediately for snappy typing feel
    setDisplayValue(formatValue(numericString));
    
    // Pass the clean numeric string up to the parent form state
    onChange(numericString);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={`font-mono ${className}`} // Optional: mono font helps numbers align nicely
      {...props}
    />
  );
};
