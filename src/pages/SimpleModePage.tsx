import { useState } from "react";
import { SimpleModeHeader } from "../components/simple-mode/SimpleModeHeader";
import { TransactionTable } from "../components/simple-mode/TransactionTable";
import { TransactionModal } from "../components/simple-mode/TransactionModal";
import { BulkUploadModal } from "../components/simple-mode/BulkUploadModal";
import { SimpleTransaction } from "../types/simpleTransaction";

export const SimpleModePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingTx, setEditingTx] = useState<SimpleTransaction | null>(null);

  const handleAddClick = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (tx: SimpleTransaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-full space-y-6 pb-40 md:pb-0">
      <SimpleModeHeader 
        type="expense" 
        onAddClick={handleAddClick} 
        onBulkUploadClick={() => setIsBulkModalOpen(true)}
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
      />
      
      <TransactionTable 
        type="expense" 
        month={selectedMonth} 
        onEditClick={handleEditClick}
      />

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }} 
        type="expense"
        initialData={editingTx}
      />

      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </div>
  );
};
