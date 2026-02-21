import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "../components/common/Card";
import { StorageService } from "../services/storage/storageService";
import {
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  Database,
  AlertTriangle,
  FileJson,
  CheckCircle2,
  RefreshCcw,
  Settings,
  Cloud,
  Lock,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import { ExcelExportService } from "../services/export/excelExportService";
import { ExcelImportService } from "../services/import/excelImportService";
import { ExcelImportModal } from "../components/settings/ExcelImportModal";



export const SettingsPage = () => {
  const location = useLocation();
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(
    location.state?.openExcelImport || false
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (location.state?.openExcelImport) {
      setIsExcelImportOpen(true);
      // Clear the state so it doesn't reopen on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const data = StorageService.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `finance_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (typeof data !== "object" || data === null) {
          throw new Error("Invalid backup format");
        }

        const success = StorageService.importAll(data);
        if (success) {
          setImportStatus("success");
          setTimeout(() => window.location.reload(), 1500); // Reload to apply data
        } else {
          throw new Error("Failed to import data into storage");
        }
      } catch (error) {
        setImportStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Invalid JSON file",
        );
        setTimeout(() => setImportStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);
  };


  const handleClearData = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL data? This action cannot be undone unless you have a backup.",
      )
    ) {
      await StorageService.clearAll();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-4xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            System Settings
          </h1>
        </div>
        <p className="text-gray-500 font-medium">
          Manage your local data, security, and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Persistence Section */}
        <Card
          title="Data Portability"
          subtitle="Backup and restore your local storage data."
          className="md:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="flex flex-col h-full p-6 sm:p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 group hover:border-primary-200 dark:hover:border-primary-900/50 transition-colors relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all"></div>
              
              <div className="space-y-4 relative z-10 mb-8">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/40 flex items-center justify-center text-primary-500 shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    Export Data
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                    Download all your financial data as a JSON file for safe keeping or manual migration.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-auto relative z-10">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-500/20"
                >
                  {isExporting ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isExporting ? "Generating..." : "Download JSON Backup"}
                </button>

                {/*
                <button
                  onClick={() => ExcelExportService.exportAll()}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel Export (.xlsx)
                </button>
                */}
              </div>
            </div>

            <div className={`flex flex-col h-full p-6 sm:p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border transition-colors relative overflow-hidden group ${
              importStatus === "success"
                ? "border-green-200 dark:border-green-900/50"
                : importStatus === "error"
                  ? "border-red-200 dark:border-red-900/50"
                  : "border-gray-100 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-900/50"
            }`}>
              <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl group-hover:scale-150 transition-all ${
                 importStatus === "success" ? "bg-green-500/10" : importStatus === "error" ? "bg-red-500/10" : "bg-purple-500/10"
              }`}></div>
              
              <div className="space-y-4 relative z-10 mb-8">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-110 ${
                    importStatus === "success"
                      ? "bg-white dark:bg-black/40 text-green-500 border-green-100 dark:border-white/10"
                      : importStatus === "error"
                        ? "bg-white dark:bg-black/40 text-red-500 border-red-100 dark:border-white/10"
                        : "bg-white dark:bg-black/40 text-purple-500 border-gray-100 dark:border-white/10"
                  }`}
                >
                  {importStatus === "success" ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : importStatus === "error" ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    Import Data
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                    Restore system via JSON backup or bulk Import from Excel.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-auto relative z-10">
                <label className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer ${
                    importStatus === "success"
                      ? "bg-green-500 hover:bg-green-600 shadow-green-500/20"
                      : importStatus === "error"
                        ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                        : "bg-purple-500 hover:bg-purple-600 shadow-purple-500/20"
                }`}>
                  <FileJson className="w-4 h-4" />
                  {importStatus === "success" ? "Restored!" : importStatus === "error" ? "Failed" : "Import JSON"}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>

                {/*
                <label 
                  onClick={() => setIsExcelImportOpen(true)}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Import from Excel
                </label>
                */}
              </div>

              {importStatus === "error" && (
                <p className="text-xs text-red-500 font-bold text-center mt-3 relative z-10">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          <ExcelImportModal 
            isOpen={isExcelImportOpen}
            onClose={() => setIsExcelImportOpen(false)}
            onSuccess={() => window.location.reload()}
          />
        </Card>

        {/* Security & System Section */}
        <Card title="System Integrity" variant="white">
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group hover:border-primary-200 dark:hover:border-primary-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/40 flex items-center justify-center text-primary-500 shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Offline Isolation
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50 font-medium">
                    All data stays on this device
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-widest">
                  Enabled
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/40 flex items-center justify-center text-blue-500 shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Storage Engine
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50 font-medium">
                    Persistent Browser Cache
                  </p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">
                  Active
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/40 flex items-center justify-center text-emerald-500 shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Cloud Provider
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50 font-medium">
                    Supabase Infrastructure
                  </p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">
                  Synced
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group hover:border-purple-200 dark:hover:border-purple-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/40 flex items-center justify-center text-purple-500 shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Secret Management
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50 font-medium">
                    Secure Vault System
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-widest">
                  Secured
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone Section */}
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-red-900 dark:text-red-100 tracking-tight">
              Danger Zone
            </h2>
          </div>
          <p className="text-sm text-red-700/80 dark:text-red-300/80 font-medium leading-relaxed">
            Permanently delete all financial records, account information, and
            configuration settings from this browser. This action cannot be
            undone.
          </p>
          <button
            onClick={handleClearData}
            className="w-full py-4 mt-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 group"
          >
            <Trash2 className="w-4 h-4 group-hover:shake" />
            Reset All System Data
          </button>
        </div>
      </div>

      <div className="p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl text-white overflow-hidden relative group shadow-xl shadow-blue-900/10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/10">
                <FileJson className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                Data Snapshot
              </h2>
            </div>
            <p className="text-blue-100/90 font-medium max-w-md text-sm md:text-base leading-relaxed">
              Your data is uniquely yours. By exporting a snapshot, you can manually
              migrate between browsers or keep physical backups of your
              financial history.
            </p>
          </div>
          <div className="shrink-0 flex items-baseline gap-1 bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/10 justify-center">
            <span className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-md">
              LOCAL
            </span>
            <span className="text-sm font-bold text-blue-200">v1.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
