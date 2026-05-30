import { SpreadsheetData, UserRow, BankAccountRow, ExpenseRow, PaymentRow, EmployeeLoanRow } from './types';

const INITIAL_DATA: SpreadsheetData = {
  Users: [
    { Username: 'admin', PasswordHash: 'admin123', Role: 'Admin' },
    { Username: 'manager', PasswordHash: 'manager123', Role: 'Manager' }
  ],
  Bank_Accounts: [
    { AccountID: 'ACC-001', AccountName: 'Standard Chartered Operating', AccountNumber: '110-845-2921-01', CurrentBalance: 2450000, AccountType: 'Bank' },
    { AccountID: 'ACC-002', AccountName: 'bKash Corporate Merchant', AccountNumber: '01712345678', CurrentBalance: 320000, AccountType: 'Mobile Wallet' },
    { AccountID: 'ACC-003', AccountName: 'Petty Cash Safe', AccountNumber: 'CASH-VAULT-03', CurrentBalance: 45000, AccountType: 'Cash' },
    { AccountID: 'ACC-004', AccountName: 'HSBC Treasury Account', AccountNumber: '500-112-901-088', CurrentBalance: 1250000, AccountType: 'Bank' }
  ],
  Expenses: [
    { Timestamp: '2026-05-15T09:30:00Z', ExpenseID: 'EXP-101', Date: '2026-05-15', Category: 'Inventory', Amount: 145000, AccountID: 'ACC-001', Description: 'Raw materials bulk replenishment', ReceiptDriveLink: 'https://drive.google.com/open?id=1AbCD_eFGhIJkbLMNoPQRsTuVWxyZ' },
    { Timestamp: '2026-05-18T14:15:00Z', ExpenseID: 'EXP-102', Date: '2026-05-18', Category: 'Utilities', Amount: 18500, AccountID: 'ACC-003', Description: 'Office high-speed fiber internet & power', ReceiptDriveLink: 'https://drive.google.com/open?id=2AbCD_eFGhIJkbLMNoPQRsTuVWxyZ' },
    { Timestamp: '2026-05-20T11:00:00Z', ExpenseID: 'EXP-103', Date: '2026-05-20', Category: 'Marketing', Amount: 75000, AccountID: 'ACC-002', Description: 'Social media growth ad campaign (Q2)', ReceiptDriveLink: 'https://drive.google.com/open?id=3AbCD_eFGhIJkbLMNoPQRsTuVWxyZ' },
    { Timestamp: '2026-05-22T16:45:00Z', ExpenseID: 'EXP-104', Date: '2026-05-22', Category: 'Software / SaaS', Amount: 32000, AccountID: 'ACC-001', Description: 'Enterprise Cloud Server hosting subscription', ReceiptDriveLink: 'https://drive.google.com/open?id=4AbCD_eFGhIJkbLMNoPQRsTuVWxyZ' },
    { Timestamp: '2026-05-25T10:10:00Z', ExpenseID: 'EXP-105', Date: '2026-05-25', Category: 'Inventory', Amount: 120000, AccountID: 'ACC-004', Description: 'Packaging boxes purchase order', ReceiptDriveLink: 'https://drive.google.com/open?id=5AbCD_eFGhIJkbLMNoPQRsTuVWxyZ' }
  ],
  Payments: [
    { Timestamp: '2026-05-10T12:00:00Z', PaymentID: 'PMT-501', Date: '2026-05-10', PaidTo: 'Figma Inc', Amount: 12500, Category: 'Software / SaaS', PaymentMethod: 'Corporate Card', Status: 'Cleared', DocumentDriveLink: 'https://drive.google.com/open?id=6AbCD_eFGhIJkbLMNoPQRsTuVWxyZ' },
    { Timestamp: '2026-05-14T10:30:00Z', PaymentID: 'PMT-502', Date: '2026-05-14', PaidTo: 'CleanOffice Services', Amount: 8000, Category: 'Maintenance', PaymentMethod: 'Petty Cash', Status: 'Cleared', DocumentDriveLink: 'https://drive.google.com/open?id=7AbCD_eFGhIJkbLMNoPQRsTuVWxyZ' },
    { Timestamp: '2026-05-26T15:00:00Z', PaymentID: 'PMT-503', Date: '2026-05-26', PaidTo: 'Apex Logistics', Amount: 62000, Category: 'Logistics', PaymentMethod: 'Bank Transfer', Status: 'Pending Clearance', DocumentDriveLink: 'https://drive.google.com/open?id=8AbCD_eFGhIJkbLMNoPQRsTuVWxyZ' }
  ],
  Employee_Loans: [
    { LoanID: 'LON-5001', EmployeeName: 'Alisha Rahman', TotalLoanAmount: 150000, RemainingBalance: 90000, MonthlyDeductionAmount: 15000, StartDate: '2026-01-01', Status: 'Active', NextRepaymentDate: '2026-06-01' },
    { LoanID: 'LON-5002', EmployeeName: 'Zubair Hossain', TotalLoanAmount: 80000, RemainingBalance: 20000, MonthlyDeductionAmount: 10000, StartDate: '2026-02-15', Status: 'Active', NextRepaymentDate: '2026-05-30' },
    { LoanID: 'LON-5003', EmployeeName: 'Rezaul Karim', TotalLoanAmount: 200000, RemainingBalance: 200000, MonthlyDeductionAmount: 20000, StartDate: '2026-05-28', Status: 'Active', NextRepaymentDate: '2026-06-28' },
    { LoanID: 'LON-5004', EmployeeName: 'Sajia Islam', TotalLoanAmount: 60000, RemainingBalance: 0, MonthlyDeductionAmount: 10000, StartDate: '2025-10-10', Status: 'Paid', NextRepaymentDate: '2026-04-10' }
  ],
  Inventory: [
    { ProductID: 'PRD-9001', ProductName: 'Minimalist Slim Leather Wallet', PhotoUrl: 'https://images.unsplash.com/photo-1627124709713-b836d62d4ad0?auto=format&fit=crop&q=80&w=300', Price: 1200, SellPrice: 1950, Stock: 45, Color: 'Amber Brown', Status: 'In Stock' },
    { ProductID: 'PRD-9002', ProductName: 'Mechanical Keyboard TKL Red Switch', PhotoUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=300', Price: 4500, SellPrice: 6800, Stock: 20, Color: 'Matte Black', Status: 'In Stock' },
    { ProductID: 'PRD-9003', ProductName: 'Active Noise Cancelling Earbuds', PhotoUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=300', Price: 3200, SellPrice: 4900, Stock: 0, Color: 'Arctic White', Status: 'Out of Stock' },
    { ProductID: 'PRD-9004', ProductName: 'Ergonomic Mesh Desk Chair Pro', PhotoUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=300', Price: 12000, SellPrice: 18550, Stock: 15, Color: 'Slate Gray', Status: 'Coming Soon' },
    { ProductID: 'PRD-9005', ProductName: 'Premium Leather Messenger Bag', PhotoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300', Price: 3500, SellPrice: 5500, Stock: 8, Color: 'Crimson Red', Status: 'Shipping' }
  ]
};

const STORAGE_KEY = 'cuteriaa_vibe_dashboard_db';

export class LocalDatabase {
  static get(): SpreadsheetData {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    try {
      return JSON.parse(data);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
  }

  static save(data: SpreadsheetData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
}
