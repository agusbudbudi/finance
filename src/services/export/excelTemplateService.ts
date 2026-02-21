import * as XLSX from "xlsx";

export class ExcelTemplateService {
  /**
   * Generates and downloads a pre-filled Excel template
   */
  static downloadTemplate() {
    const workbook = XLSX.utils.book_new();
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const today = `${y}-${m}-${d}`; // YYYY-MM-DD
    const currentMonth = `${y}-${m}`; // YYYY-MM

    // Sheet 1: Liquid Assets (Bank Accounts)
    const liquidAssetsData = [
      {
        "Account Name": "Tabungan Utama (Gaji)",
        "Bank / Provider": "BCA",
        Type: "savings",
        Purpose: "salary_savings",
        "Current Balance": 5000000,
        "Is Salary Account": "Yes",
      },
      {
        "Account Name": "Dana Darurat",
        "Bank / Provider": "BTPN Jenius",
        Type: "savings",
        Purpose: "emergency_fund",
        "Current Balance": 15000000,
        "Is Salary Account": "No",
      },
      {
        "Account Name": "Wallet Utama",
        "Bank / Provider": "GoPay",
        Type: "ewallet",
        Purpose: "daily_spending",
        "Current Balance": 1000000,
        "Is Salary Account": "No",
      },
      {
        "Account Name": "Deposito Jangka Panjang",
        "Bank / Provider": "Bank Mandiri",
        Type: "deposit",
        Purpose: "investment",
        "Current Balance": 50000000,
        "Is Salary Account": "No",
      },
      {
        "Account Name": "Rekening Bisnis",
        "Bank / Provider": "BRI",
        Type: "checking",
        Purpose: "freelance",
        "Current Balance": 10000000,
        "Is Salary Account": "No",
      },
      {
        "Account Name": "Alokasi Keluarga",
        "Bank / Provider": "BCA",
        Type: "savings",
        Purpose: "family_allocation",
        "Current Balance": 2000000,
        "Is Salary Account": "No",
      },
      {
        "Account Name": "Investasi Saham",
        "Bank / Provider": "Stockbit",
        Type: "investment",
        Purpose: "investment",
        "Current Balance": 25000000,
        "Is Salary Account": "No",
      },
    ];
    const wsLiquid = XLSX.utils.json_to_sheet(liquidAssetsData);
    XLSX.utils.book_append_sheet(workbook, wsLiquid, "Liquid Assets");


    // Sheet 2: Credit Cards
    const creditCardsData = [
      {
        Bank: "BCA",
        "Card Name": "Everyday Card",
        "Last 4 Digits": "1234",
        "Credit Limit": 10000000,
        "Statement Date (1-31)": 15,
        "Due Date (1-31)": 5,
      },
    ];
    const wsCredit = XLSX.utils.json_to_sheet(creditCardsData);
    XLSX.utils.book_append_sheet(workbook, wsCredit, "Credit Cards");

    // Sheet 3: Income Streams
    const incomeStreamsData = [

      {
        Date: today,
        Category: "Freelance",
        "Source Name": "Acme Corp",
        "Note / Project": "Website Redesign",
        Amount: 7500000,
      },
      {
        Date: today,
        Category: "Bonus",
        "Source Name": "Office",
        "Note / Project": "Performance Bonus",
        Amount: 5000000,
      },
    ];
    const wsIncome = XLSX.utils.json_to_sheet(incomeStreamsData);
    XLSX.utils.book_append_sheet(workbook, wsIncome, "Income Streams");

    // Sheet 4: Expenses
    const expensesData = [
      {
        Date: today,
        Amount: 50000,
        Category: "Food & Drink",
        Note: "Lunch at Menteng",
      },
    ];
    const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, wsExpenses, "Expenses");

    // Sheet 5: Budget Strategy (Allocations)
    const budgetData = [
      {
        Month: currentMonth,
        Category: "family_support",
        Name: "Orang Tua",
        Amount: 2000000,
        "Is Completed": "No",
      },
      {
        Month: currentMonth,
        Category: "daily_spending",
        Name: "Jajan & Makan",
        Amount: 3000000,
        "Is Completed": "No",
      },
      {
        Month: currentMonth,
        Category: "savings",
        Name: "Tabungan Nikah",
        Amount: 2000000,
        "Is Completed": "No",
      },
      {
        Month: currentMonth,
        Category: "investment",
        Name: "Reksadana Saham",
        Amount: 1000000,
        "Is Completed": "Yes",
      },
      {
        Month: currentMonth,
        Category: "emergency_fund",
        Name: "Dana Darurat",
        Amount: 1000000,
        "Is Completed": "No",
      },
      {
        Month: currentMonth,
        Category: "ovo_topup",
        Name: "Topup OVO Utama",
        Amount: 500000,
        "Is Completed": "No",
      },
      {
        Month: currentMonth,
        Category: "credit_card_buffer",
        Name: "Buffer BCA",
        Amount: 500000,
        "Is Completed": "No",
      },
      {
        Month: currentMonth,
        Category: "deposito",
        Name: "Deposito Mandiri",
        Amount: 5000000,
        "Is Completed": "No",
      },
      {
        Month: currentMonth,
        Category: "lifestyle_buffer",
        Name: "Self Reward",
        Amount: 500000,
        "Is Completed": "No",
      },
      {
        Month: currentMonth,
        Category: "other",
        Name: "Lain-lain",
        Amount: 200000,
        "Is Completed": "No",
      },
    ];
    const wsBudget = XLSX.utils.json_to_sheet(budgetData);
    XLSX.utils.book_append_sheet(workbook, wsBudget, "Budget Strategy");

    // Sheet 6: Automated Bills (Recurring)
    const recurringData = [
      {
        Name: "Netflix",
        Category: "Entertainment",
        Amount: 186000,
        "Due Day (1-31)": 10,
        Month: currentMonth,
      },
      {
        Name: "Listrik",
        Category: "Utilities",
        Amount: 500000,
        "Due Day (1-31)": 20,
        Month: currentMonth,
      },
    ];
    const wsRecurring = XLSX.utils.json_to_sheet(recurringData);
    XLSX.utils.book_append_sheet(workbook, wsRecurring, "Automated Bills");



    // Generate and Download


    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `finance_template_example.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
