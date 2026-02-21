import * as XLSX from "xlsx";
import { StorageService } from "../storage/storageService";

export class ExcelExportService {
  /**
   * Export all system data to Excel with multiple sheets
   */
  static exportAll() {
    const data = StorageService.exportAll();
    const workbook = XLSX.utils.book_new();

    // Mapping of storage keys to human-readable sheet names (matching User's requested names)
    const sheetMapping: Record<string, string> = {
      accounts: "Liquid Assets",
      creditCards: "Credit Cards",
      freelanceIncome: "Income Streams",
      expenses: "Expenses",
      monthlyBudgets: "Budget Strategy",
      recurring_tx: "Automated Bills",
      investments: "Investments",
      profile: "User Profile",
    };


    // Process each relevant storage key
    Object.entries(data).forEach(([key, value]) => {
      const sheetName = sheetMapping[key];
      if (!sheetName || !value) return;

      let sheetData: any[] = [];

      // Special handling for monthlyBudgets (Flatten allocations)
      if (key === "monthlyBudgets" && Array.isArray(value)) {
        sheetData = value.flatMap((budget: any) => 
          (budget.allocations || []).map((alloc: any) => ({
            Month: budget.month,
            Category: alloc.category,
            Name: alloc.name,
            Amount: alloc.amount,
            "Is Completed": alloc.isCompleted ? "Yes" : "No",
          }))
        );
      } else if (key === "investments" && value && typeof value === "object") {
        // Flatten investment contributions
        const inv = value as any;
        sheetData = (inv.contributions || []).map((c: any) => ({
          Date: c.date,
          Amount: c.amount,
          Type: c.type,
          Note: c.note || "",
          "Monthly Contribution": inv.monthlyContribution,
          "Annual Return": inv.estimatedAnnualReturn,
        }));
      } else if (Array.isArray(value)) {
        sheetData = value;

      } else if (typeof value === "object") {
        sheetData = [value];
      }

      if (sheetData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    });

    // Generate Excel file and trigger download
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `finance_export_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
