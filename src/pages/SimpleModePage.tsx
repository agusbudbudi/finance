import { useState } from "react";
import { SimpleModeHeader } from "../components/simple-mode/SimpleModeHeader";
import { TransactionTable } from "../components/simple-mode/TransactionTable";
import { AddTransactionModal } from "../components/simple-mode/AddTransactionModal";
import { BulkUploadModal } from "../components/simple-mode/BulkUploadModal";

export const SimpleModePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div className="max-w-full space-y-6">
      <SimpleModeHeader 
        type="expense" 
        onAddClick={() => setIsModalOpen(true)} 
        onBulkUploadClick={() => setIsBulkModalOpen(true)}
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
      />
      
      <TransactionTable type="expense" month={selectedMonth} />

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </div>
  );
};
