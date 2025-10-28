import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { FinancialData, FinancialAction, Expense, Debt, Income, Asset, ExpenseCategory, ExpenseMode, IncomeSource, AssetCategory, RecurringExpense } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const months = [];
let currentDate = new Date(2024, 10, 1); // Start from Nov 2024
for (let i = 0; i < 14; i++) {
    months.push(`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
}

const initialState: FinancialData = {
  expenses: [
    { id: 'e1', date: '2024-11-05', category: ExpenseCategory.Housing, amount: 650, description: 'Rent', mode: ExpenseMode.Survival },
    { id: 'e2', date: '2024-11-03', category: ExpenseCategory.Food, amount: 80, description: 'Groceries', mode: ExpenseMode.Survival },
    { id: 'e3', date: '2024-11-10', category: ExpenseCategory.TrainingGym, amount: 50, description: 'Gym Membership', mode: ExpenseMode.Growth },
  ],
  recurringExpenses: [
    { id: 're1', description: 'Rent', amount: 650, category: ExpenseCategory.Housing, mode: ExpenseMode.Survival, frequency: 'monthly', startDate: '2024-11' },
    { id: 're2', description: 'Gym Membership', amount: 50, category: ExpenseCategory.TrainingGym, mode: ExpenseMode.Growth, frequency: 'monthly', startDate: '2024-11' },
    { id: 're3', description: 'Phone Bill', amount: 30, category: ExpenseCategory.Personal, mode: ExpenseMode.Survival, frequency: 'monthly', startDate: '2024-11' },
  ],
  debts: [
    { id: 'd1', name: 'Student Loan', originalAmount: 5000, currentBalance: 4800, interestRate: 5.5, minimumPayment: 100 },
    { id: 'd2', name: 'Credit Card', originalAmount: 2000, currentBalance: 1200, interestRate: 19.9, minimumPayment: 50 },
  ],
  income: [
    { id: 'i1', date: '2024-11-15', source: IncomeSource.Consulting, amount: 1200, description: 'Project Alpha' },
    { id: 'i2', date: '2024-11-28', source: IncomeSource.Newsletter, amount: 50, description: 'November Payout' },
    { id: 'i3', date: '2024-12-15', source: IncomeSource.Consulting, amount: 1500, description: 'Project Bravo' },
  ],
  assets: [
    { id: 'a1', name: 'Emergency Fund', category: AssetCategory.EmergencyFund, amountInvested: 3000, currentValue: 3000, date: '2024-01-01' },
    { id: 'a2', name: 'Savings Account', category: AssetCategory.Savings, amountInvested: 500, currentValue: 500, date: '2024-01-01' },
    { id: 'a3', name: 'Bitcoin', category: AssetCategory.Crypto, amountInvested: 1000, currentValue: 1500, date: '2023-06-15' },
    { id: 'a4', name: 'VWCE ETF', category: AssetCategory.StocksETFs, amountInvested: 800, currentValue: 950, date: '2023-08-20' },
  ],
  incomeGoals: [
    { id: 'ig1', month: '2024-11', amount: 1500 },
    { id: 'ig2', month: '2024-12', amount: 1800 },
    { id: 'ig3', month: '2025-01', amount: 2000 },
    { id: 'ig4', month: '2025-02', amount: 2200 },
    { id: 'ig5', month: '2025-03', amount: 2500 },
    { id: 'ig6', month: '2025-04', amount: 2800 },
    { id: 'ig7', month: '2025-05', amount: 3000 },
    { id: 'ig8', month: '2025-06', amount: 3200 },
    { id: 'ig9', month: '2025-07', amount: 3500 },
    { id: 'ig10', month: '2025-08', amount: 3800 },
    { id: 'ig11', month: '2025-09', amount: 4000 },
    { id: 'ig12', month: '2025-10', amount: 4200 },
    { id: 'ig13', month: '2025-11', amount: 4500 },
    { id: 'ig14', month: '2025-12', amount: 5000 },
  ],
  expensePlans: [
    ...months.map((m, i) => ({ id: `eps${i}`, month: m, mode: ExpenseMode.Survival, amount: 800 })),
    ...months.map((m, i) => ({ id: `epg${i}`, month: m, mode: ExpenseMode.Growth, amount: 1500 })),
  ],
  purchases: [],
};

const financialReducer = (state: FinancialData, action: FinancialAction): FinancialData => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...initialState, ...action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, action.payload] };
    case 'ADD_INCOME':
      return { ...state, income: [...state.income, action.payload] };
    case 'ADD_ASSET':
      return { ...state, assets: [...state.assets, action.payload] };
    case 'ADD_PURCHASE':
        return { ...state, purchases: [...state.purchases, action.payload] };
    case 'UPDATE_PURCHASE_STATUS':
        return { 
            ...state, 
            purchases: state.purchases.map(p => 
                p.id === action.payload.id ? { ...p, status: action.payload.status } : p
            )
        };
    case 'ADD_RECURRING_EXPENSE':
        return { ...state, recurringExpenses: [...state.recurringExpenses, action.payload] };
    case 'DELETE_RECURRING_EXPENSE':
        return { ...state, recurringExpenses: state.recurringExpenses.filter(re => re.id !== action.payload.id) };
    case 'LOG_RECURRING_EXPENSES_FOR_MONTH': {
        const { month } = action.payload; // e.g. "2024-11"
        const expensesForMonth = state.recurringExpenses
            .filter(re => new Date(re.startDate) <= new Date(month))
            .map(re => ({
                id: `e-${re.id}-${month}-${Date.now()}`,
                date: `${month}-01`, // log to the first of the month
                category: re.category,
                amount: re.amount,
                description: re.description,
                mode: re.mode,
            }));
        // Avoid adding duplicates
        const existingDescriptions = new Set(state.expenses.filter(e => e.date.startsWith(month)).map(e => e.description));
        const newExpensesToAdd = expensesForMonth.filter(e => !existingDescriptions.has(e.description));

        return { ...state, expenses: [...state.expenses, ...newExpensesToAdd] };
    }
    case 'UPDATE_INCOME_GOAL': {
      const { month, amount } = action.payload;
      const goalExists = state.incomeGoals.some(g => g.month === month);
      if (goalExists) {
        return {
          ...state,
          incomeGoals: state.incomeGoals.map(g => g.month === month ? { ...g, amount } : g),
        };
      } else {
        return {
            ...state,
            incomeGoals: [...state.incomeGoals, { id: `ig-${Date.now()}`, month, amount }],
        }
      }
    }
    case 'UPDATE_EXPENSE_PLAN': {
      const { month, mode, amount } = action.payload;
      const planExists = state.expensePlans.some(p => p.month === month && p.mode === mode);
      if (planExists) {
        return {
          ...state,
          expensePlans: state.expensePlans.map(p => (p.month === month && p.mode === mode) ? { ...p, amount } : p),
        };
      } else {
        return {
            ...state,
            expensePlans: [...state.expensePlans, { id: `ep-${Date.now()}`, month, mode, amount }],
        }
      }
    }
    case 'UPDATE_DEBT_BALANCE':
      return {
        ...state,
        debts: state.debts.map(d => d.id === action.payload.id ? { ...d, currentBalance: action.payload.newBalance } : d),
      };
    case 'UPDATE_ASSET_VALUE':
      return {
        ...state,
        assets: state.assets.map(a => a.id === action.payload.id ? { ...a, currentValue: action.payload.newValue } : a),
      };
    default:
      return state;
  }
};

const FinancialContext = createContext<{ state: FinancialData; dispatch: React.Dispatch<FinancialAction> }>({
  state: initialState,
  dispatch: () => null,
});

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedState, setStoredState] = useLocalStorage<FinancialData>('financialData', initialState);
  const [state, dispatch] = useReducer(financialReducer, storedState);

  useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);
  
  // A one-time check to see if local storage is empty and if so, populate with initial data.
  useEffect(() => {
    const rawData = window.localStorage.getItem('financialData');
    if (!rawData || !JSON.parse(rawData).expenses) { // Simple check if data exists
      dispatch({ type: 'SET_STATE', payload: initialState });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <FinancialContext.Provider value={{ state, dispatch }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancials = () => useContext(FinancialContext);