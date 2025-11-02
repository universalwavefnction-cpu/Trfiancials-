export enum ExpenseCategory {
  Housing = "Housing",
  Food = "Food",
  Transportation = "Transportation",
  TrainingGym = "Training/Gym",
  Health = "Health",
  DebtPayments = "Debt Payments",
  BusinessExpenses = "Business Expenses",
  Personal = "Personal",
  Emergency = "Emergency",
  Other = "Other",
}

export enum ExpenseMode {
  Survival = "Survival Mode",
  Growth = "Growth Mode",
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  mode: ExpenseMode;
}

export interface RecurringExpense {
  id:string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  mode: ExpenseMode;
  frequency: 'monthly';
  startDate: string; // YYYY-MM
}

export interface ExpensePlan {
  id: string;
  month: string; // YYYY-MM
  mode: ExpenseMode;
  amount: number;
}

export interface Debt {
  id: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
}

export enum IncomeSource {
  Employment = "Employment",
  Consulting = "Consulting",
  Newsletter = "Newsletter",
  CourseSales = "Course Sales",
  Speaking = "Speaking",
  Other = "Other",
}

export interface Income {
  id: string;
  date: string;
  source: IncomeSource;
  amount: number;
  description: string;
}

export interface IncomeGoal {
  id: string;
  month: string; // YYYY-MM
  amount: number;
}

export enum AssetCategory {
  StocksETFs = "Stocks/ETFs",
  Crypto = "Crypto",
  Savings = "Savings",
  EmergencyFund = "Emergency Fund",
  BusinessAssets = "Business Assets",
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  amountInvested: number;
  currentValue: number;
  date: string;
}

export enum PurchaseStatus {
    Considering = "Considering",
    Purchased = "Purchased",
    Declined = "Declined",
}

export interface Purchase {
    id: string;
    name: string;
    cost: number;
    category: ExpenseCategory;
    justification: string;
    status: PurchaseStatus;
    dateAdded: string; // YYYY-MM-DD
}


export interface FinancialData {
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  debts: Debt[];
  income: Income[];
  assets: Asset[];
  incomeGoals: IncomeGoal[];
  expensePlans: ExpensePlan[];
  purchases: Purchase[];
}

export type FinancialAction =
  | { type: "SET_STATE"; payload: FinancialData }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; payload: { id: string } }
  | { type: "ADD_RECURRING_EXPENSE"; payload: RecurringExpense }
  | { type: "DELETE_RECURRING_EXPENSE"; payload: { id: string } }
  | { type: "LOG_RECURRING_EXPENSES_FOR_MONTH"; payload: { month: string } }
  | { type: "ADD_DEBT"; payload: Debt }
  | { type: "UPDATE_DEBT"; payload: Debt }
  | { type: "DELETE_DEBT"; payload: { id: string } }
  | { type: "ADD_INCOME"; payload: Income }
  | { type: "UPDATE_INCOME"; payload: Income }
  | { type: "DELETE_INCOME"; payload: { id: string } }
  | { type: "ADD_ASSET"; payload: Asset }
  | { type: "ADD_PURCHASE"; payload: Purchase }
  | { type: "UPDATE_PURCHASE_STATUS"; payload: { id: string; status: PurchaseStatus } }
  | { type: "UPDATE_INCOME_GOAL"; payload: { month: string; amount: number } }
  | { type: "UPDATE_EXPENSE_PLAN"; payload: { month: string; mode: ExpenseMode; amount: number } }
  | { type: "UPDATE_DEBT_BALANCE"; payload: { id: string; newBalance: number } }
  | { type: "UPDATE_ASSET_VALUE"; payload: { id: string; newValue: number } };

export type View = "dashboard" | "expenses" | "debts" | "income" | "investments" | "purchases" | "sync" | "rundown";