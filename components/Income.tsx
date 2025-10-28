import React, { useMemo, useState, useEffect } from 'react';
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

const AddIncomeForm: React.FC<{ onSave: (income: Omit<Income, 'id'>) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [source, setSource] = useState<IncomeSource>(IncomeSource.Consulting);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newIncome = {
            date,
            source,
            amount: parseFloat(amount),
            description
        };
        if (date && source && !isNaN(newIncome.amount) && description) {
            onSave(newIncome);
        } else {
            alert("Please fill all fields with valid data.");
        }
    };
    
    return (
        <Card className="my-4 animate-fade-in">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="income-desc" className="text-sm font-medium text-text-secondary">Description</label>
                        <input id="income-desc" type="text" placeholder="e.g., Project Phoenix" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="income-date" className="text-sm font-medium text-text-secondary">Date</label>
                            <input id="income-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="income-amount" className="text-sm font-medium text-text-secondary">Amount (€)</label>
                            <input id="income-amount" type="number" placeholder="1000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="income-source" className="text-sm font-medium text-text-secondary">Source</label>
                            {/* FIX: Explicitly type the event to ensure e.target.value is inferred as a string. */}
                            <select id="income-source" value={source} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSource(e.target.value as IncomeSource)} className="w-full bg-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                                {Object.values(IncomeSource).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary rounded-lg hover:bg-secondary transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-accent rounded-lg hover:bg-accent-hover text-white font-semibold transition-colors">Save Income</button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

const IncomeTracker: React.FC = () => {
    const { state, dispatch } = useFinancials();
    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [goals, setGoals] = useState<{ [key: string]: string }>({});

    const months = useMemo(() => generateMonths(new Date(2024, 10, 1), 14), []); // Nov 2024 for 14 months

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
    };

     const handleSaveIncome = (newIncomeData: Omit<Income, 'id'>) => {
        const incomeToAdd: Income = { id: `i-${Date.now()}`, ...newIncomeData };
        dispatch({ type: 'ADD_INCOME', payload: incomeToAdd });
        setIsAddingIncome(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Income & Goals</h1>

            <Card>
                <CardHeader><CardTitle>14-Month Income Performance</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="month" stroke="#a0aec0" />
                            <YAxis stroke="#a0aec0" />
                            <Tooltip cursor={{fill: '#4a5568'}} contentStyle={{backgroundColor: '#2d3748', border: 'none'}} />
                            <Legend />
                            <Bar dataKey="Actual" fill="#48bb78" />
                            <Line type="monotone" dataKey="Goal" stroke="#38b2ac" strokeWidth={2} />
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
                                    <tr key={d.month} className="border-t border-primary">
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
                                            className="w-full bg-primary p-2 pl-6 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
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
                                {!isAddingIncome && (
                                    <button onClick={() => setIsAddingIncome(true)} className="flex items-center space-x-2 px-3 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors text-sm">
                                        <Icons.Plus className="w-4 h-4" />
                                        <span>Add Income</span>
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isAddingIncome && <AddIncomeForm onSave={handleSaveIncome} onCancel={() => setIsAddingIncome(false)} />}
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {state.income.slice().reverse().map(inc => (
                                    <div key={inc.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-primary">
                                        <div>
                                            <p className="font-semibold">{inc.description}</p>
                                            <p className="text-sm text-text-secondary">{inc.source} &bull; {new Date(inc.date).toLocaleDateString()}</p>
                                        </div>
                                        <p className="font-bold text-success">{formatCurrency(inc.amount)}</p>
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