import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Coins, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Lock, 
  User, 
  CreditCard, 
  Wallet, 
  Bell, 
  Users, 
  LogOut, 
  Settings, 
  Code, 
  AlertCircle, 
  X, 
  Menu,
  ChevronRight,
  Database,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronDown,
  Package,
  Tag,
  Trash2,
  Check
} from 'lucide-react';

import { SpreadsheetData, BankAccountRow, ExpenseRow, PaymentRow, EmployeeLoanRow, UserRow, InventoryItemRow } from './types';
import { LocalDatabase } from './db';
import ChartWrapper from './components/ChartWrapper';
import SpreadsheetEditor from './components/SpreadsheetEditor';
import AppsScriptPortal from './components/AppsScriptPortal';
import { ChartConfiguration } from 'chart.js';

// Import xlsx and jsPDF libraries for runtime export
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

type ActivePanel = 'analytics' | 'banking' | 'expenses' | 'payments' | 'loans' | 'deploy' | 'sheets' | 'inventoryValuation' | 'totalInventory';

const colorHexMap: Record<string, string> = {
  'Crimson Red': '#DC2626',
  'Royal Blue': '#2563EB',
  'Forest Green': '#16A34A',
  'Matte Black': '#1E293B',
  'Arctic White': '#ECEFF1',
  'Amber Brown': '#D97706',
  'Sunset Orange': '#EA580C',
  'Sunflower Yellow': '#EAB308',
  'Slate Gray': '#475569',
  'Midnight Purple': '#7C3AED',
  'Rose Gold': '#FDA4AF',
};

function getHexForColor(colorName: string): string {
  if (!colorName) return '#94A3B8';
  if (colorHexMap[colorName]) return colorHexMap[colorName];
  const clean = colorName.trim().toLowerCase();
  if (clean.includes('red')) return '#EF4444';
  if (clean.includes('blue')) return '#3B82F6';
  if (clean.includes('green')) return '#10B981';
  if (clean.includes('black')) return '#111827';
  if (clean.includes('white')) return '#FAFAFA';
  if (clean.includes('brown')) return '#5D4037';
  if (clean.includes('orange')) return '#F97316';
  if (clean.includes('yellow')) return '#FBBF24';
  if (clean.includes('gray') || clean.includes('grey')) return '#6B7280';
  if (clean.includes('purple')) return '#8B5CF6';
  if (clean.includes('pink')) return '#EC4899';
  return '#334155';
}

