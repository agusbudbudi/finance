import { useState, useEffect } from "react";
import { useProfileStore } from "../../stores/useProfileStore";
import { useBudgetStore } from "../../stores/useBudgetStore";
import { Modal } from "../common/Modal";
import { CurrencyInput } from "../common/CurrencyInput";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { profile, updateProfile } = useProfileStore();
  const { currentBudget, updateBudget, getBudgetByMonth } = useBudgetStore();

  const [formData, setFormData] = useState({
    name: "",
    monthlySalary: "",
    salaryDay: "1",
  });

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: profile?.name || "",
        monthlySalary: profile?.monthlySalary?.toString() || "",
        salaryDay: profile?.salaryDay?.toString() || "1",
      });
    }
  }, [isOpen, profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const salaryNum = parseInt(formData.monthlySalary.replace(/\D/g, "")) || 0;
    const dayNum = parseInt(formData.salaryDay) || 1;

    updateProfile({
      name: formData.name,
      monthlySalary: salaryNum,
      salaryDay: Math.min(Math.max(dayNum, 1), 31), // clamp between 1-31
    });

    // Also update the current budget's salary if it exists
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const targetBudget = currentBudget || getBudgetByMonth(currentMonthStr);
    
    if (targetBudget) {
      updateBudget(targetBudget.id, {
        income: {
          ...targetBudget.income,
          salary: salaryNum,
          total: salaryNum + targetBudget.income.freelance + targetBudget.income.other,
        }
      });
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Core Profile">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
            Display Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
            placeholder="e.g. John Doe"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
            Monthly Salary
          </label>
          <CurrencyInput
            required
            value={formData.monthlySalary}
            onChange={(val) => setFormData({ ...formData, monthlySalary: val })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all font-sans"
            placeholder="Rp 0"
          />
          <p className="text-[10px] font-bold text-gray-400 mt-2 px-1">
            Changing this will instantly update your Dashboard's Runway Estimate.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
            Salary / Payday Date
          </label>
          <input
            type="number"
            min="1"
            max="31"
            required
            value={formData.salaryDay}
            onChange={(e) => setFormData({ ...formData, salaryDay: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
            placeholder="e.g. 25"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="flex-1 btn btn-primary">
            Save Profile
          </button>
        </div>
      </form>
    </Modal>
  );
};
