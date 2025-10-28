
import React, { useMemo, useState } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Debt } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';

const formatCurrency = (value: number) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DebtItem: React.FC<{ debt: Debt }> = ({ debt }) => {
    const progress = (1 - debt.currentBalance / debt.originalAmount) * 100;

    return (
        <Card className="hover:shadow-accent/20 transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{debt.name}</CardTitle>
                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${debt.interestRate > 15 ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                        {debt.interestRate.toFixed(1)}% APR
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="flex justify-between text-text-primary font-semibold mb-1">
                        <span>{formatCurrency(debt.currentBalance)}</span>
                        <span className="text-text-secondary">of {formatCurrency(debt.originalAmount)}</span>
                    </div>
                    <div className="w-full bg-primary rounded-full h-3">
                        <div className="bg-accent h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                     <div className="text-right text-sm text-accent font-bold mt-1">{progress.toFixed(1)}% Paid Off</div>
                </div>
                <div className="text-sm text-text-secondary">
                    Minimum Payment: <span className="font-semibold text-text-primary">{formatCurrency(debt.minimumPayment)}</span>
                </div>
            </CardContent>
        </Card>
    );
};

const AddDebtForm: React.FC<{ onSave: (debt: Omit<Debt, 'id'>) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [originalAmount, setOriginalAmount] = useState('');
    const [currentBalance, setCurrentBalance] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [minimumPayment, setMinimumPayment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newDebt: Omit<Debt, 'id'> = {
            name,
            originalAmount: parseFloat(originalAmount),
            currentBalance: parseFloat(currentBalance),
            interestRate: parseFloat(interestRate),
            minimumPayment: parseFloat(minimumPayment),
        };
        
        if (name && !isNaN(newDebt.originalAmount) && !isNaN(newDebt.currentBalance) && !isNaN(newDebt.interestRate) && !isNaN(newDebt.minimumPayment)) {
            onSave(newDebt);
        } else {
            alert("Please fill all fields with valid data.");
        }
    };

    return (
        <Card className="mt-4 animate-fade-in">
            <CardHeader>
                <CardTitle>Add New Debt</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="debt-name" className="text-sm font-medium text-text-secondary">Debt Name</label>
                        <input
                            id="debt-name"
                            type="text"
                            placeholder="e.g., Car Loan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="original-amount" className="text-sm font-medium text-text-secondary">Original Amount (€)</label>
                            <input
                                id="original-amount"
                                type="number"
                                placeholder="5000"
                                value={originalAmount}
                                onChange={(e) => setOriginalAmount(e.target.value)}
                                className="w-full bg-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                             <label htmlFor="current-balance" className="text-sm font-medium text-text-secondary">Current Balance (€)</label>
                            <input
                                id="current-balance"
                                type="number"
                                placeholder="4800"
                                value={currentBalance}
                                onChange={(e) => setCurrentBalance(e.target.value)}
                                className="w-full bg-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            />
                        </div>
                         <div className="space-y-2">
                             <label htmlFor="interest-rate" className="text-sm font-medium text-text-secondary">Interest Rate (%)</label>
                            <input
                                id="interest-rate"
                                type="number"
                                step="0.01"
                                placeholder="5.5"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="w-full bg-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                             <label htmlFor="min-payment" className="text-sm font-medium text-text-secondary">Minimum Payment (€)</label>
                            <input
                                id="min-payment"
                                type="number"
                                placeholder="100"
                                value={minimumPayment}
                                onChange={(e) => setMinimumPayment(e.target.value)}
                                className="w-full bg-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary rounded-lg hover:bg-secondary transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-accent rounded-lg hover:bg-accent-hover text-white font-semibold transition-colors">Save Debt</button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};


const DebtDashboard: React.FC = () => {
    const { state, dispatch } = useFinancials();
    const [isAdding, setIsAdding] = useState(false);
    
    const { totalDebt, overallProgress, totalMinimumPayments } = useMemo(() => {
        const originalTotal = state.debts.reduce((sum, d) => sum + d.originalAmount, 0);
        const currentTotal = state.debts.reduce((sum, d) => sum + d.currentBalance, 0);
        const totalMinPays = state.debts.reduce((sum, d) => sum + d.minimumPayment, 0);

        return {
            totalDebt: currentTotal,
            overallProgress: originalTotal > 0 ? (1 - currentTotal / originalTotal) * 100 : 0,
            totalMinimumPayments: totalMinPays
        };
    }, [state.debts]);

     const handleSaveDebt = (newDebtData: Omit<Debt, 'id'>) => {
        const debtToAdd: Debt = {
            id: `d-${Date.now()}`,
            ...newDebtData,
        };
        dispatch({ type: 'ADD_DEBT', payload: debtToAdd });
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Debt Elimination Center</h1>

            <Card>
                <CardHeader><CardTitle>Total Debt Overview</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-danger">{formatCurrency(totalDebt)}</p>
                    <div className="mt-4">
                         <div className="w-full bg-primary rounded-full h-4">
                            <div className="bg-accent h-4 rounded-full" style={{ width: `${overallProgress}%` }}></div>
                        </div>
                        <p className="text-right mt-1 font-semibold text-accent">{overallProgress.toFixed(1)}% paid off</p>
                    </div>
                    <p className="text-sm text-text-secondary mt-2">Total Minimum Payments: <span className="font-semibold text-text-primary">{formatCurrency(totalMinimumPayments)}/month</span></p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-text-primary">Active Debts</h2>
                    {!isAdding && (
                        <button 
                            onClick={() => setIsAdding(true)} 
                            className="flex items-center space-x-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                        >
                            <Icons.Plus className="w-5 h-5" />
                            <span>Add Debt</span>
                        </button>
                    )}
                </div>

                {isAdding && <AddDebtForm onSave={handleSaveDebt} onCancel={() => setIsAdding(false)} />}
                
                {state.debts.sort((a,b) => b.interestRate - a.interestRate).map(debt => (
                    <DebtItem key={debt.id} debt={debt} />
                ))}
            </div>
        </div>
    );
};

export default DebtDashboard;
