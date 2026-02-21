import { z } from "zod";

export const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => {
    const num = parseInt(val.replace(/\D/g, "") || "0");
    return !isNaN(num) && num > 0;
  }, {
    message: "Amount must be a positive number",
  }),



  category: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account/Card is required"),
  note: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
