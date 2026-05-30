/**
 * Cuteriaa Vibe Financial Dashboard - Google Apps Script Backend (Code.gs)
 * This script runs in Google Apps Script and interfaces directly with Google Sheets and Google Drive.
 */

function doGet(e) {
  // Check if it's an API request
  if (e && e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    var result = { success: false };
    try {
      if (action === 'getData') {
        result = { success: true, data: getSpreadsheetData() };
      } else if (action === 'test') {
        result = { success: true, data: { status: "connected" } };
      } else if (action === 'verifyUser') {
        result = verifyUser(e.parameter.username, e.parameter.password);
      } else if (action === 'addBankAccount') {
        result = addBankAccount(e.parameter.name, e.parameter.number, e.parameter.balance, e.parameter.type);
      } else if (action === 'injectFunds') {
        result = injectFunds(e.parameter.accountId, e.parameter.amount);
      } else if (action === 'logExpense') {
        result = logExpense(
          e.parameter.date,
          e.parameter.category,
          e.parameter.amount,
          e.parameter.accountId,
          e.parameter.description,
          e.parameter.base64File || "",
          e.parameter.fileName || ""
        );
      } else if (action === 'logPayment') {
        result = logPayment(
          e.parameter.date,
          e.parameter.paidTo,
          e.parameter.amount,
          e.parameter.category,
          e.parameter.paymentMethod,
          e.parameter.status,
          e.parameter.accountId,
          e.parameter.base64File || "",
          e.parameter.fileName || ""
        );
      } else if (action === 'issueEmployeeLoan') {
        result = issueEmployeeLoan(e.parameter.employeeName, e.parameter.totalLoanAmount, e.parameter.startRepaymentDate, e.parameter.repaymentTermMonths, e.parameter.accountId);
      } else if (action === 'runLoanRepaymentSchedule') {
        result = runLoanRepaymentSchedule();
      } else if (action === 'addInventoryProduct') {
        result = addInventoryProduct(
          e.parameter.productId,
          e.parameter.productName,
          e.parameter.photoUrl,
          e.parameter.price,
          e.parameter.sellPrice,
          e.parameter.stock,
          e.parameter.color,
          e.parameter.status
        );
      } else if (action === 'updateInventoryProduct') {
        result = updateInventoryProduct(e.parameter.productId, e.parameter.stock, e.parameter.status);
      } else if (action === 'deleteInventoryProduct') {
        result = deleteInventoryProduct(e.parameter.productId);
      }
    } catch (err) {
      result = { success: false, error: err.toString() };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Cuteriaa Vibe Financial Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  var result = { success: false };
  try {
    var postData;
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      postData = e.parameter;
    }
    
    var action = postData.action;
    if (action === 'syncFullDatabase') {
      result = saveFullDatabase(postData.db);
    } else if (action === 'verifyUser') {
      result = verifyUser(postData.username, postData.password);
    } else if (action === 'addBankAccount') {
      result = addBankAccount(postData.name, postData.number, postData.balance, postData.type);
    } else if (action === 'injectFunds') {
      result = injectFunds(postData.accountId, postData.amount);
    } else if (action === 'logExpense') {
      result = logExpense(
        postData.date,
        postData.category,
        postData.amount,
        postData.accountId,
        postData.description,
        postData.base64File || "",
        postData.fileName || ""
      );
    } else if (action === 'logPayment') {
      result = logPayment(
        postData.date,
        postData.paidTo,
        postData.amount,
        postData.category,
        postData.paymentMethod,
        postData.status,
        postData.accountId,
        postData.base64File || "",
        postData.fileName || ""
      );
    } else if (action === 'issueEmployeeLoan') {
      result = issueEmployeeLoan(postData.employeeName, postData.totalLoanAmount, postData.startRepaymentDate, postData.repaymentTermMonths, postData.accountId);
    } else if (action === 'runLoanRepaymentSchedule') {
      result = runLoanRepaymentSchedule();
    } else if (action === 'addInventoryProduct') {
      result = addInventoryProduct(
        postData.productId,
        postData.productName,
        postData.photoUrl,
        postData.price,
        postData.sellPrice,
        postData.stock,
        postData.color,
        postData.status
      );
    } else if (action === 'updateInventoryProduct') {
      result = updateInventoryProduct(postData.productId, postData.stock, postData.status);
    } else if (action === 'deleteInventoryProduct') {
      result = deleteInventoryProduct(postData.productId);
    } else {
      result = { success: false, error: "Action not recognized in doPost" };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Bulk overwrite sheets for direct cell grid database updates
function saveFullDatabase(db) {
  if (!db) return { success: false, error: "No database payload" };
  
  if (db.Bank_Accounts) {
    var sheet = getOrCreateSheet('Bank_Accounts', ['AccountID', 'AccountName', 'AccountNumber', 'CurrentBalance', 'AccountType']);
    sheet.clearContents();
    sheet.appendRow(['AccountID', 'AccountName', 'AccountNumber', 'CurrentBalance', 'AccountType']);
    db.Bank_Accounts.forEach(function(row) {
      sheet.appendRow([row.AccountID, row.AccountName, row.AccountNumber, Number(row.CurrentBalance), row.AccountType]);
    });
  }
  
  if (db.Expenses) {
    var sheet = getOrCreateSheet('Expenses', ['Timestamp', 'ExpenseID', 'Date', 'Category', 'Amount', 'AccountID', 'Description', 'ReceiptDriveLink']);
    sheet.clearContents();
    sheet.appendRow(['Timestamp', 'ExpenseID', 'Date', 'Category', 'Amount', 'AccountID', 'Description', 'ReceiptDriveLink']);
    db.Expenses.forEach(function(row) {
      sheet.appendRow([row.Timestamp, row.ExpenseID, row.Date, row.Category, Number(row.Amount), row.AccountID, row.Description, row.ReceiptDriveLink]);
    });
  }
  
  if (db.Payments) {
    var sheet = getOrCreateSheet('Payments', ['Timestamp', 'PaymentID', 'Date', 'PaidTo', 'Amount', 'Category', 'PaymentMethod', 'Status', 'DocumentDriveLink']);
    sheet.clearContents();
    sheet.appendRow(['Timestamp', 'PaymentID', 'Date', 'PaidTo', 'Amount', 'Category', 'PaymentMethod', 'Status', 'DocumentDriveLink']);
    db.Payments.forEach(function(row) {
      sheet.appendRow([row.Timestamp, row.PaymentID, row.Date, row.PaidTo, Number(row.Amount), row.Category, row.PaymentMethod, row.Status, row.DocumentDriveLink]);
    });
  }
  
  if (db.Employee_Loans) {
    var sheet = getOrCreateSheet('Employee_Loans', ['LoanID', 'EmployeeName', 'TotalLoanAmount', 'RemainingBalance', 'MonthlyDeductionAmount', 'StartDate', 'Status', 'NextRepaymentDate']);
    sheet.clearContents();
    sheet.appendRow(['LoanID', 'EmployeeName', 'TotalLoanAmount', 'RemainingBalance', 'MonthlyDeductionAmount', 'StartDate', 'Status', 'NextRepaymentDate']);
    db.Employee_Loans.forEach(function(row) {
      sheet.appendRow([row.LoanID, row.EmployeeName, Number(row.TotalLoanAmount), Number(row.RemainingBalance), Number(row.MonthlyDeductionAmount), row.StartDate, row.Status, row.NextRepaymentDate]);
    });
  }
  
  if (db.Inventory) {
    var sheet = getOrCreateSheet('Inventory', ['ProductID', 'ProductName', 'PhotoUrl', 'Price', 'SellPrice', 'Stock', 'Color', 'Status']);
    sheet.clearContents();
    sheet.appendRow(['ProductID', 'ProductName', 'PhotoUrl', 'Price', 'SellPrice', 'Stock', 'Color', 'Status']);
    db.Inventory.forEach(function(row) {
      sheet.appendRow([row.ProductID, row.ProductName, row.PhotoUrl, Number(row.Price), Number(row.SellPrice), Number(row.Stock), row.Color, row.Status]);
    });
  }
  
  return { success: true };
}

// Helper to get active sheet or create structured sheets if they do not exist
function getOrCreateSheet(sheetName, defaultHeaders) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(defaultHeaders);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold").setBackground("#e2e8f0");
  }
  return sheet;
}

// Standard data mapping utilities
function getSheetRowsAsObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    var hasContent = false;
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      if (val !== undefined && val !== "") hasContent = true;
      row[headers[j]] = val;
    }
    if (hasContent) {
      row["_rowNum"] = i + 1; // 1-based, index 0 is row 1
      rows.push(row);
    }
  }
  return rows;
}

