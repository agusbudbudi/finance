import { z } from "zod";

export const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "Amount must be a positive number",
    }),
  category: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account/Card is required"),
  note: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
