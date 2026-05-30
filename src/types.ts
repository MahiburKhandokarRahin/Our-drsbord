export interface UserRow {
  Username: string;
  PasswordHash: string; // Plaintext or hashed for simulation, we'll keep it secure
  Role: 'Admin' | 'Manager';
}

export interface BankAccountRow {
  AccountID: string;
  AccountName: string;
  AccountNumber: string;
  CurrentBalance: number;
  AccountType: 'Bank' | 'Mobile Wallet' | 'Cash';
}

export interface ExpenseRow {
  Timestamp: string;
  ExpenseID: string;
  Date: string;
  Category: string;
  Amount: number;
  AccountID: string;
  Description: string;
  ReceiptDriveLink: string;
}

export interface PaymentRow {
  Timestamp: string;
  PaymentID: string;
  Date: string;
  PaidTo: string;
  Amount: number;
  Category: string;
  PaymentMethod: string;
  Status: string;
  DocumentDriveLink: string;
}

export interface EmployeeLoanRow {
  LoanID: string;
  EmployeeName: string;
  TotalLoanAmount: number;
  RemainingBalance: number;
  MonthlyDeductionAmount: number;
  StartDate: string;
  Status: 'Active' | 'Paid';
  NextRepaymentDate: string;
}

export interface InventoryItemRow {
  ProductID: string;
  ProductName: string;
  PhotoUrl: string;
  Price: number; // Product valuation / Cost Price in BDT
  SellPrice: number; // Customer Sale Price in BDT
  Stock: number;
  Color: string;
  Status: 'In Stock' | 'Out of Stock' | 'Coming Soon' | 'Shipping' | 'Other';
}

export interface SpreadsheetData {
  Users: UserRow[];
  Bank_Accounts: BankAccountRow[];
  Expenses: ExpenseRow[];
  Payments: PaymentRow[];
  Employee_Loans: EmployeeLoanRow[];
  Inventory: InventoryItemRow[];
}
