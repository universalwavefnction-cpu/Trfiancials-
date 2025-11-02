import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { FinancialData, FinancialAction, Expense, Debt, Income, Asset, ExpenseCategory, ExpenseMode, IncomeSource, AssetCategory, RecurringExpense, Purchase, PurchaseStatus, ExpensePlanMode } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const months = [];
let currentDate = new Date(2025, 10, 1); // Start from Nov 2025
for (let i = 0; i < 14; i++) {
    months.push(`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
}
const incomeGoalAmounts = [1500, 1800, 2000, 2200, 2500, 2800, 3000, 3200, 3500, 3800, 4000, 4200, 4500, 5000];


const initialState: FinancialData = {
  expenses: [
    { id: 'e1', date: '2025-11-05', category: ExpenseCategory.Housing, amount: 650, description: 'Rent', mode: ExpenseMode.Both },
    { id: 'e2', date: '2025-11-03', category: ExpenseCategory.Food, amount: 80, description: 'Groceries', mode: ExpenseMode.Survival },
    { id: 'e3', date: '2025-11-10', category: ExpenseCategory.TrainingGym, amount: 50, description: 'Gym Membership', mode: ExpenseMode.Growth },
  ],
  recurringExpenses: [
    { id: 're1', description: 'Rent', amount: 650, category: ExpenseCategory.Housing, mode: ExpenseMode.Both, frequency: 'monthly', startDate: '2025-11' },
    { id: 're2', description: 'Gym Membership', amount: 50, category: ExpenseCategory.TrainingGym, mode: ExpenseMode.Growth, frequency: 'monthly', startDate: '2025-11' },
    { id: 're3', description: 'Phone Bill', amount: 30, category: ExpenseCategory.Personal, mode: ExpenseMode.Survival, frequency: 'monthly', startDate: '2025-11' },
  ],
  debts: [
    { id: 'd1', name: 'Student Loan', originalAmount: 5000, currentBalance: 4800, interestRate: 5.5, minimumPayment: 100 },
    { id: 'd2', name: 'Credit Card', originalAmount: 2000, currentBalance: 1200, interestRate: 19.9, minimumPayment: 50 },
  ],
  income: [
    { id: 'i1', date: '2025-11-15', source: IncomeSource.Consulting, amount: 1200, description: 'Project Alpha' },
    { id: 'i2', date: '2025-11-28', source: IncomeSource.Newsletter, amount: 50, description: 'November Payout' },
    { id: 'i3', date: '2025-12-15', source: IncomeSource.Consulting, amount: 1500, description: 'Project Bravo' },
  ],
  assets: [
    { id: 'a1', name: 'Emergency Fund', category: AssetCategory.EmergencyFund, amountInvested: 3000, currentValue: 3000, date: '2024-01-01' },
    { id: 'a2', name: 'Savings Account', category: AssetCategory.Savings, amountInvested: 500, currentValue: 500, date: '2024-01-01' },
    { id: 'a3', name: 'Bitcoin', category: AssetCategory.Crypto, amountInvested: 1000, currentValue: 1500, date: '2023-06-15' },
    { id: 'a4', name: 'VWCE ETF', category: AssetCategory.StocksETFs, amountInvested: 800, currentValue: 950, date: '2023-08-20' },
  ],
  incomeGoals: months.map((m, i) => ({ id: `ig${i + 1}`, month: m, amount: incomeGoalAmounts[i] })),
  expensePlans: [
    ...months.map((m, i) => ({ id: `eps${i}`, month: m, mode: ExpensePlanMode.Survival, amount: 800 })),
    ...months.map((m, i) => ({ id: `epg${i}`, month: m, mode: ExpensePlanMode.Growth, amount: 1500 })),
  ],
  purchases: [
     {
        id: 'p1',
        name: 'New Standing Desk',
        cost: 450,
        category: ExpenseCategory.BusinessExpenses,
        justification: 'Improve ergonomics and productivity.',
        status: PurchaseStatus.Considering,
        dateAdded: '2025-11-10',
    }
  ],
};

const financialReducer = (state: FinancialData, action: FinancialAction): FinancialData => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...initialState, ...action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
        return {
            ...state,
            expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e),
        };
    case 'DELETE_EXPENSE':
        return {
            ...state,
            expenses: state.expenses.filter(e => e.id !== action.payload.id),
        };
    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, action.payload] };
    case 'UPDATE_DEBT':
        return {
            ...state,
            debts: state.debts.map(d => d.id === action.payload.id ? action.payload : d),
        };
    case 'DELETE_DEBT':
        return {
            ...state,
            debts: state.debts.filter(d => d.id !== action.payload.id),
        };
    case 'ADD_INCOME':
      return { ...state, income: [...state.income, action.payload] };
    case 'UPDATE_INCOME':
        return {
            ...state,
            income: state.income.map(i => i.id === action.payload.id ? action.payload : i),
        };
    case 'DELETE_INCOME':
        return {
            ...state,
            income: state.income.filter(i => i.id !== action.payload.id),
        };
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
    case 'UPDATE_RECURRING_EXPENSE':
        return {
            ...state,
            recurringExpenses: state.recurringExpenses.map(re => re.id === action.payload.id ? action.payload : re),
        };
    case 'DELETE_RECURRING_EXPENSE':
        return { ...state, recurringExpenses: state.recurringExpenses.filter(re => re.id !== action.payload.id) };
    case 'LOG_RECURRING_EXPENSES_FOR_MONTH': {
        const { month } = action.payload; // e.g. "2025-11"
        
        // Find recurring expenses that should be active for this month
        const applicableRecurring = state.recurringExpenses
            .filter(re => new Date(re.startDate + "-01T00:00:00Z") <= new Date(month + "-01T00:00:00Z"));
            
        // Get the set of IDs of all existing expenses for faster lookup
        const existingExpenseIds = new Set(state.expenses.map(e => e.id));
        
        const newExpensesToAdd: Expense[] = [];
        
        applicableRecurring.forEach(re => {
            // Create a deterministic ID for the logged expense
            const loggedExpenseId = `logged-${re.id}-${month}`;
            
            // Only add if an expense with this ID doesn't already exist
            if (!existingExpenseIds.has(loggedExpenseId)) {
                newExpensesToAdd.push({
                    id: loggedExpenseId,
                    date: `${month}-01`, // Log to the first of the month
                    category: re.category,
                    amount: re.amount,
                    description: `${re.description} (Recurring)`,
                    mode: re.mode,
                });
            }
        });

        // If there's nothing new to add, just return the current state
        if (newExpensesToAdd.length === 0) {
            return state;
        }

        return { 
            ...state, 
            expenses: [...state.expenses, ...newExpensesToAdd] 
        };
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
        // FIX: The variable in the map is 'a', not 'd'. Changed 'd' to 'a'.
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