export default function App() {
  // Authentication & session persistence
  const [currentUser, setCurrentUser] = useState<UserRow | null>(() => {
    const saved = localStorage.getItem('cuteriaa_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Primary spreadsheet database state
  const [db, setDb] = useState<SpreadsheetData>(() => LocalDatabase.get());

  // Connection settings for live Apps Script web app
  const [customScriptUrl, setCustomScriptUrl] = useState(() => {
    return localStorage.getItem('cuteriaa_apps_script_url') || 'https://script.google.com/macros/s/AKfycbwgZPDW2B5-5-jAgCOMBSJqF0NGHczO2efVP3wXeHh79K8SkFW_uFakI1y9WRUMn_fW/exec';
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [loanSuccessMsg, setLoanSuccessMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Active navigation tab
  const [activePanel, setActivePanel] = useState<ActivePanel>('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handlePanelChange = (panel: ActivePanel) => {
    setActivePanel(panel);
    setIsSidebarOpen(false);
  };

  // Filter segment selection for Total Inventory States Bar
  const [activeInventoryFilter, setActiveInventoryFilter] = useState<'All' | 'In Stock' | 'Out of Stock' | 'Coming Soon' | 'Shipping' | 'Other'>('All');

  // Search filter terms
  const [expenseSearch, setExpenseSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Alert system dropdown state
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Modal display controllers
  const [activeModal, setActiveModal] = useState<'none' | 'addAccount' | 'addBalance' | 'addExpense' | 'addPayment' | 'addLoan' | 'addInventory'>('none');

  // Form Fields - Adding Inventory item
  const [newProdName, setNewProdName] = useState('');
  const [newProdPhotoUrl, setNewProdPhotoUrl] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdSellPrice, setNewProdSellPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('0');
  const [newProdColor, setNewProdColor] = useState('Matte Black');
  const [newProdStatus, setNewProdStatus] = useState<'In Stock' | 'Out of Stock' | 'Coming Soon' | 'Shipping' | 'Other'>('In Stock');

  // Form Fields - Linking bank channels
  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccType, setNewAccType] = useState<'Bank' | 'Mobile Wallet' | 'Cash'>('Bank');

  // Form Fields - Injected funds
  const [depositAccId, setDepositAccId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // Form Fields - Adding corporate expenses
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expCategory, setExpCategory] = useState('Inventory');
  const [expAmount, setExpAmount] = useState('');
  const [expAccId, setExpAccId] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [receiptBase64, setReceiptBase64] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');

  // Form Fields - Adding Payment vouchers
  const [pmtDate, setPmtDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pmtPaidTo, setPmtPaidTo] = useState('');
  const [pmtCategory, setPmtCategory] = useState('Inventory');
  const [pmtAmount, setPmtAmount] = useState('');
  const [pmtAccId, setPmtAccId] = useState('');
  const [pmtMethod, setPmtMethod] = useState('Bank Transfer');
  const [pmtStatus, setPmtStatus] = useState('Cleared');
  const [pmtBase64, setPmtBase64] = useState('');
  const [pmtFileName, setPmtFileName] = useState('');

  // Form Fields - Issuing welfare loans
  const [loanEmpName, setLoanEmpName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanMonths, setLoanMonths] = useState('12');
  const [loanRepayDate, setLoanRepayDate] = useState('');
  const [loanAccId, setLoanAccId] = useState('');

  // Synchronize with raw Apps Script live JSON API
  const syncFromAppsScript = async (urlToUse?: string) => {
    const activeUrl = urlToUse || customScriptUrl;
    if (!activeUrl) return;
    setIsConnecting(true);
    try {
      const response = await fetch(`${activeUrl}?action=getData`);
      const resJson = await response.json();
      if (resJson && resJson.success && resJson.data) {
        setDb(resJson.data);
        LocalDatabase.save(resJson.data);
      }
    } catch (err) {
      console.error("Error pulling live data from Sheets: ", err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Pull spreadsheet data if connected
  useEffect(() => {
    if (customScriptUrl) {
      syncFromAppsScript(customScriptUrl);
    }
  }, [customScriptUrl]);

  // Persist db amendments back to LocalDatabase
  const updateDatabase = async (newDb: SpreadsheetData) => {
    setDb(newDb);
    LocalDatabase.save(newDb);
    
    if (customScriptUrl) {
      try {
        await fetch(customScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'syncFullDatabase',
            db: newDb
          })
        });
      } catch (err) {
        console.error("Failed to push database update to Google Sheets:", err);
      }
    }
  };

  const resetDatabaseToDefault = () => {
    const fresh = LocalDatabase.reset();
    setDb(fresh);
  };

  // Synchronize selection fields when database structure updates
  useEffect(() => {
    if (db.Bank_Accounts.length > 0) {
      if (!depositAccId) setDepositAccId(db.Bank_Accounts[0].AccountID);
      if (!expAccId) setExpAccId(db.Bank_Accounts[0].AccountID);
      if (!pmtAccId) setPmtAccId(db.Bank_Accounts[0].AccountID);
      if (!loanAccId) setLoanAccId(db.Bank_Accounts[0].AccountID);
    }
  }, [db, depositAccId, expAccId, pmtAccId, loanAccId]);

  // Handle logins
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const matched = db.Users.find(
      u => u.Username.toLowerCase() === usernameInput.trim().toLowerCase() && 
      u.PasswordHash === passwordInput
    );

    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('cuteriaa_active_user', JSON.stringify(matched));
      setUsernameInput('');
      setPasswordInput('');
    } else {
      setLoginError('Authentication Denied: Invalid username or passcode row credentials.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cuteriaa_active_user');
  };

  const toggleUserRole = () => {
    if (!currentUser) return;
    const nextRole = currentUser.Role === 'Admin' ? 'Manager' : 'Admin';
    const updated = { ...currentUser, Role: nextRole };
    setCurrentUser(updated);
    localStorage.setItem('cuteriaa_active_user', JSON.stringify(updated));
  };

  // Real-time calculation parameters
  const totalFinancialReserves = useMemo(() => {
    return db.Bank_Accounts.reduce((sum, item) => sum + (Number(item.CurrentBalance) || 0), 0);
  }, [db.Bank_Accounts]);

  const activeMonthExpenses = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    return db.Expenses.filter(e => e.Date && e.Date.startsWith(currentMonth))
      .reduce((sum, item) => sum + (Number(item.Amount) || 0), 0);
  }, [db.Expenses]);

  const totalOutstandingLoans = useMemo(() => {
    return db.Employee_Loans.filter(l => l.Status === 'Active')
      .reduce((sum, item) => sum + (Number(item.RemainingBalance) || 0), 0);
  }, [db.Employee_Loans]);

  const totalInventoryCostValuation = useMemo(() => {
    return (db.Inventory || []).reduce((sum, item) => sum + (Number(item.Price || 0) * Number(item.Stock || 0)), 0);
  }, [db.Inventory]);

  const totalInventorySellValuation = useMemo(() => {
    return (db.Inventory || []).reduce((sum, item) => sum + (Number(item.SellPrice || 0) * Number(item.Stock || 0)), 0);
  }, [db.Inventory]);

  const totalInventoryStockCount = useMemo(() => {
    return (db.Inventory || []).reduce((sum, item) => sum + Number(item.Stock || 0), 0);
  }, [db.Inventory]);

  const combinedEnterpriseCapital = useMemo(() => {
    return totalFinancialReserves + totalInventoryCostValuation;
  }, [totalFinancialReserves, totalInventoryCostValuation]);

  // Repayment Schedule warnings (Detecting loans next payment date <= 3 days out)
  const outstandingRepaymentWarnings = useMemo(() => {
    const alertThreshold = new Date();
    alertThreshold.setDate(alertThreshold.getDate() + 3);

    return db.Employee_Loans.filter(l => {
      if (l.Status !== 'Active' || !l.NextRepaymentDate) return false;
      const tDate = new Date(l.NextRepaymentDate);
      return tDate <= alertThreshold;
    });
  }, [db.Employee_Loans]);

  // Automated repayment program script implementation
  const settleLoanEarly = async (loanId: string) => {
    if (currentUser?.Role !== 'Admin') return;

    const loan = db.Employee_Loans.find(l => l.LoanID === loanId);
    if (!loan) return;

    if (loan.Status === 'Paid') return;

    const recoveredAmount = loan.RemainingBalance;

    const updatedLoans = db.Employee_Loans.map(l => {
      if (String(l.LoanID) === String(loanId)) {
        return {
          ...l,
          RemainingBalance: 0,
          Status: 'Paid',
          NextRepaymentDate: '-'
        } as EmployeeLoanRow;
      }
      return l;
    });

    // Return money to source account if tracked
    let updatedBanks = db.Bank_Accounts;
    if (loan.SourceAccountID) {
      updatedBanks = db.Bank_Accounts.map(b => {
        if (b.AccountID === loan.SourceAccountID) {
          return { ...b, CurrentBalance: b.CurrentBalance + recoveredAmount };
        }
        return b;
      });
    }

    await updateDatabase({
      ...db,
      Employee_Loans: updatedLoans,
      Bank_Accounts: updatedBanks
    });

    setLoanSuccessMsg(`Loan settled. ৳${recoveredAmount.toLocaleString()} returned to ledger.`);
    setTimeout(() => setLoanSuccessMsg(''), 4000);
  };

  const triggerDeductionsIntegrator = async () => {
    if (currentUser?.Role !== 'Admin') return;
    setIsSyncing(true);

    try {
      let adjustedCount = 0;
      let totalRecovered = 0;
      
      // Track bank updates
      const bankDeductionMap: Record<string, number> = {};

      const updatedLoans = db.Employee_Loans.map(loan => {
        if (loan.Status !== 'Active') return loan;
        
        const deductionAmt = loan.MonthlyDeductionAmount;
        const balanceAfter = loan.RemainingBalance - deductionAmt;
        const isPaid = balanceAfter <= 0;
        const actualDeduction = isPaid ? loan.RemainingBalance : deductionAmt;

        if (loan.SourceAccountID) {
          bankDeductionMap[loan.SourceAccountID] = (bankDeductionMap[loan.SourceAccountID] || 0) + actualDeduction;
        }

        let nextRepayDate = loan.NextRepaymentDate;
        if (loan.NextRepaymentDate) {
          const d = new Date(loan.NextRepaymentDate);
          d.setMonth(d.getMonth() + 1);
          nextRepayDate = d.toISOString().split('T')[0];
        }

        adjustedCount++;
        totalRecovered += actualDeduction;
        
        return {
          ...loan,
          RemainingBalance: isPaid ? 0 : Math.round(balanceAfter * 100) / 100,
          Status: isPaid ? 'Paid' : 'Active',
          NextRepaymentDate: isPaid ? '-' : nextRepayDate
        } as EmployeeLoanRow;
      });

      // Update Banks
      const updatedBanks = db.Bank_Accounts.map(b => {
        if (bankDeductionMap[b.AccountID]) {
          return { ...b, CurrentBalance: b.CurrentBalance + bankDeductionMap[b.AccountID] };
        }
        return b;
      });

      await updateDatabase({
        ...db,
        Employee_Loans: updatedLoans,
        Bank_Accounts: updatedBanks
      });
      
      setLoanSuccessMsg(`Cycle complete! ৳${totalRecovered.toLocaleString()} recovered to accounts.`);
      setTimeout(() => setLoanSuccessMsg(''), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Base64 helper for image mock receipts
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isPmt: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = evt.target?.result as string;
      if (isPmt) {
        setPmtBase64(b64);
        setPmtFileName(file.name);
      } else {
        setReceiptBase64(b64);
        setReceiptFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Form Submissions - Add Inventory product
  const handleAddInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrice = parseFloat(newProdPrice) || 0;
    const cleanSellPrice = parseFloat(newProdSellPrice) || 0;
    const cleanStock = parseInt(newProdStock) || 0;

    const newItem: InventoryItemRow = {
      ProductID: `PRD-${Math.floor(9000 + Math.random() * 999)}`,
      ProductName: newProdName,
      PhotoUrl: newProdPhotoUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300',
      Price: cleanPrice,
      SellPrice: cleanSellPrice || Math.round(cleanPrice * 1.5),
      Stock: cleanStock,
      Color: newProdColor,
      Status: newProdStatus
    };

    updateDatabase({
      ...db,
      Inventory: [...(db.Inventory || []), newItem]
    });

    setNewProdName('');
    setNewProdPhotoUrl('');
    setNewProdPrice('');
    setNewProdSellPrice('');
    setNewProdStock('0');
    setNewProdColor('Matte Black');
    setNewProdStatus('In Stock');
    setActiveModal('none');
  };

  const handleRestockProduct = (prodId: string, delta: number) => {
    const updated = (db.Inventory || []).map(item => {
      if (item.ProductID === prodId) {
        const newStock = Math.max(0, (item.Stock || 0) + delta);
        let newStatus = item.Status;
        if (newStock === 0) {
          newStatus = 'Out of Stock';
        } else if (item.Status === 'Out of Stock') {
          newStatus = 'In Stock';
        }
        return { ...item, Stock: newStock, Status: newStatus };
      }
      return item;
    });
    updateDatabase({
      ...db,
      Inventory: updated
    });
  };

  const handleUpdateProductStatus = (prodId: string, status: any) => {
    const updated = (db.Inventory || []).map(item => {
      if (item.ProductID === prodId) {
        return { ...item, Status: status };
      }
      return item;
    });
    updateDatabase({
      ...db,
      Inventory: updated
    });
  };

  const handleDeleteProduct = (prodId: string) => {
    if (!window.confirm("Are you sure you want to delete this product from the inventory database?")) return;
    const updated = (db.Inventory || []).filter(item => item.ProductID !== prodId);
    updateDatabase({
      ...db,
      Inventory: updated
    });
  };

  const handleClearAllData = () => {
    if (!window.confirm("CRITICAL WARNING: This will permanently ERASE all transaction history (Expenses, Payments, Loans) and clear all Inventory listings. Bank balances will be reset to zero. Are you absolutely sure you want to proceed?")) {
      return;
    }

    const clearedDb: SpreadsheetData = {
      ...db,
      Expenses: [],
      Payments: [],
      Employee_Loans: [],
      Inventory: [],
      Bank_Accounts: (db.Bank_Accounts || []).map(acc => ({ ...acc, CurrentBalance: 0 }))
    };

    updateDatabase(clearedDb);
    alert("Database has been purged successfully.");
  };

  // Form Submissions - Link new bank
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.Role !== 'Admin') {
      alert("Action Revoked: Manager accounts are restricted to expense logging operations.");
      return;
    }

    const id = "ACC-" + Math.floor(1000 + Math.random() * 9000);
    const newRow: BankAccountRow = {
      AccountID: id,
      AccountName: newAccName,
      AccountNumber: newAccNumber,
      CurrentBalance: Number(newAccBalance) || 0,
      AccountType: newAccType
    };

    updateDatabase({
      ...db,
      Bank_Accounts: [...db.Bank_Accounts, newRow]
    });

    // Reset Form
    setNewAccName('');
    setNewAccNumber('');
    setNewAccBalance('');
    setActiveModal('none');
  };

  // Form Submissions - Deposit Injection
  const handleAddBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.Role !== 'Admin') {
      alert("Action Revoked: General Managers cannot inject liquid funds into corporate channels.");
      return;
    }

    const updated = db.Bank_Accounts.map(b => {
      if (b.AccountID === depositAccId) {
        return { ...b, CurrentBalance: b.CurrentBalance + (Number(depositAmount) || 0) };
      }
      return b;
    });

    updateDatabase({
      ...db,
      Bank_Accounts: updated
    });

    setDepositAmount('');
    setActiveModal('none');
  };

  // Form Submissions - Record Expense (With auto-deductions)
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmt = Number(expAmount) || 0;

    // Verify channel balance first to guarantee coverage
    const sourceAcc = db.Bank_Accounts.find(b => b.AccountID === expAccId);
    if (!sourceAcc) {
      alert("Error: Deduct Channel Account ID could not be resolved.");
      return;
    }

    if (sourceAcc.CurrentBalance < cleanAmt) {
      const runDeduct = window.confirm(`Warning: Selected source channel balance (৳${sourceAcc.CurrentBalance.toLocaleString()}) is lower than the transaction amount (৳${cleanAmt.toLocaleString()}). Post transaction anyway and overdraw account?`);
      if (!runDeduct) return;
    }

    const expId = "EXP-" + Math.floor(10000 + Math.random() * 90000);
    const ts = new Date().toISOString();

    const newExpense: ExpenseRow = {
      Timestamp: ts,
      ExpenseID: expId,
      Date: expDate,
      Category: expCategory,
      Amount: cleanAmt,
      AccountID: expAccId,
      Description: expDesc,
      ReceiptDriveLink: receiptBase64 ? 'https://drive.google.com/open?id=SimulatedReceiptLink' : ''
    };

    // Deduct Balance Atomically
    const updatedChannels = db.Bank_Accounts.map(b => {
      if (b.AccountID === expAccId) {
        return { ...b, CurrentBalance: b.CurrentBalance - cleanAmt };
      }
      return b;
    });

    updateDatabase({
      ...db,
      Expenses: [...db.Expenses, newExpense],
      Bank_Accounts: updatedChannels
    });

    // Reset
    setExpAmount('');
    setExpDesc('');
    setReceiptBase64('');
    setReceiptFileName('');
    setActiveModal('none');
  };

  // Form Submissions - Post Payment Voucher (With auto-deductions)
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmt = Number(pmtAmount) || 0;

    const sourceAcc = db.Bank_Accounts.find(b => b.AccountID === pmtAccId);
    if (!sourceAcc) {
      alert("Error: Deduct Channel Account ID could not be resolved.");
      return;
    }

    if (sourceAcc.CurrentBalance < cleanAmt) {
      const runDeduct = window.confirm(`Warning: Selected source channel balance (৳${sourceAcc.CurrentBalance.toLocaleString()}) is lower than the transaction amount (৳${cleanAmt.toLocaleString()}). Process payment anyway and overdraw account?`);
      if (!runDeduct) return;
    }

    const pmtId = "PMT-" + Math.floor(10000 + Math.random() * 90000);
    const ts = new Date().toISOString();

    const newPayment: PaymentRow = {
      Timestamp: ts,
      PaymentID: pmtId,
      Date: pmtDate,
      PaidTo: pmtPaidTo,
      Amount: cleanAmt,
      Category: pmtCategory,
      PaymentMethod: pmtMethod,
      Status: pmtStatus,
      DocumentDriveLink: pmtBase64 ? 'https://drive.google.com/open?id=SimulatedDocumentLink' : ''
    };

    // Deduct balance atomically
    const updatedChannels = db.Bank_Accounts.map(b => {
      if (b.AccountID === pmtAccId) {
        return { ...b, CurrentBalance: b.CurrentBalance - cleanAmt };
      }
      return b;
    });

    updateDatabase({
      ...db,
      Payments: [...db.Payments, newPayment],
      Bank_Accounts: updatedChannels
    });

    // Reset
    setPmtPaidTo('');
    setPmtAmount('');
    setPmtBase64('');
    setPmtFileName('');
    setActiveModal('none');
  };

  // Form Submissions - Establish Loan record
  const handleAddLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.Role !== 'Admin') {
      alert("Action Revoked: Manager accounts do not have Welfare Loan issuing privileges.");
      return;
    }

    const cleanAmt = Number(loanAmount) || 0;
    const cleanMonths = Number(loanMonths) || 12;
    const monthlyDeduct = cleanAmt / cleanMonths;

    const sourceAcc = db.Bank_Accounts.find(b => b.AccountID === loanAccId);
    if (!sourceAcc) {
      alert("Error: Disbursement Channel Account ID could not be resolved.");
      return;
    }

    if (sourceAcc.CurrentBalance < cleanAmt) {
      const runDeduct = window.confirm(`Warning: Selected disbursement channel balance (৳${sourceAcc.CurrentBalance.toLocaleString()}) is lower than the transaction amount (৳${cleanAmt.toLocaleString()}). Process loan anyway and overdraw account?`);
      if (!runDeduct) return;
    }

    const loanId = "LON-" + Math.floor(10000 + Math.random() * 90000);

    const newLoan: EmployeeLoanRow = {
      LoanID: loanId,
      EmployeeName: loanEmpName,
      TotalLoanAmount: cleanAmt,
      RemainingBalance: cleanAmt,
      MonthlyDeductionAmount: Math.round(monthlyDeduct * 100) / 100,
      StartDate: new Date().toISOString().split('T')[0],
      Status: 'Active',
      NextRepaymentDate: loanRepayDate,
      SourceAccountID: loanAccId
    };

    // Deduct atomic balance from specified Bank_Accounts element
    const updatedChannels = db.Bank_Accounts.map(b => {
      if (b.AccountID === loanAccId) {
        return { ...b, CurrentBalance: b.CurrentBalance - cleanAmt };
      }
      return b;
    });

    updateDatabase({
      ...db,
      Employee_Loans: [...db.Employee_Loans, newLoan],
      Bank_Accounts: updatedChannels
    });

    setLoanEmpName('');
    setLoanAmount('');
    setLoanMonths('12');
    setLoanRepayDate('');
    setActiveModal('none');
  };

  // SCRIPT SYNCHRONIZER METRICS (For real sheets testing simulation)
  const saveAppsScriptUrl = (url: string) => {
    if (!url.startsWith('http')) {
      alert("Verification Failed: Deployment Gateway URL must begin with http:// or https://");
      return;
    }
    setCustomScriptUrl(url);
    localStorage.setItem('cuteriaa_apps_script_url', url);
    alert("Google Apps Script Synchronizer Active! Queries are successfully route-linked.");
    syncFromAppsScript(url);
  };

  const disableAppsScriptUrl = () => {
    setCustomScriptUrl('');
    localStorage.removeItem('cuteriaa_apps_script_url');
    alert("Live Connection Terminated. Restored backup simulator local db.");
  };

  const testAppsScriptConnection = async (url: string) => {
    try {
      const res = await fetch(`${url}?action=test`);
      const body = await res.json();
      return !!(body && body.success);
    } catch {
      try {
        await fetch(url, { method: 'GET', mode: 'no-cors' });
        return true;
      } catch {
        return false;
      }
    }
  };

  // HIGH FIDELITY CLIENT EXPORTS
  const runExcelExport = (tableName: 'Expenses' | 'Payments') => {
    const data = tableName === 'Expenses' ? db.Expenses : db.Payments;
    if (data.length === 0) {
      alert("No data lines found inside active grid.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tableName);
    XLSX.writeFile(wb, `Cuteriaa_Vibe_${tableName}_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const runPDFExport = (tableName: 'Expenses' | 'Payments') => {
    const data = tableName === 'Expenses' ? db.Expenses : db.Payments;
    if (data.length === 0) {
      alert("No data lines found inside active grid.");
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header Panel
    doc.setFillColor(15, 23, 42); // slate 900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("Helvetica", "bold");
    doc.text("CUTERIAA VIBE FINTECH SYSTEM", 14, 18);
    
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text(`Official Business Ledger Audit Report — Table: ${tableName}`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    let y = 50;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    
    if (tableName === 'Expenses') {
      doc.text("Date", 14, y);
      doc.text("Category", 40, y);
      doc.text("Description", 75, y);
      doc.text("Amount", 170, y);
      
      doc.line(14, y + 2, 196, y + 2);
      y += 8;
      doc.setFont("Helvetica", "normal");
      
      db.Expenses.forEach(item => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(String(item.Date || ''), 14, y);
        doc.text(String(item.Category || ''), 40, y);
        doc.text(String(item.Description || '').substring(0, 40), 75, y);
        doc.text(`৳${Number(item.Amount || 0).toLocaleString()}`, 170, y);
        y += 6;
      });
    } else {
      doc.text("Date", 14, y);
      doc.text("Beneficiary", 40, y);
      doc.text("Category", 100, y);
      doc.text("Method", 135, y);
      doc.text("Amount", 170, y);
      
      doc.line(14, y + 2, 196, y + 2);
      y += 8;
      doc.setFont("Helvetica", "normal");
      
      db.Payments.forEach(item => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(String(item.Date || ''), 14, y);
        doc.text(String(item.PaidTo || '').substring(0, 25), 40, y);
        doc.text(String(item.Category || ''), 100, y);
        doc.text(String(item.PaymentMethod || ''), 135, y);
        doc.text(`৳${Number(item.Amount || 0).toLocaleString()}`, 170, y);
        y += 6;
      });
    }
    
    doc.save(`Cuteriaa_Vibe_${tableName}_Audit_Report.pdf`);
  };

  // CHART.JS STRUCTURE PREPS VIA useMemo FOR AUTOMATIC COHESION
  const lineChartConfig = useMemo<ChartConfiguration>(() => {
    // Collect past 6 months dynamically
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().substring(0, 7)); // "YYYY-MM"
    }

    const monthAmounts = Array(6).fill(0);
    db.Expenses.forEach(e => {
      if (e.Date) {
        const key = e.Date.substring(0, 7);
        const idx = months.indexOf(key);
        if (idx !== -1) {
          monthAmounts[idx] += (Number(e.Amount) || 0);
        }
      }
    });

    const labelStrings = months.map(m => {
      const d = new Date(m + "-15");
      return d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
    });

    return {
      type: 'line',
      data: {
        labels: labelStrings,
        datasets: [{
          label: 'Transaction Volumes (BDT)',
          data: monthAmounts,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          tension: 0.35,
          fill: true,
          borderWidth: 2,
          pointBackgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(30, 41, 59, 1)' } },
          x: { grid: { display: false } }
        }
      }
    };
  }, [db.Expenses]);

  const pieChartConfig = useMemo<ChartConfiguration>(() => {
    const categories: { [key: string]: number } = {};
    db.Expenses.forEach(e => {
      if (e.Category) {
        categories[e.Category] = (categories[e.Category] || 0) + (Number(e.Amount) || 0);
      }
    });

    return {
      type: 'doughnut',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              padding: 15,
              color: '#94a3b8',
              font: { size: 10, family: 'sans-serif' }
            }
          }
        }
      }
    };
  }, [db.Expenses]);

  const barChartConfig = useMemo<ChartConfiguration>(() => {
    return {
      type: 'bar',
      data: {
        labels: db.Bank_Accounts.map(b => b.AccountName),
        datasets: [{
          label: 'Active Balance (BDT)',
          data: db.Bank_Accounts.map(b => b.CurrentBalance),
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(30, 41, 59, 1)' } },
          x: { grid: { display: false } }
        }
      }
    };
  }, [db.Bank_Accounts]);

  // Filtering views computations
  const filteredExpensesList = useMemo(() => {
    return db.Expenses.filter(e => {
      const q = expenseSearch.toLowerCase();
      return (
        (e.Category?.toLowerCase() || '').includes(q) ||
        (e.Description?.toLowerCase() || '').includes(q) ||
        (e.AccountID?.toLowerCase() || '').includes(q) ||
        (e.ExpenseID?.toLowerCase() || '').includes(q)
      );
    });
  }, [db.Expenses, expenseSearch]);

  const filteredPaymentsList = useMemo(() => {
    return db.Payments.filter(p => {
      const q = paymentSearch.toLowerCase();
      return (
        (p.PaidTo?.toLowerCase() || '').includes(q) ||
        (p.Category?.toLowerCase() || '').includes(q) ||
        (p.PaymentMethod?.toLowerCase() || '').includes(q) ||
        (p.PaymentID?.toLowerCase() || '').includes(q) ||
        (p.Status?.toLowerCase() || '').includes(q)
      );
    });
  }, [db.Payments, paymentSearch]);

  // If user is not authenticated, render Login layout with premium branding
  if (!currentUser) {
    return (
      <div id="login_screen" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          
          <div className="text-center mb-8">
            <span className="inline-flex items-center justify-center p-1 bg-emerald-500/10 rounded-2xl mb-4 border border-emerald-500/15 overflow-hidden w-16 h-16">
              <img 
                src="https://i.pinimg.com/736x/9b/e2/7c/9be27c432d206932eb1db98182db3708.jpg" 
                alt="Cuteriaa Logo" 
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">Cuteriaa Vibe Dashboard</h2>
            <p className="text-slate-400 text-sm mt-1">Real-time Financial Dashboard Console</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">User Handle</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-white rounded-xl pl-10 pr-4 py-3 text-xs tracking-wider transition-all focus:outline-none" 
                  placeholder="Enter your user handle"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Passcode</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-white rounded-xl pl-10 pr-4 py-3 text-xs tracking-wider transition-all focus:outline-none" 
                  placeholder="Enter security passcode"
                />
              </div>
            </div>

            {loginError && (
              <div className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl flex items-start">
                <AlertCircle size={14} className="mr-2 shrink-0 mt-0.5" />
                <p>{loginError}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-emerald-500/5 hover:cursor-pointer"
            >
              System Authentication
            </button>
          </form>

          <div className="mt-8 border-t border-slate-800/60 pt-4 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Contact administrator for account setup
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-hidden h-screen relative">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden h-14 bg-slate-900 border-b border-slate-850 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center">
          <span className="w-8 h-8 bg-emerald-500/10 rounded-lg mr-2.5 border border-emerald-500/25 overflow-hidden flex items-center justify-center">
            <img 
              src="https://i.pinimg.com/736x/9b/e2/7c/9be27c432d206932eb1db98182db3708.jpg" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </span>
          <h1 className="text-sm font-black tracking-tight text-white uppercase">Cuteriaa Vibe Dashboard</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDE NAVIGATION PANEL */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-850 flex flex-col shrink-0 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Top Logo Card */}
        <div className="h-16 flex items-center px-6 border-b border-slate-850">
          <span className="w-10 h-10 bg-emerald-500/10 rounded-lg mr-3 border border-emerald-500/25 overflow-hidden shrink-0 flex items-center justify-center">
            <img 
              src="https://i.pinimg.com/736x/9b/e2/7c/9be27c432d206932eb1db98182db3708.jpg" 
              alt="Logo" 
              className="w-full h-full object-cover rounded-md"
              referrerPolicy="no-referrer"
            />
          </span>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight text-white mb-0.5 whitespace-nowrap">Cuteriaa Vibe Dashboard</h1>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none">Enterprise Ledger</span>
          </div>
        </div>

        {/* Dynamic User Profile indicator */}
        <div className="p-4 border-b border-slate-850 bg-slate-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-slate-805/80 border border-slate-800 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 select-none">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 truncate uppercase tracking-wide leading-none">Operator</p>
              <h4 className="text-xs font-bold text-white truncate mt-1 leading-none">@{currentUser.Username}</h4>
            </div>
            <button 
              onClick={toggleUserRole}
              title="Fast Switch Permission Security Clearance Role"
              className="text-[9px] font-bold uppercase tracking-wide px-2 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded-lg border border-slate-700 transition"
            >
              {currentUser.Role}
            </button>
          </div>
        </div>

        {/* Sidebar Tabs selectors list */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          <button 
            type="button"
            onClick={() => handlePanelChange('analytics')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              activePanel === 'analytics'
                ? 'bg-slate-850 text-emerald-400 border border-slate-800'
                : 'text-slate-400 hover:bg-slate-855 hover:text-white hover:cursor-pointer'
            }`}
          >
            <div className="flex items-center">
              <TrendingUp size={16} className="mr-3 shrink-0" />
              Analytics Core
            </div>
            <ChevronRight size={12} className={activePanel === 'analytics' ? 'opacity-100' : 'opacity-30'} />
          </button>

          <button 
            type="button"
            onClick={() => handlePanelChange('banking')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              activePanel === 'banking'
                ? 'bg-slate-850 text-emerald-400 border border-slate-800'
                : 'text-slate-400 hover:bg-slate-855 hover:text-white hover:cursor-pointer'
            }`}
          >
            <div className="flex items-center">
              <Building2 size={16} className="mr-3 shrink-0" />
              Bank & Wallets
            </div>
            <ChevronRight size={12} className={activePanel === 'banking' ? 'opacity-100' : 'opacity-30'} />
          </button>

          <button 
            type="button"
            onClick={() => handlePanelChange('expenses')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              activePanel === 'expenses'
                ? 'bg-slate-850 text-emerald-400 border border-slate-800'
                : 'text-slate-400 hover:bg-slate-855 hover:text-white hover:cursor-pointer'
            }`}
          >
            <div className="flex items-center">
              <FileText size={16} className="mr-3 shrink-0" />
              Expenses Log
            </div>
            <ChevronRight size={12} className={activePanel === 'expenses' ? 'opacity-100' : 'opacity-30'} />
          </button>

          <button 
            type="button"
            onClick={() => handlePanelChange('payments')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              activePanel === 'payments'
                ? 'bg-slate-850 text-emerald-400 border border-slate-800'
                : 'text-slate-400 hover:bg-slate-855 hover:text-white hover:cursor-pointer'
            }`}
          >
            <div className="flex items-center">
              <CreditCard size={16} className="mr-3 shrink-0" />
              Payments ledger
            </div>
            <ChevronRight size={12} className={activePanel === 'payments' ? 'opacity-100' : 'opacity-30'} />
          </button>

          <button 
            type="button"
            onClick={() => handlePanelChange('inventoryValuation')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              activePanel === 'inventoryValuation'
                ? 'bg-slate-850 text-emerald-400 border border-slate-800'
                : 'text-slate-400 hover:bg-slate-855 hover:text-white hover:cursor-pointer'
            }`}
          >
            <div className="flex items-center">
              <Tag size={16} className="mr-3 shrink-0" />
              Inventory Valuation
            </div>
            <ChevronRight size={12} className={activePanel === 'inventoryValuation' ? 'opacity-100' : 'opacity-30'} />
          </button>

          <button 
            type="button"
            onClick={() => handlePanelChange('totalInventory')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              activePanel === 'totalInventory'
                ? 'bg-slate-850 text-emerald-400 border border-slate-800'
                : 'text-slate-400 hover:bg-slate-855 hover:text-white hover:cursor-pointer'
            }`}
          >
            <div className="flex items-center">
              <Package size={16} className="mr-3 shrink-0" />
              Total Inventory
            </div>
            <ChevronRight size={12} className={activePanel === 'totalInventory' ? 'opacity-100' : 'opacity-30'} />
          </button>

          {currentUser.Role === 'Admin' && (
            <button 
              type="button"
              onClick={() => handlePanelChange('loans')}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                activePanel === 'loans'
                  ? 'bg-slate-850 text-emerald-400 border border-slate-800'
                  : 'text-slate-400 hover:bg-slate-855 hover:text-white hover:cursor-pointer'
              }`}
            >
              <div className="flex items-center">
                <Users size={16} className="mr-3 shrink-0" />
                Employee Loans
              </div>
              <ChevronRight size={12} className={activePanel === 'loans' ? 'opacity-100' : 'opacity-30'} />
            </button>
          )}

          <div className="h-4"></div>
          <span className="block px-4 text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">Blueprints & Grid</span>

          <button 
            type="button"
            onClick={() => handlePanelChange('sheets')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              activePanel === 'sheets'
                ? 'bg-slate-850 text-emerald-400 border border-slate-800'
                : 'text-slate-400 hover:bg-slate-855 hover:text-white hover:cursor-pointer'
            }`}
          >
            <div className="flex items-center">
              <Database size={16} className="mr-3 shrink-0 text-slate-400" />
              Database Grid Table
            </div>
            <ChevronRight size={12} className={activePanel === 'sheets' ? 'opacity-100' : 'opacity-30'} />
          </button>

          <button 
            type="button"
            onClick={() => handlePanelChange('deploy')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              activePanel === 'deploy'
                ? 'bg-slate-850 text-emerald-400 border border-slate-800'
                : 'text-slate-400 hover:bg-slate-855 hover:text-white hover:cursor-pointer'
            }`}
          >
            <div className="flex items-center">
              <Code size={16} className="mr-3 shrink-0 text-slate-400" />
              Google Apps Script API
            </div>
            <ChevronRight size={12} className={activePanel === 'deploy' ? 'opacity-100' : 'opacity-30'} />
          </button>
        </nav>

        {/* Footer Logout Action */}
        <div className="p-4 border-t border-slate-850">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-550/10 hover:cursor-pointer rounded-xl transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={14} />
            <span>Close Session</span>
          </button>
        </div>
      </aside>

      {/* CORE WORKSPACE WINDOW */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
        
        {/* HEADER CONTROL BAR */}
        <header className="h-16 border-b border-slate-850 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-slate-900/40 relative z-30">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h2 className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-white truncate max-w-[150px] sm:max-w-none">
              {activePanel === 'analytics' && "Analytics Dashboard"}
              {activePanel === 'banking' && "Cash Management"}
              {activePanel === 'expenses' && "Expenses tracker"}
              {activePanel === 'payments' && "Disbursal Ledger"}
              {activePanel === 'loans' && "Welfare Employee Loans"}
              {activePanel === 'sheets' && "Real-Time relational Database"}
              {activePanel === 'deploy' && "Go Live Connection"}
              {activePanel === 'inventoryValuation' && "Inventory Valuation Tracker"}
              {activePanel === 'totalInventory' && "Total Stock Inventory Management"}
            </h2>
            <span className="h-4 w-[1px] bg-slate-800 hidden sm:block"></span>
            <p className="text-[10px] uppercase font-mono tracking-wide text-slate-400 hidden sm:block">
              Connection Type: {customScriptUrl ? (
                <span className="text-emerald-400 font-bold inline-flex items-center">
                  ● Connected to script API
                  <button 
                    onClick={() => syncFromAppsScript()}
                    disabled={isConnecting}
                    className="ml-2 px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[9px] hover:cursor-pointer disabled:opacity-50 transition"
                  >
                    {isConnecting ? "Syncing..." : "Refresh Now ↻"}
                  </button>
                </span>
              ) : (
                <span className="text-emerald-500 font-semibold">● Local Emulator active</span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification system components */}
            <div className="relative">
              <button 
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="p-2 text-slate-40/80 hover:text-emerald-400 focus:outline-none transition relative hover:cursor-pointer"
              >
                <Bell size={20} />
                {outstandingRepaymentWarnings.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 border-2 border-slate-950 rounded-full animate-pulse" />
                )}
              </button>

              {/* Alerts bell drop-panel */}
              <AnimatePresence>
                {alertsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAlertsOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active repayments alerts</span>
                        <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          {outstandingRepaymentWarnings.length} Warnings
                        </span>
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                        {outstandingRepaymentWarnings.length === 0 ? (
                          <p className="text-xs text-slate-500 py-6 text-center">All loan accounts clean. No pending alerts.</p>
                        ) : (
                          outstandingRepaymentWarnings.map((loan, idx) => (
                            <div key={`warning-${loan.LoanID}-${idx}`} className="p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl space-y-1 transition-all">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-rose-400 uppercase font-mono tracking-wider">Schedule warning</span>
                                <span className="text-[9px] text-slate-500 font-mono font-semibold">{loan.NextRepaymentDate}</span>
                              </div>
                              <p className="text-xs text-white font-semibold">Employee {loan.EmployeeName}</p>
                              <p className="text-[11px] text-slate-400">Installment of <strong className="text-white">৳{loan.MonthlyDeductionAmount.toLocaleString()}</strong> is outstanding within 3 days.</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PANEL SLOTS CONTROLLERS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 no-scrollbar">
          
          {/* ANALYTICS PANEL */}
          {activePanel === 'analytics' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
            >
              {/* Cards Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consolidated Reserves</span>
                  <h3 className="text-2xl font-black text-white mt-1.5">৳{totalFinancialReserves.toLocaleString()}</h3>
                  <div className="flex items-center text-emerald-400 text-[11px] font-semibold mt-3">
                    <Sparkles size={13} className="mr-1 hover:animate-spin" />
                    Liquid wealth on accounts
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>

                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Cost Valuation</span>
                  <h3 className="text-2xl font-black text-white mt-1.5">৳{totalInventoryCostValuation.toLocaleString()}</h3>
                  <div className="flex items-center text-amber-400 text-[11px] font-semibold mt-3">
                    <Tag size={13} className="mr-1" />
                    Capital bound in warehouses
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>

                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Combined Valuation</span>
                  <h3 className="text-2xl font-black text-white mt-1.5">৳{combinedEnterpriseCapital.toLocaleString()}</h3>
                  <div className="flex items-center text-emerald-300 text-[11px] font-semibold mt-3">
                    <Coins size={13} className="mr-1" />
                    Fund Capital + Inventory assets
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>

                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Stock Volumes</span>
                  <h3 className="text-2xl font-black text-white mt-1.5">{totalInventoryStockCount.toLocaleString()} pcs</h3>
                  <div className="flex items-center text-blue-400 text-[11px] font-semibold mt-3">
                    <Package size={13} className="mr-1" />
                    Total quantities in stock
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>
              </div>

              {/* Chart Rows */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-6 font-mono">Consolidated Expense Activity Trend</h4>
                  <div className="h-72 w-full">
                    <ChartWrapper config={lineChartConfig} />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-6 font-mono">Spend Categories Breakdown</h4>
                  <div className="h-60 w-full relative flex-1 flex items-center justify-center">
                    <ChartWrapper config={pieChartConfig} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-6 font-mono">Asset Allocation Across Channels</h4>
                <div className="h-80 w-full">
                  <ChartWrapper config={barChartConfig} />
                </div>
              </div>

              {/* Inventory Price & Stock list (User Request) */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">Inventory Price & Stock valuation Register</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Real-time valuation of individual products including unit cost prices, retail sell prices, quantities, and current asset holding values.</p>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
                        <th className="p-4">Product ID</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Color</th>
                        <th className="p-4 text-center">Active Status</th>
                        <th className="p-4 text-right">Cost Price</th>
                        <th className="p-4 text-right">Retail Sell Price</th>
                        <th className="p-4 text-right">Stock Level</th>
                        <th className="p-4 text-right font-black text-white bg-slate-950/20">Valued Asset (Cost)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {(!db.Inventory || db.Inventory.length === 0) ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                            No product records in storage database. Toggle tables in Spreadsheet Database to populate rows.
                          </td>
                        </tr>
                      ) : (
                        db.Inventory.map((item, index) => {
                          const assetVal = (item.Price || 0) * (item.Stock || 0);
                          return (
                            <tr key={`inv-row-${item.ProductID}-${index}`} className="hover:bg-slate-950/30 transition">
                              <td className="p-4 font-mono text-slate-500 font-bold">{item.ProductID}</td>
                              <td className="p-4 text-white font-bold">{item.ProductName}</td>
                              <td className="p-4">
                                <span className="inline-flex items-center space-x-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: getHexForColor(item.Color) }} />
                                  <span>{item.Color}</span>
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wide font-black rounded-md border ${
                                  item.Status === 'In Stock'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                                    : item.Status === 'Out of Stock'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/15'
                                    : item.Status === 'Coming Soon'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/15'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/15'
                                }`}>
                                  {item.Status}
                                </span>
                              </td>
                              <td className="p-4 text-right">৳{(item.Price || 0).toLocaleString()}</td>
                              <td className="p-4 text-right text-emerald-400">৳{(item.SellPrice || 0).toLocaleString()}</td>
                              <td className="p-4 text-right text-slate-300 font-mono font-bold">{(item.Stock || 0).toLocaleString()}</td>
                              <td className="p-4 text-right text-white font-black bg-slate-950/10">৳{assetVal.toLocaleString()}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot className="bg-slate-950/80 border-t border-slate-800 font-black text-slate-300">
                      <tr>
                        <td colSpan={6} className="p-4 text-right font-bold uppercase tracking-wider text-slate-450">Aggregate Total Value:</td>
                        <td className="p-4 text-right text-white font-mono">{totalInventoryStockCount.toLocaleString()} pcs</td>
                        <td className="p-4 text-right text-emerald-400 font-black bg-slate-950">৳{totalInventoryCostValuation.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 text-[11px] font-medium text-slate-400">
                  <span className="flex items-center">
                    <Sparkles size={12} className="mr-1.5 text-emerald-400 animate-pulse" />
                    Consolidated Enterprise Valuation (Reserves + Stock):
                  </span>
                  <span className="text-white text-sm font-black tracking-tight">৳{combinedEnterpriseCapital.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* BANKING MODULE AREA */}
          {activePanel === 'banking' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white">Liquid Reserves Channels</h3>
                  <p className="text-xs text-slate-400">View balances of physical accounts, merchant wallets, and safes</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setActiveModal('addAccount')}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-xl hover:bg-slate-850 transition hover:cursor-pointer"
                  >
                    + Link Channel
                  </button>
                  <button 
                    onClick={() => setActiveModal('addBalance')}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition hover:cursor-pointer"
                  >
                    + Inject Funds
                  </button>
                </div>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {db.Bank_Accounts.map((acc, idx) => (
                  <div key={`acc-card-${acc.AccountID}-${idx}`} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-lg relative group overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40 px-2 py-0.5 rounded-md border border-slate-800">
                        {acc.AccountType}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{acc.AccountID}</span>
                    </div>
                    <h4 className="text-white font-bold mt-4 truncate">{acc.AccountName}</h4>
                    <p className="text-xs text-slate-500 font-semibold font-mono mt-0.5">{acc.AccountNumber}</p>
                    <div className="mt-8 flex justify-between items-baseline">
                      <span className="text-2xl font-black text-white">৳{acc.CurrentBalance.toLocaleString()}</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* EXPENSES TRACKER MODULE */}
          {activePanel === 'expenses' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
              id="expenses_ledger_container"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white">Expenses Ledger</h3>
                  <p className="text-xs text-slate-400">Record of physical materials, software licenses, advertising campaigns, and petty cash operations</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button 
                    onClick={() => runExcelExport('Expenses')}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-850 transition hover:cursor-pointer"
                  >
                    Export to Excel
                  </button>
                  <button 
                    onClick={() => runPDFExport('Expenses')}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-850 transition hover:cursor-pointer"
                  >
                    Export PDF Audit
                  </button>
                  <button 
                    onClick={() => setActiveModal('addExpense')}
                    className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition hover:cursor-pointer"
                  >
                    + Record Purchase
                  </button>
                </div>
              </div>

              {/* Data table log */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-5 sm:px-6 border-b border-slate-850 bg-slate-905 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Transaction log</h4>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                      className="bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 w-full sm:w-64 focus:outline-none" 
                      placeholder="Search transactions..."
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-955/50 border-b border-slate-850">
                        <th className="p-5">Date</th>
                        <th className="p-5">ID</th>
                        <th className="p-5">Category</th>
                        <th className="p-5">Description</th>
                        <th className="p-5 text-center">Account ID</th>
                        <th className="p-5 text-right font-black">Amount</th>
                        <th className="p-5 text-center">Attachment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 font-medium">
                      {filteredExpensesList.slice().reverse().map((e, idx) => (
                        <tr key={`expense-${e.ExpenseID || e.Timestamp}-${idx}`} className="hover:bg-slate-905/70 transition">
                          <td className="p-5 font-mono text-slate-300">{e.Date}</td>
                          <td className="p-5 font-mono text-slate-500 font-semibold">{e.ExpenseID}</td>
                          <td className="p-5">
                            <span className="px-2.5 py-1 bg-slate-950 border border-slate-800/85 rounded-full text-[10px] font-bold text-slate-300">
                              {e.Category}
                            </span>
                          </td>
                          <td className="p-5 text-slate-300 max-w-xs truncate">{e.Description}</td>
                          <td className="p-5 text-center text-slate-400 font-mono font-bold">{e.AccountID}</td>
                          <td className="p-5 text-right text-white font-black text-sm">৳{e.Amount.toLocaleString()}</td>
                          <td className="p-5 text-center font-sans">
                            {e.ReceiptDriveLink ? (
                              <a href={e.ReceiptDriveLink} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-semibold text-[11px] inline-flex items-center">
                                <ExternalLink size={12} className="mr-1" />
                                File Uploaded
                              </a>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredExpensesList.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-500 font-sans">No corporate purchases logged match search criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* PAYMENTS MODULE AREA */}
          {activePanel === 'payments' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
              id="payments_ledger_container"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white">Payments Disbursal Log</h3>
                    <p className="text-xs text-slate-400">Issue supporting invoices, trade settlements, logistics payouts and record clearing statuses</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                  <button 
                    onClick={() => runExcelExport('Payments')}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-850 transition hover:cursor-pointer"
                  >
                    Export to Excel
                  </button>
                  <button 
                    onClick={() => runPDFExport('Payments')}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-850 transition hover:cursor-pointer"
                  >
                    Export PDF Audit
                  </button>
                  <button 
                    onClick={() => setActiveModal('addPayment')}
                    className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition hover:cursor-pointer"
                  >
                    + Log Payment
                  </button>
                </div>
              </div>

              {/* Data table */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-5 sm:px-6 border-b border-slate-850 bg-slate-905 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">disbursed vouchers</h4>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 w-full sm:w-64 focus:outline-none" 
                      placeholder="Search transactions..."
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-955/50 border-b border-slate-850">
                        <th className="p-5">Date</th>
                        <th className="p-5">Voucher ID</th>
                        <th className="p-5">Beneficiary / Vendor</th>
                        <th className="p-5">Audit Category</th>
                        <th className="p-5">Settlement Method</th>
                        <th className="p-5 text-right font-black">Amount</th>
                        <th className="p-5 text-center">Voucher Status</th>
                        <th className="p-5 text-center">Invoice Attachment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 font-medium">
                      {filteredPaymentsList.slice().reverse().map((p, idx) => (
                        <tr key={`payment-${p.PaymentID || p.Timestamp}-${idx}`} className="hover:bg-slate-905/70 transition">
                          <td className="p-5 font-mono text-slate-300">{p.Date}</td>
                          <td className="p-5 font-mono text-slate-500 font-semibold">{p.PaymentID}</td>
                          <td className="p-5 text-white font-bold">{p.PaidTo}</td>
                          <td className="p-5 text-slate-300">{p.Category}</td>
                          <td className="p-5 text-slate-400">{p.PaymentMethod}</td>
                          <td className="p-5 text-right text-white font-black text-sm">৳{p.Amount.toLocaleString()}</td>
                          <td className="p-5 text-center">
                            <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wide font-black rounded-md border ${
                              p.Status === 'Cleared' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/15'
                            }`}>
                              {p.Status}
                            </span>
                          </td>
                          <td className="p-5 text-center font-sans">
                            {p.DocumentDriveLink ? (
                              <a href={p.DocumentDriveLink} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-semibold text-[11px] inline-flex items-center">
                                <ExternalLink size={12} className="mr-1" />
                                Invoice Doc
                              </a>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredPaymentsList.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-slate-500 font-sans">No disbursement vouchers registered match filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* EMPLOYEE LOAN MODULE */}
          {activePanel === 'loans' && currentUser.Role === 'Admin' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
              id="loans_ledger_container"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white">Employee Loans Program</h3>
                    <p className="text-xs text-slate-400">Manage internal corporate welfare loans, structure start dates and execute monthly deduction programs</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0 relative">
                    <AnimatePresence>
                      {loanSuccessMsg && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute bottom-full mb-3 right-0 bg-emerald-500 text-slate-950 text-[10px] font-bold py-2 px-4 rounded-xl shadow-xl whitespace-nowrap z-50 flex items-center"
                        >
                          <Check size={12} className="mr-2" />
                          {loanSuccessMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      onClick={triggerDeductionsIntegrator}
                      disabled={isSyncing}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 rounded-xl hover:bg-slate-850 hover:border-amber-500/10 transition flex items-center hover:cursor-pointer ${isSyncing ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <RefreshCw size={13} className={`mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Processing...' : 'Sync Loan Schedule'}
                    </button>
                    <button 
                      onClick={() => setActiveModal('addLoan')}
                      className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition hover:cursor-pointer"
                    >
                      + Issue Loan Account
                    </button>
                  </div>
                </div>

              {/* Data table */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-955/50 border-b border-slate-850">
                        <th className="p-5">Loan ID</th>
                        <th className="p-5">Employee Name</th>
                        <th className="p-5 text-right">Principal</th>
                        <th className="p-5 text-right font-black">Remaining Balance</th>
                        <th className="p-5 text-right">Deduction installment</th>
                        <th className="p-5 text-center">Issue Date</th>
                        <th className="p-5 text-center">Repayment Status</th>
                        <th className="p-5 text-right">Next Repayment Date</th>
                        <th className="p-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 font-medium">
                      {db.Employee_Loans.map((l, idx) => (
                        <tr key={`loan-row-${l.LoanID}-${idx}`} className="hover:bg-slate-905/70 transition">
                          <td className="p-5 font-mono text-slate-450 font-bold">{l.LoanID}</td>
                          <td className="p-5 text-white font-bold">{l.EmployeeName}</td>
                          <td className="p-5 text-right text-slate-400">৳{l.TotalLoanAmount.toLocaleString()}</td>
                          <td className="p-5 text-right text-white font-black text-sm">৳{l.RemainingBalance.toLocaleString()}</td>
                          <td className="p-5 text-right text-amber-400 font-semibold">৳{l.MonthlyDeductionAmount.toLocaleString()} / mo</td>
                          <td className="p-5 text-center font-mono text-slate-450">{l.StartDate}</td>
                          <td className="p-5 text-center">
                            <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wide font-black rounded-md border ${
                              l.Status === 'Active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15 animate-pulse'
                                : 'bg-slate-800 text-slate-450 border-slate-750'
                            }`}>
                              {l.Status}
                            </span>
                          </td>
                          <td className="p-5 text-right text-rose-300 font-bold font-mono text-xs">{l.NextRepaymentDate}</td>
                          <td className="p-5 text-right">
                            {l.Status === 'Active' && (
                              <button 
                                onClick={() => settleLoanEarly(l.LoanID)}
                                className="px-3 py-1.5 bg-slate-850 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center space-x-1.5 ml-auto group"
                              >
                                <Check size={12} className="group-hover:scale-125 transition-transform" />
                                <span>Settle</span>
                              </button>
                            )}
                            {l.Status === 'Paid' && (
                              <div className="flex items-center justify-end text-emerald-500/40 text-[9px] font-bold uppercase tracking-tighter italic">
                                Fully Closed
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* SPREADSHEET EDITOR MODULE */}
          {activePanel === 'sheets' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-4"
              id="spreadsheet_database_grid"
            >
              <SpreadsheetEditor 
                data={db} 
                onUpdate={updateDatabase} 
                onReset={resetDatabaseToDefault} 
              />
            </motion.div>
          )}

          {/* GO LIVE PLOTS INTERFACES */}
          {activePanel === 'deploy' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-4"
            >
              <AppsScriptPortal 
                customScriptUrl={customScriptUrl}
                isConnecting={isConnecting}
                onSaveScriptUrl={saveAppsScriptUrl}
                onDisableScriptUrl={disableAppsScriptUrl}
                onTestConnection={testAppsScriptConnection}
                onClearAllData={handleClearAllData}
              />
            </motion.div>
          )}

          {/* INVENTORY VALUATION PANEL */}
          {activePanel === 'inventoryValuation' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white mb-1">Product Stock & Upcoming Supply Chain Valuation</h3>
                  <p className="text-xs text-slate-400">Review stock portfolios, identify upcoming products/orders, and manage wholesale valuations.</p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setActiveModal('addInventory')}
                    className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition hover:cursor-pointer flex items-center"
                  >
                    <Package size={14} className="mr-1.5" />
                    + Add Product / Inventory
                  </button>
                </div>
              </div>

              {/* KPI metrics for valuation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Valuation (Buying Cost)</span>
                  <p className="text-2xl font-black text-white mt-1.5">৳{totalInventoryCostValuation.toLocaleString()}</p>
                  <span className="text-[10px] text-amber-400 font-semibold block mt-1">Direct warehouse asset value</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Valuation (Retail Selling)</span>
                  <p className="text-2xl font-black text-white mt-1.5">৳{totalInventorySellValuation.toLocaleString()}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Retail exit potential</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Expected Trade Profit</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1.5">৳{(totalInventorySellValuation - totalInventoryCostValuation).toLocaleString()}</p>
                  <span className="text-[10px] text-slate-450 block mt-1">Potential gross margin payout</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Bulk Stock Level</span>
                  <p className="text-2xl font-black text-white mt-1.5">{totalInventoryStockCount.toLocaleString()} pcs</p>
                  <span className="text-[10px] text-blue-400 block mt-1">Aggregate physical goods active</span>
                </div>
              </div>

              {/* Grid dividing Stock vs Upcoming */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Active Warehouse Stock (In Stock) */}
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">Active Warehouse Stock</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Products physically present in warehouses with direct active counts.</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-md font-bold">
                      {db.Inventory?.filter(i => (i.Stock || 0) > 0 && i.Status === 'In Stock').length || 0} Products
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {(!db.Inventory || db.Inventory.filter(i => (i.Stock || 0) > 0 && i.Status === 'In Stock').length === 0) ? (
                      <p className="text-xs text-slate-500 text-center py-12">No physical inventory items in stock at cost buying. Fill in form to restock.</p>
                    ) : (
                      db.Inventory.filter(i => (i.Stock || 0) > 0 && i.Status === 'In Stock').map((item, idx) => {
                        const itemVal = (item.Price || 0) * (item.Stock || 0);
                        return (
                          <div key={`active-${item.ProductID}-${idx}`} className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-850 rounded-xl transition-all">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={item.PhotoUrl} 
                                alt={item.ProductName} 
                                className="w-10 h-10 rounded-lg object-cover bg-slate-850 border border-slate-800"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-white">{item.ProductName}</h5>
                                <div className="flex items-center space-x-2 text-[10px] text-slate-450 mt-0.5">
                                  <span>{item.ProductID}</span>
                                  <span>•</span>
                                  <span className="inline-flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getHexForColor(item.Color) }} />
                                    <span>{item.Color}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-white">৳{itemVal.toLocaleString()}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{item.Stock} pcs @ ৳{item.Price}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Upcoming Supply Chain Pipelines */}
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">Upcoming & Transit Pipelines</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Products expected in transit, out of stock, or slated for soon release.</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-md font-bold">
                      {db.Inventory?.filter(i => (i.Stock || 0) === 0 || i.Status !== 'In Stock').length || 0} Products
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {(!db.Inventory || db.Inventory.filter(i => (i.Stock || 0) === 0 || i.Status !== 'In Stock').length === 0) ? (
                      <p className="text-xs text-slate-500 text-center py-12">No transit pipelines or upcoming items scheduled. Add upcoming products.</p>
                    ) : (
                      db.Inventory.filter(i => (i.Stock || 0) === 0 || i.Status !== 'In Stock').map((item, idx) => {
                        return (
                          <div key={`upcoming-${item.ProductID}-${idx}`} className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-850 rounded-xl transition-all">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={item.PhotoUrl} 
                                alt={item.ProductName} 
                                className="w-10 h-10 rounded-lg object-cover bg-slate-850 border border-slate-800"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-white">{item.ProductName}</h5>
                                <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                                  <span className={`px-1.5 py-0.2 text-[8px] uppercase font-black rounded border ${
                                    item.Status === 'Out of Stock'
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/15'
                                      : item.Status === 'Coming Soon'
                                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/15'
                                      : 'bg-blue-500/10 text-blue-400 border-blue-500/15'
                                  }`}>
                                    {item.Status}
                                  </span>
                                  <span>•</span>
                                  <span className="inline-flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getHexForColor(item.Color) }} />
                                    <span>{item.Color}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-white">৳{(item.Price || 0).toLocaleString()} (Unit)</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{item.Stock || 0} expected in warehouse</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TOTAL STOCK INVENTORY PANEL */}
          {activePanel === 'totalInventory' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white mb-1">Total Stock Warehouse Inventory</h3>
                  <p className="text-xs text-slate-400">Review retail sales listings, inspect pictures, and adjust active inventory levels directly.</p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setActiveModal('addInventory')}
                    className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition hover:cursor-pointer flex items-center"
                  >
                    <Package size={14} className="mr-1.5" />
                    + Add Product / Inventory
                  </button>
                </div>
              </div>

              {/* THE STATE BAR (Dynamic Horizontal Indicator filters) */}
              <div className="bg-slate-900 border border-slate-850 p-2 rounded-2xl grid grid-cols-2 md:grid-cols-6 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveInventoryFilter('All')}
                  className={`px-4 py-2.5 rounded-xl text-center transition-all hover:cursor-pointer ${
                    activeInventoryFilter === 'All' 
                      ? 'bg-slate-850 border border-slate-800 text-white font-bold shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-855'
                  }`}
                >
                  <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-black">All products</span>
                  <span className="text-base font-black text-white font-mono">{(db.Inventory || []).length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInventoryFilter('In Stock')}
                  className={`px-4 py-2.5 rounded-xl text-center transition-all hover:cursor-pointer ${
                    activeInventoryFilter === 'In Stock' 
                      ? 'bg-slate-850 border border-emerald-500/20 text-emerald-400 font-bold shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-855'
                  }`}
                >
                  <span className="block text-[8px] uppercase tracking-widest text-emerald-400 font-black">🟢 In Stock</span>
                  <span className="text-base font-black text-emerald-400 font-mono">{(db.Inventory || []).filter(i => i.Status === 'In Stock').length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInventoryFilter('Out of Stock')}
                  className={`px-4 py-2.5 rounded-xl text-center transition-all hover:cursor-pointer ${
                    activeInventoryFilter === 'Out of Stock' 
                      ? 'bg-slate-850 border border-rose-500/20 text-rose-405 font-bold shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-855'
                  }`}
                >
                  <span className="block text-[8px] uppercase tracking-widest text-rose-400 font-black">🔴 Out of Stock</span>
                  <span className="text-base font-black text-rose-400 font-mono">{(db.Inventory || []).filter(i => i.Status === 'Out of Stock').length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInventoryFilter('Coming Soon')}
                  className={`px-4 py-2.5 rounded-xl text-center transition-all hover:cursor-pointer ${
                    activeInventoryFilter === 'Coming Soon' 
                      ? 'bg-slate-850 border border-purple-500/20 text-purple-400 font-bold shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-855'
                  }`}
                >
                  <span className="block text-[8px] uppercase tracking-widest text-purple-450 font-black">🔮 Coming Soon</span>
                  <span className="text-base font-black text-purple-400 font-mono">{(db.Inventory || []).filter(i => i.Status === 'Coming Soon').length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInventoryFilter('Shipping')}
                  className={`px-4 py-2.5 rounded-xl text-center transition-all hover:cursor-pointer ${
                    activeInventoryFilter === 'Shipping' 
                      ? 'bg-slate-850 border border-blue-500/20 text-blue-400 font-bold shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-855'
                  }`}
                >
                  <span className="block text-[8px] uppercase tracking-widest text-blue-400 font-black">🚚 Shipping</span>
                  <span className="text-base font-black text-blue-400 font-mono">{(db.Inventory || []).filter(i => i.Status === 'Shipping').length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInventoryFilter('Other')}
                  className={`px-4 py-2.5 rounded-xl text-center transition-all hover:cursor-pointer ${
                    activeInventoryFilter === 'Other' 
                      ? 'bg-slate-850 border border-slate-550/20 text-slate-200 font-bold shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-855'
                  }`}
                >
                  <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-black">📁 Other</span>
                  <span className="text-base font-black text-slate-300 font-mono">{(db.Inventory || []).filter(i => i.Status !== 'In Stock' && i.Status !== 'Out of Stock' && i.Status !== 'Coming Soon' && i.Status !== 'Shipping').length}</span>
                </button>
              </div>

              {/* Products items list catalog cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(db.Inventory || [])
                  .filter(item => activeInventoryFilter === 'All' || item.Status === activeInventoryFilter || (activeInventoryFilter === 'Other' && item.Status !== 'In Stock' && item.Status !== 'Out of Stock' && item.Status !== 'Coming Soon' && item.Status !== 'Shipping'))
                  .map((item, idx) => {
                    return (
                      <div key={`${item.ProductID}-${idx}`} className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col group relative">
                        <div className="relative h-44 w-full bg-slate-950 overflow-hidden bg-radial from-slate-900 to-slate-955 flex items-center justify-center">
                          <img 
                            src={item.PhotoUrl} 
                            alt={item.ProductName} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                          <span className={`absolute top-3 right-3 px-2.5 py-0.5 text-[8px] uppercase tracking-widest font-black rounded-lg border ${
                            item.Status === 'In Stock'
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : item.Status === 'Out of Stock'
                              ? 'bg-rose-500 text-white border-rose-450'
                              : item.Status === 'Coming Soon'
                              ? 'bg-purple-500 text-white border-purple-400'
                              : 'bg-blue-500 text-white border-blue-400'
                          }`}>
                            {item.Status}
                          </span>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">{item.ProductID}</span>
                            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{item.ProductName}</h4>
                            
                            <div className="flex items-center space-x-2 text-xs pt-1.5">
                              <span className="text-slate-450">Color:</span>
                              <span className="inline-flex items-center space-x-1.5 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getHexForColor(item.Color) }} />
                                <span className="text-[10px] text-slate-350">{item.Color}</span>
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-slate-850/60 pt-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[9px] uppercase tracking-widest text-slate-450 font-bold block">Sell Price</span>
                                <span className="text-base font-black text-emerald-400 font-mono">৳{(item.SellPrice || 0).toLocaleString()}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] uppercase tracking-widest text-slate-450 font-bold block">Reserve Stock</span>
                                <span className="text-sm font-bold text-white font-mono">{(item.Stock || 0).toLocaleString()} pcs</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Stocks control interactions */}
                          <div className="flex items-center justify-between gap-2 border-t border-slate-850/60 pt-3">
                            <div className="flex items-center space-x-1 bg-slate-950/85 p-0.5 rounded-lg border border-slate-805">
                              <button 
                                type="button"
                                onClick={() => handleRestockProduct(item.ProductID, -1)}
                                className="w-6 h-6 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition hover:cursor-pointer"
                                title="Remove 1 unit"
                              >
                                -
                              </button>
                              <span className="text-[10px] font-mono font-bold text-slate-300 px-2">{item.Stock || 0}</span>
                              <button 
                                type="button"
                                onClick={() => handleRestockProduct(item.ProductID, 1)}
                                className="w-6 h-6 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition hover:cursor-pointer"
                                title="Add 1 unit"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Inline Quick states adjust selector */}
                              <select 
                                value={item.Status}
                                onChange={(e) => handleUpdateProductStatus(item.ProductID, e.target.value as any)}
                                className="bg-slate-950 text-[10px] text-slate-300 font-bold p-1 rounded-lg border border-slate-800 outline-none focus:border-slate-705 hover:cursor-pointer"
                              >
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Coming Soon">Coming Soon</option>
                                <option value="Shipping">Shipping</option>
                              </select>

                              {/* Delete option */}
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(item.ProductID)}
                                className="p-1 px-1.5 rounded-lg bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/40 text-rose-450 hover:cursor-pointer transition-colors"
                                title="Permanently delete record"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {(db.Inventory || []).filter(item => activeInventoryFilter === 'All' || item.Status === activeInventoryFilter || (activeInventoryFilter === 'Other' && item.Status !== 'In Stock' && item.Status !== 'Out of Stock' && item.Status !== 'Coming Soon' && item.Status !== 'Shipping')).length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900 border border-slate-850 rounded-2xl font-sans">
                    No products found with status "{activeInventoryFilter}". Click "+ Add Product / Inventory" to create one.
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* GLOBAL ACTIONS POPUP MODALS PANEL */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop cover overlay */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal('none')}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" 
            />

            {/* Modal Body Card Wrapper */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-50 overflow-hidden text-slate-800"
            >
              {/* Add Account Modal Layout */}
              {activeModal === 'addAccount' && (
                <form onSubmit={handleAddAccountSubmit} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Link New Corporate Channel</h3>
                    <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 hover:cursor-pointer"><X size={16} /></button>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Channel Name</label>
                    <input 
                      type="text" 
                      required 
                      value={newAccName}
                      onChange={(e) => setNewAccName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800" 
                      placeholder="e.g. Standard Chartered Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Account Identifier Number</label>
                    <input 
                      type="text" 
                      required 
                      value={newAccNumber}
                      onChange={(e) => setNewAccNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 font-mono" 
                      placeholder="e.g. 110-845-2921-01"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ledger opening reserves (৳)</label>
                    <input 
                      type="number" 
                      required 
                      value={newAccBalance}
                      onChange={(e) => setNewAccBalance(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800" 
                      placeholder="e.g. 245000"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Financial Channel Type</label>
                    <select 
                      value={newAccType}
                      onChange={(e) => setNewAccType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-700"
                    >
                      <option value="Bank">Bank Account</option>
                      <option value="Mobile Wallet">Mobile Wallet / Digital Cash</option>
                      <option value="Cash">Cash Vault</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-md hover:cursor-pointer">
                    Commit Account row
                  </button>
                </form>
              )}

              {/* Add Balance Deposit Form */}
              {activeModal === 'addBalance' && (
                <form onSubmit={handleAddBalanceSubmit} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Liquid Funding Injection</h3>
                    <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 hover:cursor-pointer"><X size={16} /></button>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Beneficiary Channel</label>
                    <select 
                      value={depositAccId}
                      onChange={(e) => setDepositAccId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-700"
                    >
                      {db.Bank_Accounts.map((b, idx) => (
                        <option key={`dep-opt-${b.AccountID}-${idx}`} value={b.AccountID}>{b.AccountName} (৳{b.CurrentBalance.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Funding Amount to Deposit (৳)</label>
                    <input 
                      type="number" 
                      required 
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800" 
                      placeholder="e.g. 150000"
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-md hover:cursor-pointer">
                    Post Funding Deposit
                  </button>
                </form>
              )}

              {/* Add Expenses Form with Auto deductions */}
              {activeModal === 'addExpense' && (
                <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Log Corporate Expense</h3>
                    <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 hover:cursor-pointer"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Clearance Date</label>
                      <input 
                        type="date" 
                        required 
                        value={expDate}
                        onChange={(e) => setExpDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Deduct Account</label>
                      <select 
                        value={expAccId}
                        onChange={(e) => setExpAccId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-2 text-xs focus:outline-none text-slate-700"
                      >
                        {db.Bank_Accounts.map((b, idx) => (
                          <option key={`exp-opt-${b.AccountID}-${idx}`} value={b.AccountID}>{b.AccountName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Audit Category</label>
                      <select 
                        value={expCategory}
                        onChange={(e) => setExpCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-2 text-xs focus:outline-none text-slate-700"
                      >
                        <option value="Inventory">Inventory Purchase</option>
                        <option value="Utilities">Utilities & Comm</option>
                        <option value="Marketing">Marketing / Ads</option>
                        <option value="Software / SaaS">Software & Cloud Hosting</option>
                        <option value="Logistics">Logistics & Freight</option>
                        <option value="Maintenance">Maintenance & Rent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Value Amount (৳)</label>
                      <input 
                        type="number" 
                        required 
                        value={expAmount}
                        onChange={(e) => setExpAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800" 
                        placeholder="e.g. 14500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Description / specs</label>
                    <textarea 
                      required 
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 resize-none" 
                      placeholder="e.g. Bulk packaging box batch #4"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">Receipt Image Attachment File</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, false)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-500 focus:outline-none"
                    />
                    {receiptFileName && <p className="text-[10px] text-emerald-650 font-mono mt-1">✓ File processed: {receiptFileName}</p>}
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-md hover:cursor-pointer mt-2">
                    Execute ledger transaction
                  </button>
                </form>
              )}

              {/* Add Payment Voucher Form */}
              {activeModal === 'addPayment' && (
                <form onSubmit={handleAddPaymentSubmit} className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">New Disbursal Voucher</h3>
                    <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 hover:cursor-pointer"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Disbursal Date</label>
                      <input 
                        type="date" 
                        required 
                        value={pmtDate}
                        onChange={(e) => setPmtDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Beneficiary Vendor</label>
                      <input 
                        type="text" 
                        required 
                        value={pmtPaidTo}
                        onChange={(e) => setPmtPaidTo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-800"
                        placeholder="e.g. Apex Freight"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Payment Method</label>
                      <select 
                        value={pmtMethod}
                        onChange={(e) => setPmtMethod(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-2 text-xs focus:outline-none text-slate-700"
                      >
                        <option value="Bank Transfer">Bank Wire Transfer</option>
                        <option value="Corporate Card">Visa Business Card</option>
                        <option value="Mobile Pay">Mobile Business Account</option>
                        <option value="Petty Cash">Cash vault Drawer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Audit Category</label>
                      <select 
                        value={pmtCategory}
                        onChange={(e) => setPmtCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-2 text-xs focus:outline-none text-slate-700"
                      >
                        <option value="Inventory">Inventory Repayment</option>
                        <option value="Utilities">Rent / Power / Telco</option>
                        <option value="Maintenance">Vendor payments</option>
                        <option value="Logistics">Forwarding Logistics</option>
                        <option value="Software / SaaS">Software Subscriptions</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Deduct Channel</label>
                      <select 
                        value={pmtAccId}
                        onChange={(e) => setPmtAccId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-2 text-xs focus:outline-none text-slate-700"
                      >
                        {db.Bank_Accounts.map((b, idx) => (
                          <option key={`pmt-opt-${b.AccountID}-${idx}`} value={b.AccountID}>{b.AccountName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Payment Status</label>
                      <select 
                        value={pmtStatus}
                        onChange={(e) => setPmtStatus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-2 text-xs focus:outline-none text-slate-700"
                      >
                        <option value="Cleared">Cleared & Posted</option>
                        <option value="Pending Clearance">Awaiting bank settlement</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Value Amount (৳)</label>
                    <input 
                      type="number" 
                      required 
                      value={pmtAmount}
                      onChange={(e) => setPmtAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">Supporting Invoice Document file</label>
                    <input 
                      type="file" 
                      onChange={(e) => handleFileChange(e, true)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-505 focus:outline-none"
                    />
                    {pmtFileName && <p className="text-[10px] text-emerald-650 font-mono mt-1">✓ File processed: {pmtFileName}</p>}
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-md hover:cursor-pointer">
                    Publish disbursement voucher
                  </button>
                </form>
              )}

              {/* Issue Employee welfare Loan Form */}
              {activeModal === 'addLoan' && (
                <form onSubmit={handleAddLoanSubmit} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Establish Welfare Loan</h3>
                    <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 hover:cursor-pointer"><X size={16} /></button>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Employee Full Name (User)</label>
                    <input 
                      type="text" 
                      required 
                      value={loanEmpName}
                      onChange={(e) => setLoanEmpName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800"
                      placeholder="e.g. Alisha Rahman"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-sans">Principal Amount (৳)</label>
                      <input 
                        type="number" 
                        required 
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-sans">Deduction term (Months)</label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        max="60"
                        value={loanMonths}
                        onChange={(e) => setLoanMonths(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800"
                        placeholder="e.g. 12" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-sans">Deduction release day schedule</label>
                    <input 
                      type="date" 
                      required 
                      value={loanRepayDate}
                      onChange={(e) => setLoanRepayDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-sans font-semibold">Disbursement Source Account (৳)</label>
                    <select 
                      value={loanAccId}
                      onChange={(e) => setLoanAccId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-2 text-xs focus:outline-none text-slate-700"
                    >
                      {db.Bank_Accounts.map((b, idx) => (
                        <option key={`loan-opt-${b.AccountID}-${idx}`} value={b.AccountID}>
                          {b.AccountName} ({b.AccountType}) — Balance: ৳{(b.CurrentBalance || 0).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-md hover:cursor-pointer">
                    Issue Welfare Loan Account
                  </button>
                </form>
              )}

              {/* Add Product / Inventory Item Form */}
              {activeModal === 'addInventory' && (
                <form onSubmit={handleAddInventorySubmit} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Add Product Valuation item</h3>
                    <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 hover:cursor-pointer"><X size={16} /></button>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Product Name</label>
                    <input 
                      type="text" 
                      required 
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800"
                      placeholder="e.g. Leather Wallet Blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Product Photo URL</label>
                    <input 
                      type="url" 
                      value={newProdPhotoUrl}
                      onChange={(e) => setNewProdPhotoUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800"
                      placeholder="e.g. https://images.unsplash.com/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Cost Price (৳)</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        value={newProdPrice}
                        onChange={(e) => {
                          setNewProdPrice(e.target.value);
                          if (!newProdSellPrice) {
                            const val = parseFloat(e.target.value) || 0;
                            setNewProdSellPrice(Math.round(val * 1.5).toString());
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Retail Sell Price (৳)</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        value={newProdSellPrice}
                        onChange={(e) => setNewProdSellPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Initial Stock (pcs)</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Color Accent</label>
                      <select 
                        value={newProdColor}
                        onChange={(e) => setNewProdColor(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-700"
                      >
                        {Object.keys(colorHexMap).map(colName => (
                          <option key={colName} value={colName}>{colName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Current Pipeline Status</label>
                    <select 
                      value={newProdStatus}
                      onChange={(e) => setNewProdStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-700"
                    >
                      <option value="In Stock">In Stock (physically present)</option>
                      <option value="Out of Stock">Out of Stock (no reserve counts)</option>
                      <option value="Coming Soon">Coming Soon (re-order/slated design)</option>
                      <option value="Shipping">Shipping (transit supply line)</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-md hover:cursor-pointer flex items-center justify-center">
                    <Package size={14} className="mr-1.5" />
                    Publish Product Item
                  </button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
