import * as XLSX from "xlsx";
import { StorageService } from "../storage/storageService";
import { Account } from "../../types/account";
import { CreditCard } from "../../types/creditCard";
import { FreelanceIncome } from "../../types/freelance";
import { Expense } from "../../types/expense";

export interface ImportResult {
  accounts: { success: number; failed: number };
  creditCards: { success: number; failed: number };
  freelanceIncome: { success: number; failed: number };
  expenses: { success: number; failed: number };
  monthlyBudgets: { success: number; failed: number };
  recurring_tx: { success: number; failed: number };
  totalSuccess: number;
  totalFailed: number;
}

export interface PreviewRow {
  isValid: boolean;
  error?: string;
  originalData: any;
  parsedData?: any;
}

export interface SheetPreview {
  sheetName: string;
  rows: PreviewRow[];
}

export class ExcelImportService {
  /**
   * Parses an Excel file and returns the data mapped to storage keys with validation results
   */
  static async parseExcel(file: File): Promise<{ data: Record<string, any>; results: ImportResult; previews: SheetPreview[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataBuffer = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(dataBuffer, { 
            type: "array",
            cellDates: false, // Keep serial numbers to avoid timezone shifts
            cellNF: false,
            cellText: false 
          });
          const data: Record<string, any> = {};
          const results: ImportResult = {
            accounts: { success: 0, failed: 0 },
            creditCards: { success: 0, failed: 0 },
            freelanceIncome: { success: 0, failed: 0 },
            expenses: { success: 0, failed: 0 },
            monthlyBudgets: { success: 0, failed: 0 },
            recurring_tx: { success: 0, failed: 0 },
            totalSuccess: 0,
            totalFailed: 0,
          };
          const previews: SheetPreview[] = [];
          
          // Helper to ensure we always store dates as YYYY-MM-DD
          const ensureDateString = (val: any): string => {
            if (!val) {
              const now = new Date();
              const y = now.getFullYear();
              const m = String(now.getMonth() + 1).padStart(2, "0");
              const d = String(now.getDate()).padStart(2, "0");
              return `${y}-${m}-${d}`;
            }
            
            // 1. If it's already a YYYY-MM-DD string, PRESERVE it to avoid rollover (e.g. Feb 29)
            if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
              return val;
            }

            // 2. Handle Excel Serial Numbers (timezone agnostic)
            if (typeof val === "number") {
              // Convert serial to UTC date to extract components without local shift
              const ms = Math.round((val - 25569) * 86400000);
              const d = new Date(ms);
              if (!isNaN(d.getTime())) {
                const y = d.getUTCFullYear();
                const m = String(d.getUTCMonth() + 1).padStart(2, "0");
                const day = String(d.getUTCDate()).padStart(2, "0");
                return `${y}-${m}-${day}`;
              }
            }

            // 3. Last resort fallback
            const d = new Date(val);
            if (isNaN(d.getTime())) {
              const now = new Date();
              return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            }

            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          };

          // Helper to ensure month strings (YYYY-MM)
          const ensureMonthString = (val: any): string => {
            return ensureDateString(val).substring(0, 7);
          };

          // 1. Process Liquid Assets
          if (workbook.Sheets["Liquid Assets"]) {
            const raw = XLSX.utils.sheet_to_json(workbook.Sheets["Liquid Assets"]);
            const sheetPreview: SheetPreview = { sheetName: "Liquid Assets", rows: [] };
            
            // Find the last row with "Is Salary Account" === "Yes"
            let lastSalaryIndex = -1;
            raw.forEach((item: any, index: number) => {
              if (item["Is Salary Account"] === "Yes") {
                lastSalaryIndex = index;
              }
            });

            data.accounts = raw.map((item: any, index: number) => {
              const name = item["Account Name"] || item.Name; // Fallback to old Name
              const bank = item["Bank / Provider"] || item.Bank;
              const balance = Number(item["Current Balance"] || item.Balance) || 0;

              if (!name || !bank) {
                results.accounts.failed++;
                sheetPreview.rows.push({
                  isValid: false,
                  error: "Missing required fields: Name or Bank",
                  originalData: item
                });
                return null;
              }
              results.accounts.success++;
              
              const parsed = {
                id: crypto.randomUUID(),
                name,
                bank,
                type: item.Type || "savings",
                purpose: item.Purpose || "daily_spending",
                balance,
                isActive: true,
                isSalaryAccount: index === lastSalaryIndex,
              };
              
              sheetPreview.rows.push({
                isValid: true,
                originalData: item,
                parsedData: parsed
              });
              
              return parsed;
            }).filter(Boolean);
            previews.push(sheetPreview);
          }


          // 2. Process Credit Cards
          if (workbook.Sheets["Credit Cards"]) {
            const raw = XLSX.utils.sheet_to_json(workbook.Sheets["Credit Cards"]);
            const sheetPreview: SheetPreview = { sheetName: "Credit Cards", rows: [] };
            
            data.creditCards = raw.map((item: any) => {
              if (!item.Bank || !item["Card Name"]) {
                results.creditCards.failed++;
                sheetPreview.rows.push({
                  isValid: false,
                  error: "Missing required fields: Bank or Card Name",
                  originalData: item
                });
                return null;
              }
              results.creditCards.success++;
              const parsed = {
                id: crypto.randomUUID(),
                bank: item.Bank,
                cardName: item["Card Name"],
                lastFourDigits: String(item["Last 4 Digits"]),
                creditLimit: Number(item["Credit Limit"]) || 0,
                billingCycle: {
                  statementDate: Number(item["Statement Date (1-31)"]) || 1,
                  dueDate: Number(item["Due Date (1-31)"]) || 1,
                },
                statements: [],
                currentMonth: {
                  spent: 0,
                  availableCredit: Number(item["Credit Limit"]) || 0,
                  utilizationRate: 0,
                  transactions: [],
                },
              };
              
              sheetPreview.rows.push({
                isValid: true,
                originalData: item,
                parsedData: parsed
              });
              
              return parsed;
            }).filter(Boolean);
            previews.push(sheetPreview);
          }

          // 3. Process Income Streams
          if (workbook.Sheets["Income Streams"]) {
            const raw = XLSX.utils.sheet_to_json(workbook.Sheets["Income Streams"]);
            const sheetPreview: SheetPreview = { sheetName: "Income Streams", rows: [] };
            
            data.freelanceIncome = raw.map((item: any) => {
              if (!item.Date || !item.Amount) {
                results.freelanceIncome.failed++;
                sheetPreview.rows.push({
                  isValid: false,
                  error: "Missing required fields: Date or Amount",
                  originalData: item
                });
                return null;
              }
              results.freelanceIncome.success++;
              const dateStr = ensureDateString(item.Date);
              const parsed = {
                id: crypto.randomUUID(),
                date: dateStr,
                category: item.Category || "Freelance",
                client: item["Source Name"],
                project: item["Note / Project"],
                amount: Number(item.Amount) || 0,
                receivedAt: dateStr,
                toAccount: "acc_004", // Default to BRI Freelance if possible
                allocations: [],
                status: "pending" as const,
              };
              
              sheetPreview.rows.push({
                isValid: true,
                originalData: item,
                parsedData: parsed
              });
              
              return parsed;
            }).filter(Boolean);
            previews.push(sheetPreview);
          }

          // 4. Process Expenses
          if (workbook.Sheets["Expenses"]) {
            const raw = XLSX.utils.sheet_to_json(workbook.Sheets["Expenses"]);
            const sheetPreview: SheetPreview = { sheetName: "Expenses", rows: [] };
            
            data.expenses = raw.map((item: any) => {
              if (!item.Date || !item.Amount) {
                results.expenses.failed++;
                sheetPreview.rows.push({
                  isValid: false,
                  error: "Missing required fields: Date or Amount",
                  originalData: item
                });
                return null;
              }
              results.expenses.success++;
              
              // Find salary account ID for default assignment
              let salaryAccId = "";
              if (data.accounts) {
                const salaryAcc = data.accounts.find((a: any) => a.isSalaryAccount);
                if (salaryAcc) salaryAccId = salaryAcc.id;
              }

              const parsed = {
                id: crypto.randomUUID(),
                date: ensureDateString(item.Date),
                amount: Number(item.Amount) || 0,
                category: item.Category || "Other",
                accountId: salaryAccId || "unknown",
                accountType: "bank",
                note: item.Note || "",
                type: "manual",
                createdAt: new Date().toISOString(),
              };
              
              sheetPreview.rows.push({
                isValid: true,
                originalData: item,
                parsedData: parsed
              });
              
              return parsed;
            }).filter(Boolean);
            previews.push(sheetPreview);
          }

          // 5. Process Budget Strategy (Allocations)
          if (workbook.Sheets["Budget Strategy"]) {
            const raw = XLSX.utils.sheet_to_json(workbook.Sheets["Budget Strategy"]);
            const budgetsByMonth: Record<string, any[]> = {};
            const sheetPreview: SheetPreview = { sheetName: "Budget Strategy", rows: [] };
            
            raw.forEach((item: any) => {
              if (!item.Name || !item.Amount) {
                results.monthlyBudgets.failed++;
                sheetPreview.rows.push({
                  isValid: false,
                  error: "Missing required fields: Name or Amount",
                  originalData: item
                });
                return;
              }
              results.monthlyBudgets.success++;
              const month = ensureMonthString(item.Month);
              if (!budgetsByMonth[month]) budgetsByMonth[month] = [];
              
              const parsedItem = {
                id: crypto.randomUUID(),
                category: item.Category || "savings",
                name: item.Name || "Untitled",
                amount: Number(item.Amount) || 0,
                isCompleted: item["Is Completed"] === "Yes",
                completedAt: item["Is Completed"] === "Yes" ? new Date().toISOString() : null,
              };
              
              budgetsByMonth[month].push(parsedItem);
              
              sheetPreview.rows.push({
                isValid: true,
                originalData: item,
                parsedData: { month, ...parsedItem }
              });
            });

            const profile = StorageService.get<any>("profile");
            const salary = profile?.monthlySalary || 0;

            data.monthlyBudgets = Object.entries(budgetsByMonth).map(([month, allocations]) => {
              const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
              return {
                id: `budget_${month.replace("-", "_")}`,
                month,
                income: { salary, freelance: 0, other: 0, total: salary },
                allocations,
                expenses: {
                  food: { budget: 3000000, spent: 0 },
                  transport: { budget: 1000000, spent: 0 },
                  utilities: { budget: 1000000, spent: 0 },
                  shopping: { budget: 1000000, spent: 0 },
                  entertainment: { budget: 500000, spent: 0 },
                  health: { budget: 0, spent: 0 },
                  investment: { budget: 0, spent: 0 },
                  other: { budget: 500000, spent: 0 },
                },
                summary: { totalIncome: salary, totalAllocated, totalSpent: 0, remaining: salary - totalAllocated, savingsRate: 0 }
              };
            });
            previews.push(sheetPreview);
          }

          // 6. Process Automated Bills (Recurring)
          if (workbook.Sheets["Automated Bills"]) {
            const raw = XLSX.utils.sheet_to_json(workbook.Sheets["Automated Bills"]);
            const sheetPreview: SheetPreview = { sheetName: "Automated Bills", rows: [] };
            
            data.recurring_tx = raw.map((item: any) => {
              if (!item.Name || !item.Amount) {
                results.recurring_tx.failed++;
                sheetPreview.rows.push({
                  isValid: false,
                  error: "Missing required fields: Name or Amount",
                  originalData: item
                });
                return null;
              }
              results.recurring_tx.success++;
              
              const parsed = {
                id: crypto.randomUUID(),
                name: item.Name,
                category: item.Category || "Other",
                amount: Number(item.Amount) || 0,
                accountId: "", // Force user to select manually
                accountType: "bank",
                dueDay: Number(item["Due Day (1-31)"]) || 1,
                month: ensureMonthString(item.Month),
                isActive: true, // Required for Estimated Monthly Fix calculation
                frequency: "monthly" as const, // Required for Estimated Monthly Fix calculation
              };
              
              sheetPreview.rows.push({
                isValid: true,
                originalData: item,
                parsedData: parsed
              });
              
              return parsed;
            }).filter(Boolean);
            previews.push(sheetPreview);
          }

          results.totalSuccess = results.accounts.success + results.creditCards.success + results.freelanceIncome.success + results.expenses.success + results.monthlyBudgets.success + results.recurring_tx.success;
          results.totalFailed = results.accounts.failed + results.creditCards.failed + results.freelanceIncome.failed + results.expenses.failed + results.monthlyBudgets.failed + results.recurring_tx.failed;

          resolve({ data, results, previews });

        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Imports the parsed data into the system
   */
  static async importData(data: Record<string, any>) {
    for (const [key, value] of Object.entries(data)) {
      if (value) {
        await StorageService.set(key, value);
      }
    }
  }
}

