import { useState } from "react";
import { SimpleModeHeader } from "../components/simple-mode/SimpleModeHeader";
import { TransactionTable } from "../components/simple-mode/TransactionTable";
import { AddIncomeModal } from "../components/simple-mode/AddIncomeModal";
import { PlusCircle } from "lucide-react";

export const SimpleIncomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div className="max-w-full space-y-6">
      <SimpleModeHeader 
        type="income" 
        onAddClick={() => setIsModalOpen(true)} 
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
      />
      
      <TransactionTable type="income" month={selectedMonth} />

      <AddIncomeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
