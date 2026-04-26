import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "lucide-react";
import { useSimpleModeConfig } from "../../hooks/useSimpleModeConfig";
import { useSimpleTransactionStore } from "../../stores/useSimpleTransactionStore";
import { format } from "date-fns";
import { useEffect } from "react";
import { Modal } from "../common/Modal";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  toBank: z.string().min(1, "Receiving bank is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub category is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddIncomeModal = ({ isOpen, onClose }: AddIncomeModalProps) => {
  const { config, isLoading } = useSimpleModeConfig();
  const { addTransaction } = useSimpleTransactionStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      amount: 0,
      description: "",
    },
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    setValue("subCategory", "");
  }, [selectedCategory, setValue]);

  const onSubmit = (data: FormData) => {
    addTransaction({
      id: crypto.randomUUID(),
      type: "income",
      date: data.date,
      fromBank: "Outside", // Default source
      toBank: data.toBank,
      amount: data.amount,
      category: data.category,
      subCategory: data.subCategory,
      description: data.description || "",
      fromCC: false,
      createdAt: new Date().toISOString(),
    });
    reset();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Record Income"
      maxW="md:max-w-lg"
      footer={
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-4 text-xs font-black uppercase tracking-widest">Cancel</button>
          <button 
            type="submit" 
            form="add-income-form"
            className="btn btn-primary flex-[2] bg-green-500 hover:bg-green-600 shadow-xl shadow-green-500/20 py-4 font-black"
          >
            Save Income
          </button>
        </div>
      }
    >
      <form id="add-income-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Date Received</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                {...register("date")}
                className="input pl-10"
              />
            </div>
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
          </div>

          {/* To Bank */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Deposit To Bank / Wallet</label>
            <select
              {...register("toBank")}
              className="input"
              disabled={isLoading}
            >
              <option value="">Select Destination Bank</option>
              {config?.banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
            </select>
            {errors.toBank && <p className="text-xs text-red-500 mt-1">{errors.toBank.message}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Amount (Rp)</label>
            <input
              type="number"
              {...register("amount", { valueAsNumber: true })}
              className="input font-black text-xl bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20 text-green-600 focus:border-green-500"
              placeholder="0"
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Income Category</label>
              <select {...register("category")} className="input" disabled={isLoading}>
                <option value="">Category</option>
                {config && Object.keys(config.incomeCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Details</label>
              <select {...register("subCategory")} className="input" disabled={!selectedCategory || isLoading}>
                <option value="">Select Detail</option>
                {config && selectedCategory && config.incomeCategories[selectedCategory]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subCategory && <p className="text-xs text-red-500 mt-1">{errors.subCategory.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea
              {...register("description")}
              className="input min-h-[100px] resize-none"
              placeholder="Where did this income come from?"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
