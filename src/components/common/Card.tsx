import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  bodyClassName?: string;
  action?: ReactNode;
  variant?: "white" | "glass" | "blue";
}

export const Card = ({
  children,
  title,
  subtitle,
  className = "",
  bodyClassName = "px-6 py-6",
  action,
  variant = "white",
}: CardProps) => {
  const variantClasses = {
    white:
      "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-xl shadow-black/2",
    glass:
      "bg-white/10 dark:bg-black/20 backdrop-blur-lg border-white/20 text-white shadow-xl shadow-black/2",
    blue: "bg-primary-500 border-primary-400 text-white shadow-xl shadow-primary-500/20",
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${variantClasses[variant]} ${className}`}
    >
      {(title || subtitle || action) && (
        <div
          className={`px-6 py-5 flex justify-between items-center ${variant === "glass" ? "border-b border-white/10" : "border-b border-gray-50 dark:border-gray-800"}`}
        >
          <div>
            {title && (
              <h3
                className={`text-lg font-bold tracking-tight ${variant === "white" ? "text-gray-900 dark:text-white" : "text-white"}`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={`text-sm mt-0.5 ${variant === "white" ? "text-gray-500 dark:text-gray-400" : "text-white/70"}`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="z-10">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};
