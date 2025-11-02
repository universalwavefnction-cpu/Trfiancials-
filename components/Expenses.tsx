import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Expense, ExpenseCategory, ExpenseMode, RecurringExpense, ExpensePlanMode } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const formatCurrency = (value: number) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const generateMonths = (startDate: Date, count: number) => {
    const months = [];
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    for (let i = 0; i < count; i++) {
        months.push({
            label: currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
            key: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`,
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months;
};

const ActionMenu: React.FC<{ expense: Expense, onEdit: (expense: Expense) => void, onDelete: (id: string) => void }> = ({ expense, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(p => !p)} className="p-1 rounded-full text-text-secondary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand">
                <Icons.More className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-surface rounded-md shadow-lg z-10 border border-secondary animate-fade-in">
                    <button
                        onClick={() => { onEdit(expense); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-primary flex items-center"
                    >
                        <Icons.Edit className="w-4 h-4 mr-2" /> Edit
                    </button>
                    <button
                        onClick={() => { onDelete(expense.id); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center"
                    >
                        <Icons.Trash className="w-4 h-4 mr-2" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

const RecurringActionMenu: React.FC<{ expense: RecurringExpense, onEdit: (expense: RecurringExpense) => void, onDelete: (id: string) => void }> = ({ expense, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(p => !p)} className="p-1 rounded-full text-text-secondary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand">
                <Icons.More className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-surface rounded-md shadow-lg z-10 border border-secondary animate-fade-in">
                    <button
                        onClick={() => { onEdit(expense); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-primary flex items-center"
                    >
                        <Icons.Edit className="w-4 h-4 mr-2" /> Edit
                    </button>
                    <button
                        onClick={() => { onDelete(expense.id); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center"
                    >
                        <Icons.Trash className="w-4 h-4 mr-2" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

interface ExpenseFormProps {
    onSave?: (expense: Omit<Expense, 'id'>) => void;
    onUpdate?: (expense: Expense) => void;
    onCancel: () => void;
    initialData?: Expense | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSave, onUpdate, onCancel, initialData }) => {
    const isEditMode = !!initialData;
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState(initialData?.amount.toString() || '');
    const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || ExpenseCategory.Personal);
    const [mode, setMode] = useState<ExpenseMode>(initialData?.mode || ExpenseMode.Growth);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const expenseData = { date, category, amount: parseFloat(amount), description, mode };
        if (description && date && !isNaN(expenseData.amount)) {
            if (isEditMode && onUpdate && initialData) {
                onUpdate({ ...expenseData, id: initialData.id });
            } else if (!isEditMode && onSave) {
                onSave(expenseData);
            }
        } else {
            alert("Please fill all fields with valid data.");
        }
    };

    return (
        <div className="my-4 p-4 bg-primary/50 rounded-lg animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-2">
                    <label htmlFor="exp-desc" className="text-sm font-medium text-text-secondary">Description</label>
                    <input id="exp-desc" type="text" placeholder="e.g., Dinner with client" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-surface p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="space-y-2">
                        <label htmlFor="exp-date" className="text-sm font-medium text-text-secondary">Date</label>
                        <input id="exp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-surface p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary" required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="exp-amount" className="text-sm font-medium text-text-secondary">Amount (€)</label>
                        <input id="exp-amount" type="number" placeholder="50" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-surface p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary" required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="exp-category" className="text-sm font-medium text-text-secondary">Category</label>
                        <select id="exp-category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="w-full bg-surface p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary">
                            {Object.values(ExpenseCategory).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="exp-mode" className="text-sm font-medium text-text-secondary">Mode</label>
                        <select id="exp-mode" value={mode} onChange={(e) => setMode(e.target.value as ExpenseMode)} className="w-full bg-surface p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary">
                            {Object.values(ExpenseMode).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary rounded-lg hover:bg-secondary/80 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-accent rounded-lg hover:bg-accent-hover text-white font-semibold transition-colors">{isEditMode ? 'Save Changes' : 'Save Expense'}</button>
                </div>
            </form>
        </div>
    );
};

interface RecurringExpenseFormProps {
    onSave?: (expense: Omit<RecurringExpense, 'id'>) => void;
    onUpdate?: (expense: RecurringExpense) => void;
    onCancel: () => void;
    initialData?: RecurringExpense | null;
}

const RecurringExpenseForm: React.FC<RecurringExpenseFormProps> = ({ onSave, onUpdate, onCancel, initialData }) => {
    const isEditMode = !!initialData;
    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.amount.toString() || '');
    const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || ExpenseCategory.Housing);
    const [mode, setMode] = useState<ExpenseMode>(initialData?.mode || ExpenseMode.Survival);
    const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().slice(0, 7));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const expenseData: Omit<RecurringExpense, 'id'> = {
            description,
            amount: parseFloat(amount),
            category,
            mode,
            frequency: 'monthly',
            startDate,
        };
        if (description && !isNaN(expenseData.amount)) {
            if (isEditMode && onUpdate && initialData) {
                onUpdate({ ...expenseData, id: initialData.id });
            } else if (!isEditMode && onSave) {
                onSave(expenseData);
            }
        } else {
            alert("Please fill all fields with valid data.");
        }
    };

    return (
         <Card className="my-4 animate-fade-in">
            <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">{isEditMode ? 'Edit Recurring Expense' : 'Add Recurring Expense'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Description</label>
                        <input type="text" placeholder="e.g., Monthly Rent" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-background p-2 rounded-md border border-secondary" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Amount (€)</label>
                            <input type="number" placeholder="650" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-background p-2 rounded-md border border-secondary" required />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Start Month</label>
                            <input type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-background p-2 rounded-md border border-secondary" required />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="w-full bg-background p-2 rounded-md border border-secondary">
                                {Object.values(ExpenseCategory).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Mode</label>
                            <select value={mode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as ExpenseMode)} className="w-full bg-background p-2 rounded-md border border-secondary">
                                {Object.values(ExpenseMode).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-accent rounded-lg text-white font-semibold">{isEditMode ? 'Save Changes' : 'Save Recurring'}</button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

const ExpenseTracker: React.FC = () => {
    const { state, dispatch } = useFinancials();
    const [viewMode, setViewMode] = useState<ExpensePlanMode>(ExpensePlanMode.Growth);
    const [isAdding, setIsAdding] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [isAddingRecurring, setIsAddingRecurring] = useState(false);
    const [editingRecurringExpense, setEditingRecurringExpense] = useState<RecurringExpense | null>(null);

    const months = useMemo(() => generateMonths(new Date(2025, 10, 1), 14), []);

    const monthlyData = useMemo(() => {
        return months.map(m => {
            const actual = state.expenses
                .filter(exp => exp.date.startsWith(m.key))
                .reduce((sum, exp) => sum + exp.amount, 0);
            
            const planned = state.recurringExpenses
                .filter(re => {
                    const reStartDate = new Date(re.startDate + "-01T00:00:00Z");
                    const monthDate = new Date(m.key + "-01T00:00:00Z");
                    
                    if (reStartDate > monthDate) return false;

                    if (viewMode === ExpensePlanMode.Survival) {
                        return re.mode === ExpenseMode.Survival || re.mode === ExpenseMode.Both;
                    }
                    if (viewMode === ExpensePlanMode.Growth) {
                        return re.mode === ExpenseMode.Growth || re.mode === ExpenseMode.Both;
                    }
                    return false;
                })
                .reduce((sum, re) => sum + re.amount, 0);

            const variance = planned - actual; // Positive is under budget
            
            return { monthLabel: m.label, monthKey: m.key, Actual: actual, Planned: planned, Variance: variance };
        });
    }, [months, state.expenses, state.recurringExpenses, viewMode]);


    const handleSaveExpense = (newExpenseData: Omit<Expense, 'id'>) => {
        const expenseToAdd: Expense = { id: `e-${Date.now()}`, ...newExpenseData };
        dispatch({ type: 'ADD_EXPENSE', payload: expenseToAdd });
        setIsAdding(false);
    };

    const handleUpdateExpense = (updatedExpense: Expense) => {
        dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
        setEditingExpense(null);
    };

    const handleDeleteExpense = (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            dispatch({ type: 'DELETE_EXPENSE', payload: { id } });
        }
    };

    const handleStartEditing = (expense: Expense) => {
        setIsAdding(false);
        setEditingExpense(expense);
    };

    const handleSaveRecurringExpense = (data: Omit<RecurringExpense, 'id'>) => {
        dispatch({ type: 'ADD_RECURRING_EXPENSE', payload: { id: `re-${Date.now()}`, ...data } });
        setIsAddingRecurring(false);
    }
    
    const handleUpdateRecurringExpense = (updatedExpense: RecurringExpense) => {
        dispatch({ type: 'UPDATE_RECURRING_EXPENSE', payload: updatedExpense });
        setEditingRecurringExpense(null);
    };

    const handleDeleteRecurring = (id: string) => {
        if(window.confirm("Are you sure you want to delete this recurring expense?")) {
            dispatch({ type: 'DELETE_RECURRING_EXPENSE', payload: { id } });
        }
    }

    const handleStartEditingRecurring = (expense: RecurringExpense) => {
        setIsAddingRecurring(false);
        setEditingRecurringExpense(expense);
    };
    
    const handleLogRecurring = (monthKey: string) => {
        dispatch({ type: 'LOG_RECURRING_EXPENSES_FOR_MONTH', payload: { month: monthKey } });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Expense Planning</h1>
                    <p className="text-text-secondary mt-1">Plan vs. Actual spending for your 14-month horizon.</p>
                </div>
                 <div className="flex space-x-2 p-1 bg-primary rounded-lg border border-secondary">
                    <button onClick={() => setViewMode(ExpensePlanMode.Survival)} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === ExpensePlanMode.Survival ? 'bg-accent text-white' : 'text-text-secondary'}`}>Survival</button>
                    <button onClick={() => setViewMode(ExpensePlanMode.Growth)} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === ExpensePlanMode.Growth ? 'bg-accent text-white' : 'text-text-secondary'}`}>Growth</button>
                </div>
            </div>
            
            <Card>
                <CardHeader><CardTitle>14-Month Expense Performance ({viewMode})</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                            <XAxis dataKey="monthLabel" stroke="#6c757d" />
                            <YAxis stroke="#6c757d" />
                            <Tooltip cursor={{fill: '#f1f3f5'}} contentStyle={{backgroundColor: '#ffffff', border: '1px solid #dee2e6', borderRadius: '0.5rem'}}/>
                            <Legend />
                            <Bar dataKey="Actual" fill="#dc3545" />
                            <Line type="monotone" dataKey="Planned" stroke="#0d6efd" strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Performance Details</CardTitle></CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-text-secondary uppercase">
                            <tr>
                                <th className="py-3 px-4">Month</th>
                                <th className="py-3 px-4 text-right">Actual</th>
                                <th className="py-3 px-4 text-right">Planned</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyData.map(d => (
                                <tr key={d.monthKey} className="border-t border-secondary">
                                    <td className="py-3 px-4 font-medium">{d.monthLabel}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(d.Actual)}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(d.Planned)}</td>
                                    <td className="py-3 px-4 text-right">
                                        <button onClick={() => handleLogRecurring(d.monthKey)} className="text-xs bg-primary px-2 py-1 rounded hover:bg-accent hover:text-white">Log Recurring</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Recurring Expenses</CardTitle>
                             {!(isAddingRecurring || editingRecurringExpense) && (
                                <button onClick={() => setIsAddingRecurring(true)} className="flex items-center space-x-2 px-3 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors text-sm">
                                    <Icons.Plus className="w-4 h-4" />
                                    <span>Add Recurring</span>
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {(isAddingRecurring || editingRecurringExpense) && (
                            <RecurringExpenseForm 
                                onSave={handleSaveRecurringExpense}
                                onUpdate={handleUpdateRecurringExpense}
                                onCancel={() => { setIsAddingRecurring(false); setEditingRecurringExpense(null); }}
                                initialData={editingRecurringExpense}
                            />
                        )}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {state.recurringExpenses.map(re => (
                                <div key={re.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-primary">
                                    <div>
                                        <p className="font-semibold">{re.description}</p>
                                        <p className="text-sm text-text-secondary">{re.category} &bull; {re.mode}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <p className="font-bold">{formatCurrency(re.amount)}/mo</p>
                                        <RecurringActionMenu expense={re} onEdit={handleStartEditingRecurring} onDelete={handleDeleteRecurring} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Expense Transactions</CardTitle>
                            {!isAdding && !editingExpense && (
                                <button onClick={() => setIsAdding(true)} className="flex items-center space-x-2 px-3 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors text-sm">
                                    <Icons.Plus className="w-4 h-4" />
                                    <span>Add Expense</span>
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isAdding && <ExpenseForm onSave={handleSaveExpense} onCancel={() => setIsAdding(false)} />}
                        {editingExpense && <ExpenseForm initialData={editingExpense} onUpdate={handleUpdateExpense} onCancel={() => setEditingExpense(null)} />}

                        <div className="space-y-1 max-h-60 overflow-y-auto">
                            {state.expenses.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                                <div key={exp.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-primary">
                                    <div>
                                        <p className="font-semibold">{exp.description}</p>
                                        <p className="text-sm text-text-secondary">{exp.category} &bull; {new Date(exp.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <p className="font-bold text-danger">{formatCurrency(exp.amount)}</p>
                                        <ActionMenu expense={exp} onEdit={handleStartEditing} onDelete={handleDeleteExpense} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ExpenseTracker;