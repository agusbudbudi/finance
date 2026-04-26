import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "lucide-react";
import { useSimpleModeConfig } from "../../hooks/useSimpleModeConfig";
import { useSimpleTransactionStore } from "../../stores/useSimpleTransactionStore";
import { format } from "date-fns";
import { useEffect } from "react";
import { Modal } from "../common/Modal";
import { SimpleTransaction } from "../../types/simpleTransaction";

const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  fromBank: z.string().optional(),
  creditCardName: z.string().optional(),
  toBank: z.string().optional(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub category is required"),
  description: z.string().optional(),
  fromCC: z.boolean(),
});

const incomeSchema = z.object({
  date: z.string().min(1, "Date is required"),
  fromBank: z.string().optional(),
  creditCardName: z.string().optional(),
  toBank: z.string().min(1, "Receiving bank is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub category is required"),
  description: z.string().optional(),
  fromCC: z.boolean().default(false),
});

type FormData = z.infer<typeof expenseSchema> & z.infer<typeof incomeSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "expense" | "income";
  initialData?: SimpleTransaction | null;
}

export const TransactionModal = ({ isOpen, onClose, type, initialData }: TransactionModalProps) => {
  const { config, isLoading } = useSimpleModeConfig();
  const { addTransaction, updateTransaction } = useSimpleTransactionStore();

  const isIncome = type === "income";
  const schema = isIncome ? incomeSchema : expenseSchema;

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
      fromBank: "",
      creditCardName: "",
      toBank: "",
      category: "",
      subCategory: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          date: initialData.date,
          fromCC: initialData.fromCC || false,
          amount: initialData.amount,
          description: initialData.description || "",
          fromBank: initialData.fromBank || "",
          creditCardName: initialData.creditCardName || "",
          toBank: initialData.toBank || "",
          category: initialData.category || "",
          subCategory: initialData.subCategory || "",
        });
      } else {
        reset({
          date: format(new Date(), "yyyy-MM-dd"),
          fromCC: false,
          amount: 0,
          description: "",
          fromBank: "",
          creditCardName: "",
          toBank: "",
          category: "",
          subCategory: "",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const fromCC = watch("fromCC");
  const selectedCategory = watch("category");

  // Reset dependent fields when fromCC or category changes
  useEffect(() => {
    if (!isIncome) {
      if (fromCC) {
        setValue("fromBank", "");
      } else {
        setValue("creditCardName", "");
      }
    }
  }, [fromCC, setValue, isIncome]);

  useEffect(() => {
    setValue("subCategory", "");
  }, [selectedCategory, setValue]);

  const onSubmit = async (data: FormData) => {
    const txData = {
      type: type,
      date: data.date,
      fromBank: isIncome ? "Outside" : (data.fromCC ? "" : (data.fromBank || "")),
      creditCardName: (!isIncome && data.fromCC) ? data.creditCardName : "",
      toBank: data.toBank,
      amount: data.amount,
      category: data.category,
      subCategory: data.subCategory,
      description: data.description || "",
      fromCC: isIncome ? false : data.fromCC,
    };

    if (initialData) {
      await updateTransaction(initialData.id, txData);
    } else {
      await addTransaction({
        ...txData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
    }
    
    reset();
    onClose();
  };

  const accentColor = isIncome ? "green" : "amber";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? (isIncome ? "Edit Income" : "Edit Transaction") : (isIncome ? "Record Income" : "Add Transaction")}
      maxW="md:max-w-lg"
      footer={
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-4 text-xs font-black uppercase tracking-widest">Cancel</button>
          <button 
            type="submit" 
            form="transaction-form"
            className={`btn btn-primary flex-[2] bg-${accentColor}-500 hover:bg-${accentColor}-600 shadow-xl shadow-${accentColor}-500/20 py-4 font-black`}
          >
            {initialData ? "Update" : (isIncome ? "Save Income" : "Save Transaction")}
          </button>
        </div>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
              {isIncome ? "Date Received" : "Date"}
            </label>
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

          {!isIncome && (
            <>
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
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:bg-gray-300 peer-checked:bg-${accentColor}-500`}></div>
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
                {(errors.fromBank || errors.creditCardName) && <p className="text-xs text-red-500 mt-1">Source is required</p>}
              </div>
            </>
          )}

          {isIncome && (
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
          )}

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Amount (Rp)</label>
            <input
              type="number"
              {...register("amount", { valueAsNumber: true })}
              className={`input font-black text-xl bg-${accentColor}-50/50 dark:bg-${accentColor}-900/10 border-${accentColor}-100 dark:border-${accentColor}-900/20 text-${accentColor}-600 focus:border-${accentColor}-500`}
              placeholder="0"
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                {isIncome ? "Income Category" : "Category"}
              </label>
              <select {...register("category")} className="input" disabled={isLoading}>
                <option value="">Category</option>
                {config && Object.keys(isIncome ? config.incomeCategories : config.categories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                {isIncome ? "Details" : "Sub Category"}
              </label>
              <select {...register("subCategory")} className="input" disabled={!selectedCategory || isLoading}>
                <option value="">{isIncome ? "Select Detail" : "Sub Category"}</option>
                {config && selectedCategory && (isIncome ? config.incomeCategories : config.categories)[selectedCategory]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subCategory && <p className="text-xs text-red-500 mt-1">{errors.subCategory.message}</p>}
            </div>
          </div>

          {!isIncome && !fromCC && (
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
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
              {isIncome ? "Description (Optional)" : "Description"}
            </label>
            <textarea
              {...register("description")}
              className="input min-h-[100px] resize-none"
              placeholder={isIncome ? "Where did this income come from?" : "What was this for?"}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
