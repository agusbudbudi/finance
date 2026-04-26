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
  fromBank: z.string().optional(),
  creditCardName: z.string().optional(),
  toBank: z.string().optional(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub category is required"),
  description: z.string().optional(),
  fromCC: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal = ({ isOpen, onClose }: AddTransactionModalProps) => {
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
      fromCC: false,
      amount: 0,
      description: "",
    },
  });

  const fromCC = watch("fromCC");
  const selectedCategory = watch("category");

  // Reset dependent fields when fromCC or category changes
  useEffect(() => {
    if (fromCC) {
      setValue("fromBank", "");
    } else {
      setValue("creditCardName", "");
    }
  }, [fromCC, setValue]);

  useEffect(() => {
    setValue("subCategory", "");
  }, [selectedCategory, setValue]);

  const onSubmit = (data: FormData) => {
    addTransaction({
      id: crypto.randomUUID(),
      type: "expense",
      date: data.date,
      fromBank: data.fromCC ? "" : (data.fromBank || ""),
      creditCardName: data.fromCC ? data.creditCardName : "",
      toBank: data.toBank,
      amount: data.amount,
      category: data.category,
      subCategory: data.subCategory,
      description: data.description || "",
      fromCC: data.fromCC,
      createdAt: new Date().toISOString(),
    });
    reset();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add Transaction"
      maxW="md:max-w-lg"
      footer={
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-4 text-xs font-black uppercase tracking-widest">Cancel</button>
          <button 
            type="submit" 
            form="add-transaction-form"
            className="btn btn-primary flex-[2] bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/20 py-4 font-black"
          >
            Save Transaction
          </button>
        </div>
      }
    >
      <form id="add-transaction-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
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

          {/* From CC Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Paid using Credit Card?</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase">Switch between Bank Account or CC</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                {...register("fromCC")} 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:bg-gray-300 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* From Bank / CC */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
              {fromCC ? "Select Credit Card" : "From Bank / Wallet"}
            </label>
            <select
              {...register(fromCC ? "creditCardName" : "fromBank")}
              className="input"
              disabled={isLoading}
            >
              <option value="">Select {fromCC ? "Credit Card" : "Source"}</option>
              {fromCC 
                ? config?.creditCards.map(cc => <option key={cc} value={cc}>{cc}</option>)
                : config?.banks.map(bank => <option key={bank} value={bank}>{bank}</option>)
              }
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Amount (Rp)</label>
            <input
              type="number"
              {...register("amount", { valueAsNumber: true })}
              className="input font-black text-xl bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20 text-amber-600 focus:border-amber-500"
              placeholder="0"
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <select {...register("category")} className="input" disabled={isLoading}>
                <option value="">Category</option>
                {config && Object.keys(config.categories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Sub Category</label>
              <select {...register("subCategory")} className="input" disabled={!selectedCategory || isLoading}>
                <option value="">Sub Category</option>
                {config && selectedCategory && config.categories[selectedCategory]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subCategory && <p className="text-xs text-red-500 mt-1">{errors.subCategory.message}</p>}
            </div>
          </div>

          {/* To Bank (Optional Transfer) */}
          {!fromCC && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">To Bank (Optional Transfer)</label>
              <select {...register("toBank")} className="input" disabled={isLoading}>
                <option value="">Not a Transfer</option>
                {config?.banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              {...register("description")}
              className="input min-h-[100px] resize-none"
              placeholder="What was this for?"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
