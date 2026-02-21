import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxW?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxW = "md:max-w-md" }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-950 w-full ${maxW} rounded-t-[2.5rem] md:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-top-4 md:zoom-in-95 duration-300 md:duration-200 border border-gray-100 dark:border-gray-800 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
        </div>

        <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-900 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div 
          className="p-6 max-h-[85vh] overflow-y-auto"
          style={{ 
            paddingBottom: "calc(3rem + env(safe-area-inset-bottom))" 
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

