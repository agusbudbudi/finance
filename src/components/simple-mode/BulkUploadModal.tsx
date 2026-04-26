import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useSimpleTransactionStore } from "../../stores/useSimpleTransactionStore";
import { SimpleTransaction } from "../../types/simpleTransaction";
import { format } from "date-fns";
import { Modal } from "../common/Modal";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<SimpleTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTransaction } = useSimpleTransactionStore();

  const downloadTemplate = () => {
    const headers = [
      [
        "Date",
        "From Bank / Wallet",
        "To Bank (Optional Transfer)",
        "Amount (Rp)",
        "Category",
        "Sub Category",
        "Description",
        "Paid using Credit Card (Yes/No)",
      ],
      [
        format(new Date(), "yyyy-MM-dd"),
        "BCA",
        "Not a Transfer",
        50000,
        "Food & Drink",
        "Dinner",
        "Sate Padang Pak Syukur",
        "No",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Simple_Mode_Transaction_Template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        // Skip header row if it exists (assuming row 1 is header)
        const rows = rawData.slice(1);

        const mappedData: SimpleTransaction[] = rows.map((row) => {
          const date = row[0]
            ? format(new Date(row[0]), "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd");
          const fromBank = row[1] ? String(row[1]).trim() : "";
          const toBankRaw = row[2] ? String(row[2]).trim() : "";
          const toBank =
            toBankRaw === "" || toBankRaw.toLowerCase() === "not a transfer"
              ? undefined
              : toBankRaw;
          const amount = row[3] ? Number(row[3]) : 0;
          const category = row[4] ? String(row[4]).trim() : "";
          const subCategory = row[5] ? String(row[5]).trim() : "";
          const description = row[6] ? String(row[6]).trim() : "";
          const paidUsingCC = row[7]
            ? String(row[7]).trim().toLowerCase() === "yes"
            : false;

          return {
            id: crypto.randomUUID(),
            type: "expense", // Defaulting to expense as per columns
            date,
            fromBank: paidUsingCC ? "" : fromBank,
            toBank,
            amount,
            category,
            subCategory,
            description,
            fromCC: paidUsingCC,
            creditCardName: paidUsingCC ? fromBank : undefined,
            createdAt: new Date().toISOString(),
          };
        });

        setData(mappedData.filter((d) => d.amount > 0 || d.description !== ""));
        setError(null);
      } catch (err) {
        console.error(err);
        setError(
          "Failed to parse Excel file. Please ensure it follows the correct format.",
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setIsProcessing(true);
    try {
      for (const tx of data) {
        await addTransaction(tx);
      }
      setData([]);
      onClose();
    } catch (err) {
      setError("An error occurred during import.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeRow = (id: string) => {
    setData(data.filter((d) => d.id !== id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Excel Upload"
      maxW="md:max-w-4xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary px-8 py-3 text-xs font-black uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            disabled={data.length === 0 || isProcessing}
            onClick={handleImport}
            className="btn btn-primary bg-green-500 hover:bg-green-600 shadow-xl shadow-green-500/20 px-10 py-3 font-black"
          >
            {isProcessing ? "Processing..." : "Confirm Import"}
            <CheckCircle2 className="ml-2 w-5 h-5" />
          </button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl hover:border-green-500/50 transition-colors group bg-gray-50/50 dark:bg-gray-900/50">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-4 group-hover:scale-105 transition-transform"
            >
              <div className="p-5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all shadow-xl shadow-green-500/10">
                <Upload className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  Click to Upload Excel
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Order: Date, From, To, Amount, Cat, Sub, Desc, CC
                </p>
              </div>
            </button>

            <button
              onClick={downloadTemplate}
              className="mt-8 flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs transition-all active:scale-95 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Excel Template
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 p-5 rounded-lg border border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-black uppercase tracking-tight">
                  {data.length} transactions ready to import.
                </p>
              </div>
              <button
                onClick={() => setData([])}
                className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-4 font-black uppercase text-gray-400 tracking-widest">
                      Date
                    </th>
                    <th className="px-4 py-4 font-black uppercase text-gray-400 tracking-widest">
                      From
                    </th>
                    <th className="px-4 py-4 font-black uppercase text-gray-400 tracking-widest">
                      To
                    </th>
                    <th className="px-4 py-4 font-black uppercase text-gray-400 tracking-widest">
                      Category
                    </th>
                    <th className="px-4 py-4 font-black uppercase text-gray-400 tracking-widest">
                      Sub-Cat
                    </th>
                    <th className="px-4 py-4 font-black uppercase text-gray-400 tracking-widest">
                      Desc
                    </th>
                    <th className="px-4 py-4 font-black uppercase text-gray-400 tracking-widest">
                      CC?
                    </th>
                    <th className="px-4 py-4 font-black uppercase text-gray-400 tracking-widest text-right">
                      Amount
                    </th>
                    <th className="px-4 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.map((tx) => (
                    <tr
                      key={tx.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-500">
                        {tx.date}
                      </td>
                      <td className="px-4 py-4 font-black text-gray-900 dark:text-white">
                        {tx.fromCC ? tx.creditCardName : tx.fromBank}
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-400">
                        {tx.toBank || "-"}
                      </td>
                      <td className="px-4 py-4 font-black text-amber-600 uppercase">
                        {tx.category}
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-400">
                        {tx.subCategory}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-500 truncate max-w-[150px]">
                        {tx.description}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-black text-[9px] ${tx.fromCC ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"}`}
                        >
                          {tx.fromCC ? "YES" : "NO"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-black text-gray-900 dark:text-white text-sm">
                        Rp{tx.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => removeRow(tx.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
