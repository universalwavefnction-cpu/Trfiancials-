import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Income, IncomeSource } from '../types';
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

const ActionMenu: React.FC<{ income: Income, onEdit: (income: Income) => void, onDelete: (id: string) => void }> = ({ income, onEdit, onDelete }) => {
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
                        onClick={() => { onEdit(income); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-primary flex items-center"
                    >
                        <Icons.Edit className="w-4 h-4 mr-2" /> Edit
                    </button>
                    <button
                        onClick={() => { onDelete(income.id); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center"
                    >
                        <Icons.Trash className="w-4 h-4 mr-2" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

interface IncomeFormProps {
    onSave?: (income: Omit<Income, 'id'>) => void;
    onUpdate?: (income: Income) => void;
    onCancel: () => void;
    initialData?: Income | null;
}


const IncomeForm: React.FC<IncomeFormProps> = ({ onSave, onUpdate, onCancel, initialData }) => {
    const isEditMode = !!initialData;
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [source, setSource] = useState<IncomeSource>(initialData?.source || IncomeSource.Consulting);
    const [amount, setAmount] = useState(initialData?.amount.toString() || '');
    const [description, setDescription] = useState(initialData?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newIncome = {
            date,
            source,
            amount: parseFloat(amount),
            description
        };
        if (date && source && !isNaN(newIncome.amount) && description) {
            if(isEditMode && onUpdate && initialData) {
                onUpdate({ ...newIncome, id: initialData.id });
            } else if (!isEditMode && onSave) {
                onSave(newIncome);
            }
        } else {
            alert("Please fill all fields with valid data.");
        }
    };
    
    return (
        <div className="my-4 p-4 bg-primary/50 rounded-lg animate-fade-in">
             <h3 className="text-lg font-semibold mb-4 text-text-primary">{isEditMode ? 'Edit Income' : 'Add New Income'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="income-desc" className="text-sm font-medium text-text-secondary">Description</label>
                    <input id="income-desc" type="text" placeholder="e.g., Project Phoenix" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-surface p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="income-date" className="text-sm font-medium text-text-secondary">Date</label>
                        <input id="income-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-surface p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary" required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="income-amount" className="text-sm font-medium text-text-secondary">Amount (€)</label>
                        <input id="income-amount" type="number" placeholder="1000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-surface p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary" required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="income-source" className="text-sm font-medium text-text-secondary">Source</label>
                        <select id="income-source" value={source} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSource(e.target.value as IncomeSource)} className="w-full bg-surface p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary">
                            {Object.values(IncomeSource).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary rounded-lg hover:bg-secondary/80 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-accent rounded-lg hover:bg-accent-hover text-white font-semibold transition-colors">{isEditMode ? 'Save Changes' : 'Save Income'}</button>
                </div>
            </form>
        </div>
    );
};


const IncomeTracker: React.FC = () => {
    const { state, dispatch } = useFinancials();
    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const [goals, setGoals] = useState<{ [key: string]: string }>({});

    const months = useMemo(() => generateMonths(new Date(2025, 10, 1), 14), []); // Nov 2025 for 14 months

    useEffect(() => {
        const initialGoals = state.incomeGoals.reduce((acc, goal) => {
            acc[goal.month] = goal.amount.toString();
            return acc;
        }, {} as {[key: string]: string});
        setGoals(initialGoals);
    }, [state.incomeGoals]);

    const monthlyData = useMemo(() => {
        return months.map(m => {
            const actual = state.income
                .filter(inc => inc.date.startsWith(m.key))
                .reduce((sum, inc) => sum + inc.amount, 0);
            
            const goal = state.incomeGoals.find(g => g.month === m.key)?.amount || 0;
            const variance = actual - goal;
            
            return { month: m.label, Actual: actual, Goal: goal, Variance: variance };
        });
    }, [months, state.income, state.incomeGoals]);

    const handleGoalChange = (monthKey: string, amount: string) => {
        setGoals(prev => ({ ...prev, [monthKey]: amount }));
    };

    const handleSaveGoals = () => {
        Object.entries(goals).forEach(([month, amountStr]) => {
            const amount = parseFloat(amountStr);
            if (!isNaN(amount)) {
                dispatch({ type: 'UPDATE_INCOME_GOAL', payload: { month, amount } });
            }
        });
        alert('Goals saved successfully!');
    };

     const handleSaveIncome = (newIncomeData: Omit<Income, 'id'>) => {
        const incomeToAdd: Income = { id: `i-${Date.now()}`, ...newIncomeData };
        dispatch({ type: 'ADD_INCOME', payload: incomeToAdd });
        setIsAddingIncome(false);
    };

    const handleUpdateIncome = (updatedIncome: Income) => {
        dispatch({ type: 'UPDATE_INCOME', payload: updatedIncome });
        setEditingIncome(null);
    };

    const handleDeleteIncome = (id: string) => {
        if (window.confirm('Are you sure you want to delete this income entry?')) {
            dispatch({ type: 'DELETE_INCOME', payload: { id } });
        }
    };

    const handleStartEditing = (income: Income) => {
        setIsAddingIncome(false);
        setEditingIncome(income);
    }


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Income & Goals</h1>

            <Card>
                <CardHeader><CardTitle>14-Month Income Performance</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                            <XAxis dataKey="month" stroke="#6c757d" />
                            <YAxis stroke="#6c757d" />
                            <Tooltip cursor={{fill: '#f1f3f5'}} contentStyle={{backgroundColor: '#ffffff', border: '1px solid #dee2e6', borderRadius: '0.5rem'}} />
                            <Legend />
                            <Bar dataKey="Actual" fill="#198754" />
                            <Line type="monotone" dataKey="Goal" stroke="#0d6efd" strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Performance Details</CardTitle></CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-text-secondary uppercase">
                                <tr>
                                    <th className="py-3 px-4">Month</th>
                                    <th className="py-3 px-4 text-right">Actual</th>
                                    <th className="py-3 px-4 text-right">Goal</th>
                                    <th className="py-3 px-4 text-right">Variance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData.map(d => (
                                    <tr key={d.month} className="border-t border-secondary">
                                        <td className="py-3 px-4 font-medium">{d.month}</td>
                                        <td className="py-3 px-4 text-right">{formatCurrency(d.Actual)}</td>
                                        <td className="py-3 px-4 text-right">{formatCurrency(d.Goal)}</td>
                                        <td className={`py-3 px-4 text-right font-semibold ${d.Variance >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(d.Variance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Set Monthly Goals</CardTitle>
                                <button onClick={handleSaveGoals} className="px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors text-sm">Save Goals</button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                            {months.map(m => (
                                <div key={m.key} className="flex items-center space-x-3">
                                    <label htmlFor={`goal-${m.key}`} className="w-24 text-sm text-text-secondary">{m.label}</label>
                                    <div className="relative flex-1">
                                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">€</span>
                                         <input
                                            id={`goal-${m.key}`}
                                            type="number"
                                            placeholder="0"
                                            value={goals[m.key] || ''}
                                            onChange={(e) => handleGoalChange(m.key, e.target.value)}
                                            className="w-full bg-background p-2 pl-6 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Income Transactions</CardTitle>
                                {!isAddingIncome && !editingIncome && (
                                    <button onClick={() => setIsAddingIncome(true)} className="flex items-center space-x-2 px-3 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors text-sm">
                                        <Icons.Plus className="w-4 h-4" />
                                        <span>Add Income</span>
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isAddingIncome && <IncomeForm onSave={handleSaveIncome} onCancel={() => setIsAddingIncome(false)} />}
                            {editingIncome && <IncomeForm initialData={editingIncome} onUpdate={handleUpdateIncome} onCancel={() => setEditingIncome(null)} />}
                            
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                                {state.income.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(inc => (
                                    <div key={inc.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-primary">
                                        <div>
                                            <p className="font-semibold">{inc.description}</p>
                                            <p className="text-sm text-text-secondary">{inc.source} &bull; {new Date(inc.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <p className="font-bold text-success">{formatCurrency(inc.amount)}</p>
                                            <ActionMenu income={inc} onEdit={handleStartEditing} onDelete={handleDeleteIncome} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default IncomeTracker;