import { useState } from "react";
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
} from "lucide-react";

export const SettingsPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL data? This action cannot be undone unless you have a backup.",
      )
    ) {
      StorageService.clearAll();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          System Settings
        </h1>
        <p className="text-gray-500 font-medium">
          Manage your local data, security, and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Data Persistence Section */}
        <Card
          title="Data Portability"
          subtitle="Backup and restore your local storage data."
          className="md:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-500 border border-primary-100 dark:border-primary-900/20">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Export Data
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Download all your financial data as a JSON file for safe
                  keeping.
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-500/20"
              >
                {isExporting ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isExporting ? "Generating..." : "Download Backup"}
              </button>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 space-y-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                  importStatus === "success"
                    ? "bg-green-50 text-green-500 border-green-100"
                    : importStatus === "error"
                      ? "bg-red-50 text-red-500 border-red-100"
                      : "bg-purple-50 text-purple-500 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/20"
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
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Import Data
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Restore your system from a previously exported JSON backup
                  file.
                </p>
              </div>
              <label className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-500/20 cursor-pointer">
                <Upload className="w-4 h-4" />
                {importStatus === "success"
                  ? "Restored!"
                  : importStatus === "error"
                    ? "Failed"
                    : "Upload JSON"}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              {importStatus === "error" && (
                <p className="text-[10px] text-red-500 font-bold text-center mt-1">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Security & System Section */}
        <Card title="System Integrity" variant="white">
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Offline Isolation
                  </p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                    Enabled
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Storage Engine
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Browser LocalStorage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone Section */}
        <Card title="Danger Zone" variant="white">
          <div className="space-y-4 mt-4">
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Permanently delete all financial records, account information, and
              configuration settings from this browser.
            </p>
            <button
              onClick={handleClearData}
              className="w-full py-4 border-2 border-red-100 hover:bg-red-50 text-red-500 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Trash2 className="w-4 h-4 group-hover:shake" />
              Reset All System Data
            </button>
          </div>
        </Card>
      </div>

      <div className="p-8 bg-blue-600 rounded-[40px] text-white overflow-hidden relative group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FileJson className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Data Snapshot
              </h2>
            </div>
            <p className="text-white/70 font-medium max-w-md">
              Your data is private. By exporting a snapshot, you can manually
              migrate between browsers or keep physical backups of your
              financial history.
            </p>
          </div>
          <div className="shrink-0 flex items-baseline gap-1">
            <span className="text-5xl font-black uppercase tracking-tighter">
              LOCAL
            </span>
            <span className="text-sm font-bold opacity-50">v1.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
