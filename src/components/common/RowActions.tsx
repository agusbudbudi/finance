import React from "react";
import { Edit2, Trash2 } from "lucide-react";

interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editTitle?: string;
  deleteTitle?: string;
  className?: string;
}

/**
 * A reusable component for row action buttons (Edit and Delete).
 * Standardizes the look, feel, and behavior across all pages.
 */
export const RowActions: React.FC<RowActionsProps> = ({
  onEdit,
  onDelete,
  editTitle = "Edit",
  deleteTitle = "Remove",
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-1 transition-all ${className}`}>
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
          title={editTitle}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          title={deleteTitle}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
