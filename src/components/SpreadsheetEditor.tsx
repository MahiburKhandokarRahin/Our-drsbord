import { useState } from 'react';
import { SpreadsheetData } from '../types';
import { Table, Trash2, Plus, Info, RefreshCw } from 'lucide-react';

interface SpreadsheetEditorProps {
  data: SpreadsheetData;
  onUpdate: (newData: SpreadsheetData) => void;
  onReset: () => void;
}

type ActiveSheetName = 'Users' | 'Bank_Accounts' | 'Expenses' | 'Payments' | 'Employee_Loans' | 'Inventory';

export default function SpreadsheetEditor({ data, onUpdate, onReset }: SpreadsheetEditorProps) {
  const [activeSheet, setActiveSheet] = useState<ActiveSheetName>('Bank_Accounts');

  const sheets: { id: ActiveSheetName; label: string; columns: string[] }[] = [
    { id: 'Bank_Accounts', label: 'Bank_Accounts', columns: ['AccountID', 'AccountName', 'AccountNumber', 'CurrentBalance', 'AccountType'] },
    { id: 'Expenses', label: 'Expenses', columns: ['Timestamp', 'ExpenseID', 'Date', 'Category', 'Amount', 'AccountID', 'Description', 'ReceiptDriveLink'] },
    { id: 'Payments', label: 'Payments', columns: ['Timestamp', 'PaymentID', 'Date', 'PaidTo', 'Amount', 'Category', 'PaymentMethod', 'Status', 'DocumentDriveLink'] },
    { id: 'Employee_Loans', label: 'Employee_Loans', columns: ['LoanID', 'EmployeeName', 'TotalLoanAmount', 'RemainingBalance', 'MonthlyDeductionAmount', 'StartDate', 'Status', 'NextRepaymentDate'] },
    { id: 'Inventory', label: 'Inventory', columns: ['ProductID', 'ProductName', 'PhotoUrl', 'Price', 'SellPrice', 'Stock', 'Color', 'Status'] },
    { id: 'Users', label: 'Users', columns: ['Username', 'PasswordHash', 'Role'] }
  ];

  const currentConfig = sheets.find(s => s.id === activeSheet)!;

  // Handle cell value updates directly within cells
  const handleCellChange = (rowIndex: number, column: string, val: any) => {
    const updatedSheetData = [...((data[activeSheet] || []) as any[])];
    
    // Attempt parsing numeric fields
    let parsedVal = val;
    if (column === 'CurrentBalance' || column === 'Amount' || column === 'TotalLoanAmount' || column === 'RemainingBalance' || column === 'MonthlyDeductionAmount' || column === 'Price' || column === 'SellPrice' || column === 'Stock') {
      parsedVal = Number(val) || 0;
    }

    updatedSheetData[rowIndex] = {
      ...updatedSheetData[rowIndex],
      [column]: parsedVal
    };

    onUpdate({
      ...data,
      [activeSheet]: updatedSheetData
    });
  };

  // Add empty row
  const addEmptyRow = () => {
    const columns = currentConfig.columns;
    const newRow: any = {};
    columns.forEach(col => {
      if (col === 'Timestamp') {
        newRow[col] = new Date().toISOString();
      } else if (col.includes('ID')) {
        newRow[col] = col.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      } else if (col === 'CurrentBalance' || col === 'Amount' || col === 'TotalLoanAmount' || col === 'RemainingBalance' || col === 'MonthlyDeductionAmount' || col === 'Price' || col === 'SellPrice' || col === 'Stock') {
        newRow[col] = 0;
      } else if (col === 'Status') {
        newRow[col] = activeSheet === 'Employee_Loans' ? 'Active' : (activeSheet === 'Inventory' ? 'In Stock' : 'Cleared');
      } else {
        newRow[col] = '';
      }
    });

    onUpdate({
      ...data,
      [activeSheet]: [...((data[activeSheet] || []) as any[]), newRow]
    });
  };

  // Delete row
  const deleteRow = (idx: number) => {
    const updated = ((data[activeSheet] || []) as any[]).filter((_, i) => i !== idx);
    onUpdate({
      ...data,
      [activeSheet]: updated
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      
      {/* Spreadsheet Header Controller */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-5 px-6 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Table size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-white mb-0.5">Simulated Spreadsheet Relational Database</h4>
            <p className="text-xs text-slate-400">Directly modify table rows. Changes propagate to system models instantly.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <button 
            type="button"
            onClick={onReset}
            className="flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all hover:cursor-pointer"
          >
            <RefreshCw size={12} className="mr-1.5" />
            Reset Database
          </button>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="bg-slate-950 px-6 py-2.5 flex space-x-1 border-b border-slate-850 shrink-0 overflow-x-auto select-none no-scrollbar">
        {sheets.map(sheet => (
          <button
            key={sheet.id}
            onClick={() => setActiveSheet(sheet.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
              activeSheet === sheet.id
                ? 'bg-slate-900 border-slate-800 text-emerald-400 font-bold'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📊 {sheet.label}
          </button>
        ))}
      </div>

      {/* Spreadsheet grid scroll area */}
      <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs">
        <table className="w-full text-left whitespace-nowrap border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-850">
              <th className="p-3 text-slate-500 font-bold w-12 text-center border-r border-slate-850 select-none">#</th>
              {currentConfig.columns.map(col => (
                <th key={col} className="p-3 text-slate-300 font-bold tracking-wide border-r border-slate-850">
                  {col}
                </th>
              ))}
              <th className="p-3 text-slate-500 font-bold text-center w-12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {(data[activeSheet] as any[]).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-900/60 transition-colors">
                <td className="p-3 text-slate-600 text-center border-r border-slate-850 select-none">{rIdx + 1}</td>
                {currentConfig.columns.map(col => (
                  <td key={col} className="p-1 border-r border-slate-850 min-w-[120px]">
                    <input
                      type={typeof row[col] === 'number' ? 'number' : 'text'}
                      value={row[col] ?? ''}
                      onChange={(e) => handleCellChange(rIdx, col, e.target.value)}
                      className="w-full bg-transparent hover:bg-slate-900/80 focus:bg-slate-900 px-2 py-1.5 text-slate-200 outline-none rounded transition-all focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </td>
                ))}
                <td className="p-1 text-center font-sans">
                  <button
                    onClick={() => deleteRow(rIdx)}
                    className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all inline-flex"
                    title="Delete row"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(data[activeSheet] as any[]).length === 0 && (
          <div className="p-12 text-center text-slate-500 font-sans">
            <p>No rows in this table model.</p>
          </div>
        )}
      </div>

      {/* Spreadsheet Control Row */}
      <div className="bg-slate-900 border-t border-slate-850 p-4 shrink-0 flex items-center justify-between font-sans">
        <button
          onClick={addEmptyRow}
          className="flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-all px-3 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:cursor-pointer"
        >
          <Plus size={14} className="mr-1.5" />
          Add Rows
        </button>
        <span className="text-[10px] text-slate-400 font-mono">
          Rows Count: {(data[activeSheet] as any[]).length} | Columns Count: {currentConfig.columns.length}
        </span>
      </div>
    </div>
  );
}
