
import React, { useMemo, useState } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Debt } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';

const formatCurrency = (value: number) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface DebtFormProps {
    onSave?: (debt: Omit<Debt, 'id'>) => void;
    onUpdate?: (debt: Debt) => void;
    onCancel: () => void;
    initialData?: Debt | null;
}

const DebtForm: React.FC<DebtFormProps> = ({ onSave, onUpdate, onCancel, initialData }) => {
    const isEditMode = !!initialData;
    const [name, setName] = useState(initialData?.name || '');
    const [originalAmount, setOriginalAmount] = useState(initialData?.originalAmount.toString() || '');
    const [currentBalance, setCurrentBalance] = useState(initialData?.currentBalance.toString() || '');
    const [interestRate, setInterestRate] = useState(initialData?.interestRate.toString() || '');
    const [minimumPayment, setMinimumPayment] = useState(initialData?.minimumPayment.toString() || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const debtData: Omit<Debt, 'id'> = {
            name,
            originalAmount: parseFloat(originalAmount),
            currentBalance: parseFloat(currentBalance),
            interestRate: parseFloat(interestRate),
            minimumPayment: parseFloat(minimumPayment),
        };
        
        if (name && !isNaN(debtData.originalAmount) && !isNaN(debtData.currentBalance) && !isNaN(debtData.interestRate) && !isNaN(debtData.minimumPayment)) {
            if (isEditMode && onUpdate && initialData) {
                onUpdate({ ...debtData, id: initialData.id });
            } else if (!isEditMode && onSave) {
                onSave(debtData);
            }
        } else {
            alert("Please fill all fields with valid data.");
        }
    };

    return (
        <Card className="my-4 animate-fade-in">
            <CardHeader>
                <CardTitle>{isEditMode ? 'Edit Debt' : 'Add New Debt'}</CardTitle>
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
                        <button type="submit" className="px-4 py-2 bg-accent rounded-lg hover:bg-accent-hover text-white font-semibold transition-colors">{isEditMode ? 'Save Changes' : 'Save Debt'}</button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};


const DebtDashboard: React.FC = () => {
    const { state, dispatch } = useFinancials();
    const [isAdding, setIsAdding] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    
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
        const debtToAdd: Debt = { id: `d-${Date.now()}`, ...newDebtData };
        dispatch({ type: 'ADD_DEBT', payload: debtToAdd });
        setIsAdding(false);
    };

    const handleUpdateDebt = (updatedDebt: Debt) => {
        dispatch({ type: 'UPDATE_DEBT', payload: updatedDebt });
        setEditingDebt(null);
    };

    const handleDeleteDebt = (id: string) => {
        if (window.confirm('Are you sure you want to delete this debt?')) {
            dispatch({ type: 'DELETE_DEBT', payload: { id } });
        }
    };

    const handleStartEditing = (debt: Debt) => {
        setIsAdding(false);
        setEditingDebt(debt);
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
                    {!isAdding && !editingDebt && (
                        <button 
                            onClick={() => setIsAdding(true)} 
                            className="flex items-center space-x-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                        >
                            <Icons.Plus className="w-5 h-5" />
                            <span>Add Debt</span>
                        </button>
                    )}
                </div>
                
                {isAdding && <DebtForm onSave={handleSaveDebt} onCancel={() => setIsAdding(false)} />}
                {editingDebt && <DebtForm initialData={editingDebt} onUpdate={handleUpdateDebt} onCancel={() => setEditingDebt(null)} />}
                
                <div className="space-y-4">
                    {state.debts.sort((a,b) => b.interestRate - a.interestRate).map(debt => {
                        const progress = (1 - debt.currentBalance / debt.originalAmount) * 100;
                        return (
                            <Card key={debt.id} className="hover:shadow-accent/20 transition-shadow group">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>{debt.name}</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-sm font-bold px-2 py-1 rounded-full ${debt.interestRate > 15 ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                                                {debt.interestRate.toFixed(1)}% APR
                                            </span>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                                <button onClick={() => handleStartEditing(debt)} className="p-1 rounded-full text-text-secondary hover:text-accent hover:bg-surface"><Icons.Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteDebt(debt.id)} className="p-1 rounded-full text-text-secondary hover:text-danger hover:bg-surface"><Icons.Trash className="w-4 h-4" /></button>
                                            </div>
                                        </div>
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
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default DebtDashboard;