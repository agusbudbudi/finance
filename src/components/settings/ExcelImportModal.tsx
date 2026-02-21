import React, { useState, useRef } from "react";
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ChevronRight,
  Info
} from "lucide-react";
import { Modal } from "../common/Modal";
import { ExcelImportService, ImportResult, SheetPreview } from "../../services/import/excelImportService";
import { ExcelTemplateService } from "../../services/export/excelTemplateService";
import { FileText } from "lucide-react";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess 
}) => {
  const [step, setStep] = useState<"upload" | "processing" | "preview" | "results">("upload");
  const [results, setResults] = useState<ImportResult | null>(null);
  const [previews, setPreviews] = useState<SheetPreview[] | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, any> | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Liquid Assets");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("processing");
    try {
      const { data, results: importResults, previews: importPreviews } = await ExcelImportService.parseExcel(file);
      setParsedData(data);
      setResults(importResults);
      setPreviews(importPreviews);
      if (importPreviews && importPreviews.length > 0) {
        setActiveTab(importPreviews[0].sheetName);
      }
      setStep("preview");
    } catch (err) {
      console.error("Import failed:", err);
      setError("Failed to process Excel file. Please ensure you are using the correct template.");
      setStep("upload");
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedData) return;
    setStep("processing");
    try {
      await ExcelImportService.importData(parsedData);
      setStep("results");
    } catch (err) {
      console.error("Save failed:", err);
      setError("Failed to save imported data.");
      setStep("upload");
    }
  };

  const reset = () => {
    setStep("upload");
    setResults(null);
    setPreviews(null);
    setParsedData(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderUpload = () => (
    <div className="space-y-6">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all cursor-pointer group"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">Click to upload Excel</p>
          <p className="text-sm text-gray-500 font-medium mt-1">or drag and drop .xlsx file here</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".xlsx, .xls"
          className="hidden"
        />
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => ExcelTemplateService.downloadTemplate()}
          className="w-full py-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <FileText className="w-4 h-4 text-primary-500" />
          Download Excel Template
        </button>

        <div className="bg-blue-50 dark:bg-blue-500/5 rounded-xl p-4 flex gap-3 border border-blue-100 dark:border-blue-900/30">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
            Make sure your Excel file follows the template structure for best results. Data with missing required fields will be skipped.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/5 rounded-xl p-4 flex gap-3 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="py-12 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <FileSpreadsheet className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900 dark:text-white">Processing Data...</p>
        <p className="text-sm text-gray-500 font-medium mt-1">Validating and mapping your financial records</p>
      </div>
    </div>
  );

  const renderPreview = () => {
    if (!previews || previews.length === 0) return null;

    const activeSheet = previews.find(p => p.sheetName === activeTab);

    return (
      <div className="space-y-4 flex flex-col h-[60vh]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Preview</h3>
            <p className="text-sm text-gray-500">Review your parsed data before importing. Only VALID rows will be saved.</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" /> Valid: {results?.totalSuccess || 0}
            </div>
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" /> Invalid: {results?.totalFailed || 0}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-800 gap-2 shrink-0 hide-scrollbar">
          {previews.map((sheet) => (
            <button
              key={sheet.sheetName}
              onClick={() => setActiveTab(sheet.sheetName)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === sheet.sheetName
                  ? "bg-primary-500 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {sheet.sheetName}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {sheet.rows.length}
              </span>
            </button>
          ))}
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 custom-scrollbar">
          {activeSheet && activeSheet.rows.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px] font-black z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 w-24">Status</th>
                  {Object.keys(activeSheet.rows[0].originalData).map((key) => (
                    <th key={key} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {activeSheet.rows.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!row.isValid ? "bg-red-50/30 dark:bg-red-900/10" : ""}`}>
                    <td className="px-4 py-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> VALID
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-black tracking-widest w-fit">
                            <AlertTriangle className="w-3 h-3" /> INVALID
                          </span>
                          {row.error && <span className="text-[10px] text-red-500 font-bold whitespace-normal max-w-[150px] leading-tight mt-1">{row.error}</span>}
                        </div>
                      )}
                    </td>
                    {Object.keys(activeSheet.rows[0].originalData).map((key) => (
                      <td key={key} className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                        {row.originalData[key] !== undefined && row.originalData[key] !== null 
                          ? String(row.originalData[key]) 
                          : <span className="text-gray-300 dark:text-gray-700">-</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-400 font-medium">
               No data found in this sheet.
             </div>
          )}
        </div>

        <div className="pt-4 flex gap-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button
            onClick={reset}
            className="flex-1 btn btn-secondary py-3"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            className="flex-1 btn btn-primary py-3 shadow-xl"
            disabled={results?.totalSuccess === 0}
          >
            Confirm Import ({results?.totalSuccess} rows)
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    const sections = [
      { label: "Liquid Assets", data: results.accounts },
      { label: "Credit Cards", data: results.creditCards },
      { label: "Income Streams", data: results.freelanceIncome },
      { label: "Expenses", data: results.expenses },
      { label: "Budget Strategy", data: results.monthlyBudgets },
      { label: "Automated Bills", data: results.recurring_tx },
    ];


    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            results.totalFailed === 0 ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
          }`}>
            {results.totalFailed === 0 ? <CheckCircle2 /> : <AlertTriangle />}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Import Status</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              {results.totalSuccess} Imported, {results.totalFailed} Skipped
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {sections.map((section) => (
            <div key={section.label} className="flex items-center justify-between p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-700 dark:text-gray-300">{section.label}</span>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{section.data.success}</span>
                </div>
                {section.data.failed > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{section.data.failed}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            onSuccess();
            onClose();
          }}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          Finish & Reload Page
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step !== "processing" ? onClose : () => {}}
      title="Import from Excel"
      maxW={step === "preview" ? "max-w-6xl" : "max-w-md"}
    >
      <div className="p-1">
        {step === "upload" && renderUpload()}
        {step === "processing" && renderProcessing()}
        {step === "preview" && renderPreview()}
        {step === "results" && renderResults()}
      </div>
    </Modal>
  );
};
