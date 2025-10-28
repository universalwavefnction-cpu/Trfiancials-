import React, { useMemo, useState, useCallback } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import { getFinancialInsights } from '../services/geminiService';

const formatCurrency = (value: number) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const NetWorthTracker: React.FC = () => {
    const { state } = useFinancials();
    const { totalAssets, totalDebts, netWorth } = useMemo(() => {
        const totalAssets = state.assets.reduce((sum, asset) => sum + asset.currentValue, 0);
        const totalDebts = state.debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
        const netWorth = totalAssets - totalDebts;
        return { totalAssets, totalDebts, netWorth };
    }, [state.assets, state.debts]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold text-text-primary">{formatCurrency(netWorth)}</p>
                <div className="flex justify-between mt-4 text-sm">
                    <div>
                        <p className="text-text-secondary">Total Assets</p>
                        <p className="font-semibold text-success">{formatCurrency(totalAssets)}</p>
                    </div>
                    <div>
                        <p className="text-text-secondary">Total Liabilities</p>
                        <p className="font-semibold text-danger">{formatCurrency(totalDebts)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const GoalProgress: React.FC = () => {
    const { state } = useFinancials();
    const goal = 1000000;
    const netWorth = useMemo(() => {
        const totalAssets = state.assets.reduce((sum, asset) => sum + asset.currentValue, 0);
        const totalDebts = state.debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
        return totalAssets - totalDebts;
    }, [state.assets, state.debts]);
    const progress = Math.max(0, (netWorth / goal) * 100);

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <CardTitle>€1M Goal</CardTitle>
                <Icons.Goal className="w-6 h-6 text-accent"/>
            </CardHeader>
            <CardContent>
                <div className="w-full bg-primary rounded-full h-4">
                    <div className="bg-accent h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between mt-2 text-sm font-medium">
                    <span>{formatCurrency(netWorth)}</span>
                    <span className="text-text-secondary">{progress.toFixed(2)}%</span>
                </div>
            </CardContent>
        </Card>
    );
};

const MonthlySummary: React.FC = () => {
    const { state } = useFinancials();

    const { income, expenses, netFlow } = useMemo(() => {
        // Using a fixed month to ensure visibility with mock data.
        // In a live app, this would be the current month:
        // const now = new Date();
        // const currentMonthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        const currentMonthKey = '2024-11'; 

        const income = state.income
            .filter(i => i.date.startsWith(currentMonthKey))
            .reduce((sum, i) => sum + i.amount, 0);

        const expenses = state.expenses
            .filter(e => e.date.startsWith(currentMonthKey))
            .reduce((sum, e) => sum + e.amount, 0);
        
        const netFlow = income - expenses;
        return { income, expenses, netFlow };
    }, [state.income, state.expenses]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>This Month's Balance (Nov 2024)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Icons.IncomeIcon className="w-5 h-5 text-success"/>
                        <span className="text-text-secondary">Income</span>
                    </div>
                    <span className="font-bold text-lg text-success">{formatCurrency(income)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Icons.Expense className="w-5 h-5 text-danger"/>
                        <span className="text-text-secondary">Expenses</span>
                    </div>
                    <span className="font-bold text-lg text-danger">{formatCurrency(expenses)}</span>
                </div>
                <hr className="border-primary" />
                 <div className="flex justify-between items-center">
                    <span className="font-semibold text-text-primary">Net Cash Flow</span>
                    <span className={`font-bold text-2xl ${netFlow >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(netFlow)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

const InsightsEngine: React.FC = () => {
    const { state } = useFinancials();
    const [insight, setInsight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateInsight = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setInsight('');
        try {
            const financialSummary = `
                Expenses: ${state.expenses.length} transactions this month.
                Debts: ${state.debts.length} active debts, total balance ${state.debts.reduce((s, d) => s + d.currentBalance, 0)} EUR.
                Income: ${state.income.length} sources this month.
                Assets: ${state.assets.length} assets, total value ${state.assets.reduce((s, a) => s + a.currentValue, 0)} EUR.
            `;
            const result = await getFinancialInsights(financialSummary);
            setInsight(result);
        } catch (err) {
            setError('Could not fetch insights. Please check API key.');
            console.error(err);
        }
        setIsLoading(false);
    }, [state]);

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <CardTitle>AI Financial Insight</CardTitle>
                <Icons.Insights className="w-6 h-6 text-accent"/>
            </CardHeader>
            <CardContent>
                {isLoading && <p className="text-text-secondary animate-pulse">Generating insight...</p>}
                {error && <p className="text-danger text-sm">{error}</p>}
                {insight && <p className="text-text-secondary italic">"{insight}"</p>}
                {!isLoading && !insight && !error && <p className="text-text-secondary">Click the button to generate an AI-powered insight based on your current data.</p>}
                <button 
                    onClick={generateInsight} 
                    disabled={isLoading}
                    className="mt-4 w-full bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors disabled:bg-primary disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? 'Thinking...' : 'Generate Insight'}
                </button>
            </CardContent>
        </Card>
    );
}


const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><NetWorthTracker /></div>
        <GoalProgress />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthlySummary />
        <InsightsEngine />
      </div>
    </div>
  );
};

export default Dashboard;