// Core Function: Retrieve All Dashboard Data
function getSpreadsheetData() {
  var data = {};
  
  var usersSheet = getOrCreateSheet('Users', ['Username', 'PasswordHash', 'Role']);
  var bankSheet = getOrCreateSheet('Bank_Accounts', ['AccountID', 'AccountName', 'AccountNumber', 'CurrentBalance', 'AccountType']);
  var expensesSheet = getOrCreateSheet('Expenses', ['Timestamp', 'ExpenseID', 'Date', 'Category', 'Amount', 'AccountID', 'Description', 'ReceiptDriveLink']);
  var paymentsSheet = getOrCreateSheet('Payments', ['Timestamp', 'PaymentID', 'Date', 'PaidTo', 'Amount', 'Category', 'PaymentMethod', 'Status', 'DocumentDriveLink']);
  var loansSheet = getOrCreateSheet('Employee_Loans', ['LoanID', 'EmployeeName', 'TotalLoanAmount', 'RemainingBalance', 'MonthlyDeductionAmount', 'StartDate', 'Status', 'NextRepaymentDate']);
  var inventorySheet = getOrCreateSheet('Inventory', ['ProductID', 'ProductName', 'PhotoUrl', 'Price', 'SellPrice', 'Stock', 'Color', 'Status']);
  
  // Create default admin user if sheet is empty
  if (usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow(['admin', 'admin123', 'Admin']);
    usersSheet.appendRow(['manager', 'manager123', 'Manager']);
  }

  // Create default items in Inventory sheet if empty
  if (inventorySheet.getLastRow() <= 1) {
    inventorySheet.appendRow(['PROD-101', 'Cuteria Bomber Tech Jacket', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop', 12000, 18000, 45, 'Matte Black', 'In Stock']);
    inventorySheet.appendRow(['PROD-102', 'Premium Saffiano Leather Wallet', 'https://images.unsplash.com/photo-1627123424558-812d7a22a30b?w=500&auto=format&fit=crop', 3500, 5200, 120, 'Amber Brown', 'In Stock']);
    inventorySheet.appendRow(['PROD-103', 'Cuteria Streetwear Hoodie', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop', 4200, 6500, 15, 'Midnight Purple', 'In Stock']);
    inventorySheet.appendRow(['PROD-104', 'Pro-Fit Tech Running Shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop', 8500, 12000, 8, 'Crimson Red', 'In Stock']);
    inventorySheet.appendRow(['PROD-105', 'Polarized Hex Aviator Sunglasses', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop', 2900, 4350, 0, 'Royal Blue', 'Coming Soon']);
    inventorySheet.appendRow(['PROD-106', 'Executive Brass Mechanical Pen', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop', 1900, 2800, 0, 'Slate Gray', 'Out of Stock']);
  }
  
  data.Users = getSheetRowsAsObjects(usersSheet);
  data.Bank_Accounts = getSheetRowsAsObjects(bankSheet);
  data.Expenses = getSheetRowsAsObjects(expensesSheet);
  data.Payments = getSheetRowsAsObjects(paymentsSheet);
  data.Employee_Loans = getSheetRowsAsObjects(loansSheet);
  data.Inventory = getSheetRowsAsObjects(inventorySheet);
  
  return data;
}

// Core Function: Secure Authentication
function verifyUser(username, password) {
  var usersSheet = getOrCreateSheet('Users', ['Username', 'PasswordHash', 'Role']);
  var users = getSheetRowsAsObjects(usersSheet);
  
  for (var i = 0; i < users.length; i++) {
    if (users[i].Username.toString().toLowerCase() === username.toLowerCase() && 
        users[i].PasswordHash.toString() === password) {
      return {
        success: true,
        username: users[i].Username,
        role: users[i].Role
      };
    }
  }
  return { success: false, error: "Invalid username or password" };
}

// Helper Function: Retrieve or Create Designated Google Drive Folder
function getReceiptsFolder() {
  var folderName = "Cuteriaa_Vibe_Financial_Receipts";
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    var folder = DriveApp.createFolder(folderName);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return folder;
  }
}

// Helper Function: Parse and save Base64 file directly to Google Drive
function saveFileToDrive(base64Data, fileName) {
  if (!base64Data || !fileName) return "";
  try {
    var rawData = base64Data.split(",")[1] || base64Data;
    var decoded = Utilities.base64Decode(rawData);
    var blob = Utilities.newBlob(decoded, "image/jpeg", fileName);
    
    var folder = getReceiptsFolder();
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (err) {
    Logger.log("Error uploading file: " + err.toString());
    return "Error Uploading File";
  }
}

// Core Function: Add Bank Account
function addBankAccount(accountName, accountNumber, currentBalance, accountType) {
  var sheet = getOrCreateSheet('Bank_Accounts', ['AccountID', 'AccountName', 'AccountNumber', 'CurrentBalance', 'AccountType']);
  var accountId = "ACC-" + Math.floor(1000 + Math.random() * 9000);
  
  sheet.appendRow([
    accountId,
    accountName,
    accountNumber,
    Number(currentBalance),
    accountType
  ]);
  
  return { success: true, accountValue: accountId };
}

// Core Function: Add Balance (Injected Funds)
function injectFunds(accountId, amount) {
  var sheet = getOrCreateSheet('Bank_Accounts', ['AccountID', 'AccountName', 'AccountNumber', 'CurrentBalance', 'AccountType']);
  var accounts = getSheetRowsAsObjects(sheet);
  
  for (var i = 0; i < accounts.length; i++) {
    if (accounts[i].AccountID === accountId) {
      var row = accounts[i]._rowNum;
      var currentVal = Number(accounts[i].CurrentBalance) || 0;
      var newVal = currentVal + Number(amount);
      
      sheet.getRange(row, 4).setValue(newVal); // CurrentBalance is column 4
      return { success: true, updatedBalance: newVal };
    }
  }
  return { success: false, error: "Account not found" };
}

// Core Function: Log Expense
function logExpense(date, category, amount, accountId, description, base64File, fileName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var expensesSheet = getOrCreateSheet('Expenses', ['Timestamp', 'ExpenseID', 'Date', 'Category', 'Amount', 'AccountID', 'Description', 'ReceiptDriveLink']);
  var bankSheet = getOrCreateSheet('Bank_Accounts', ['AccountID', 'AccountName', 'AccountNumber', 'CurrentBalance', 'AccountType']);
  
  var expenseId = "EXP-" + Math.floor(10000 + Math.random() * 90000);
  var timestamp = new Date().toISOString();
  
  // 1. Upload receipt to Google Drive if provided
  var fileUrl = "";
  if (base64File && fileName) {
    fileUrl = saveFileToDrive(base64File, "Receipt_" + expenseId + "_" + fileName);
  }
  
  // 2. Add Expense row
  expensesSheet.appendRow([
    timestamp,
    expenseId,
    date,
    category,
    Number(amount),
    accountId,
    description,
    fileUrl
  ]);
  
  // 3. Balance Autodeduction from Bank Account
  var bankAccounts = getSheetRowsAsObjects(bankSheet);
  for (var i = 0; i < bankAccounts.length; i++) {
    if (bankAccounts[i].AccountID === accountId) {
      var row = bankAccounts[i]._rowNum;
      var currentBalance = Number(bankAccounts[i].CurrentBalance) || 0;
      var newBalance = currentBalance - Number(amount);
      bankSheet.getRange(row, 4).setValue(newBalance); // Deduct balance
      break;
    }
  }
  
  return { success: true, expenseId: expenseId };
}

// Core Function: Log Bank/Cash Payment
function logPayment(date, paidTo, amount, category, paymentMethod, status, accountId, base64File, fileName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var paymentsSheet = getOrCreateSheet('Payments', ['Timestamp', 'PaymentID', 'Date', 'PaidTo', 'Amount', 'Category', 'PaymentMethod', 'Status', 'DocumentDriveLink']);
  var bankSheet = getOrCreateSheet('Bank_Accounts', ['AccountID', 'AccountName', 'AccountNumber', 'CurrentBalance', 'AccountType']);
  
  var paymentId = "PMT-" + Math.floor(10000 + Math.random() * 90000);
  var timestamp = new Date().toISOString();
  
  // 1. Upload receipt to Google Drive if provided
  var fileUrl = "";
  if (base64File && fileName) {
    fileUrl = saveFileToDrive(base64File, "Payment_" + paymentId + "_" + fileName);
  }
  
  // 2. Add Payment row
  paymentsSheet.appendRow([
    timestamp,
    paymentId,
    date,
    paidTo,
    Number(amount),
    category,
    paymentMethod,
    status,
    fileUrl
  ]);
  
  // 3. Balance Autodeduction from Bank Account
  if (accountId) {
    var bankAccounts = getSheetRowsAsObjects(bankSheet);
    for (var i = 0; i < bankAccounts.length; i++) {
      if (bankAccounts[i].AccountID === accountId) {
        var row = bankAccounts[i]._rowNum;
        var currentBalance = Number(bankAccounts[i].CurrentBalance) || 0;
        var newBalance = currentBalance - Number(amount);
        bankSheet.getRange(row, 4).setValue(newBalance);
        break;
      }
    }
  }
  
  return { success: true, paymentId: paymentId };
}

// Core Function: Issue Employee Loan
function issueEmployeeLoan(employeeName, totalLoanAmount, startRepaymentDate, repaymentTermMonths, accountId) {
  var sheet = getOrCreateSheet('Employee_Loans', ['LoanID', 'EmployeeName', 'TotalLoanAmount', 'RemainingBalance', 'MonthlyDeductionAmount', 'StartDate', 'Status', 'NextRepaymentDate']);
  var bankSheet = getOrCreateSheet('Bank_Accounts', ['AccountID', 'AccountName', 'AccountNumber', 'CurrentBalance', 'AccountType']);
  var loanId = "LON-" + Math.floor(10000 + Math.random() * 90000);
  
  var monthlyDeduction = Number(totalLoanAmount) / Number(repaymentTermMonths);
  
  sheet.appendRow([
    loanId,
    employeeName,
    Number(totalLoanAmount),
    Number(totalLoanAmount),
    Math.round(monthlyDeduction * 100) / 100,
    new Date().toISOString().split('T')[0],
    'Active',
    startRepaymentDate
  ]);

  if (accountId) {
    var bankAccounts = getSheetRowsAsObjects(bankSheet);
    for (var i = 0; i < bankAccounts.length; i++) {
      if (bankAccounts[i].AccountID === accountId) {
        var row = bankAccounts[i]._rowNum;
        var currentBalance = Number(bankAccounts[i].CurrentBalance) || 0;
        var newBalance = currentBalance - Number(totalLoanAmount);
        bankSheet.getRange(row, 4).setValue(newBalance);
        break;
      }
    }
  }
  
  return { success: true, loanId: loanId };
}

// Core Function: Automated Repayment Scheduler
function runLoanRepaymentSchedule() {
  var sheet = getOrCreateSheet('Employee_Loans', ['LoanID', 'EmployeeName', 'TotalLoanAmount', 'RemainingBalance', 'MonthlyDeductionAmount', 'StartDate', 'Status', 'NextRepaymentDate']);
  var loans = getSheetRowsAsObjects(sheet);
  
  var updatedCount = 0;
  for (var i = 0; i < loans.length; i++) {
    var loan = loans[i];
    if (loan.Status === 'Active') {
      var row = loan._rowNum;
      var remaining = Number(loan.RemainingBalance) || 0;
      var deduction = Number(loan.MonthlyDeductionAmount) || 0;
      
      var newRemaining = remaining - deduction;
      if (newRemaining <= 0) {
        newRemaining = 0;
        sheet.getRange(row, 7).setValue('Paid'); // Status column (7)
      }
      sheet.getRange(row, 4).setValue(newRemaining); // RemainingBalance (4)
      
      // Calculate next month's repayment date
      if (loan.NextRepaymentDate) {
        var d = new Date(loan.NextRepaymentDate);
        d.setMonth(d.getMonth() + 1);
        var nextDateStr = d.toISOString().split('T')[0];
        sheet.getRange(row, 8).setValue(nextDateStr); // NextRepaymentDate (8)
      }
      updatedCount++;
    }
  }
  
  return { success: true, updatedLoansCount: updatedCount };
}

// Core Function: Create New Product
function addInventoryProduct(productId, productName, photoUrl, price, sellPrice, stock, color, status) {
  var sheet = getOrCreateSheet('Inventory', ['ProductID', 'ProductName', 'PhotoUrl', 'Price', 'SellPrice', 'Stock', 'Color', 'Status']);
  sheet.appendRow([
    productId,
    productName,
    photoUrl,
    Number(price),
    Number(sellPrice),
    Number(stock),
    color,
    status
  ]);
  return { success: true };
}

// Core Function: Modify Product Stock/Status
function updateInventoryProduct(productId, stock, status) {
  var sheet = getOrCreateSheet('Inventory', ['ProductID', 'ProductName', 'PhotoUrl', 'Price', 'SellPrice', 'Stock', 'Color', 'Status']);
  var items = getSheetRowsAsObjects(sheet);
  for (var i = 0; i < items.length; i++) {
    if (items[i].ProductID === productId) {
      var row = items[i]._rowNum;
      if (stock !== undefined && stock !== null) {
        sheet.getRange(row, 6).setValue(Number(stock)); // Stock is column 6
      }
      if (status) {
        sheet.getRange(row, 8).setValue(status); // Status is column 8
      }
      return { success: true };
    }
  }
  return { success: false, error: "Product not found" };
}

// Core Function: Permanently Delete Product
function deleteInventoryProduct(productId) {
  var sheet = getOrCreateSheet('Inventory', ['ProductID', 'ProductName', 'PhotoUrl', 'Price', 'SellPrice', 'Stock', 'Color', 'Status']);
  var items = getSheetRowsAsObjects(sheet);
  for (var i = 0; i < items.length; i++) {
    if (items[i].ProductID === productId) {
      sheet.deleteRow(items[i]._rowNum);
      return { success: true };
    }
  }
  return { success: false, error: "Product not found" };
}
