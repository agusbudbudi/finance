import { useState } from "react";
import { SimpleModeHeader } from "../components/simple-mode/SimpleModeHeader";
import { TransactionTable } from "../components/simple-mode/TransactionTable";
import { TransactionModal } from "../components/simple-mode/TransactionModal";
import { SimpleTransaction } from "../types/simpleTransaction";

export const SimpleIncomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="max-w-full space-y-6 pb-28 md:pb-0">
      <SimpleModeHeader 
        type="income" 
        onAddClick={handleAddClick} 
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
      />
      
      <TransactionTable 
        type="income" 
        month={selectedMonth} 
        onEditClick={handleEditClick}
      />

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }} 
        type="income"
        initialData={editingTx}
      />
    </div>
  );
};
