import React, { useMemo, useState, useCallback } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import { getFinancialInsights, getFinancialRundown } from '../services/geminiService';
import { PurchaseStatus } from '../types';

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
                <Icons.Goal className="w-6 h-6 text-brand"/>
            </CardHeader>
            <CardContent>
                <div className="w-full bg-primary rounded-full h-4">
                    <div className="bg-brand h-4 rounded-full" style={{ width: `${progress}%` }}></div>
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
        const currentMonthKey = '2025-11'; 

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
                <CardTitle>This Month's Balance (Nov 2025)</CardTitle>
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
                <hr className="border-secondary" />
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

const PlannedPurchases: React.FC = () => {
    const { state } = useFinancials();

    const { plannedPurchases, totalPlannedCost, currentNetFlow, projectedNetFlow } = useMemo(() => {
        const planned = state.purchases.filter(p => p.status === PurchaseStatus.Considering);
        const totalCost = planned.reduce((sum, p) => sum + p.cost, 0);

        const currentMonthKey = '2025-11'; // Using fixed month for consistency with mock data
        const income = state.income.filter(i => i.date.startsWith(currentMonthKey)).reduce((sum, i) => sum + i.amount, 0);
        const expenses = state.expenses.filter(e => e.date.startsWith(currentMonthKey)).reduce((sum, e) => sum + e.amount, 0);
        const netFlow = income - expenses;

        const projectedFlow = netFlow - totalCost;

        return {
            plannedPurchases: planned,
            totalPlannedCost: totalCost,
            currentNetFlow: netFlow,
            projectedNetFlow: projectedFlow,
        };
    }, [state.purchases, state.income, state.expenses]);

    if (plannedPurchases.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Planned Purchases Impact</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2 p-3 bg-primary/50 rounded-lg">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-secondary">Current Month Net Flow</span>
                            <span className="font-semibold">{formatCurrency(currentNetFlow)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-secondary">Planned Spending</span>
                            <span className="font-semibold text-danger">{formatCurrency(-totalPlannedCost)}</span>
                        </div>
                        <hr className="border-secondary" />
                        <div className="flex justify-between items-center font-bold">
                            <span className="text-text-primary">Projected Net Flow</span>
                            <span className={projectedNetFlow >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(projectedNetFlow)}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-text-primary mb-2">Items Considered:</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {plannedPurchases.map(p => (
                                <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-primary">
                                    <span className="text-text-secondary">{p.name}</span>
                                    <span className="font-medium text-text-primary">{formatCurrency(p.cost)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
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
            if (result.includes("Could not") || result.includes("unexpected error")) {
                setError(result);
            } else {
                setInsight(result);
            }
        } catch (err) {
            setError('An unknown error occurred while fetching insights.');
            console.error(err);
        }
        setIsLoading(false);
    }, [state]);

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <CardTitle>AI Financial Insight</CardTitle>
                <Icons.Insights className="w-6 h-6 text-brand"/>
            </CardHeader>
            <CardContent>
                {isLoading && <p className="text-text-secondary animate-pulse">Generating insight...</p>}
                {error && <p className="text-text-secondary text-sm">{error}</p>}
                {insight && <p className="text-text-secondary italic">"{insight}"</p>}
                {!isLoading && !insight && !error && <p className="text-text-secondary">Click the button to generate an AI-powered insight based on your current data.</p>}
                <button 
                    onClick={generateInsight} 
                    disabled={isLoading}
                    className="mt-4 w-full bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors disabled:bg-primary disabled:text-text-secondary disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? 'Thinking...' : 'Generate Insight'}
                </button>
            </CardContent>
        </Card>
    );
}

const FormattedResponse: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n').filter(line => line.trim() !== '' && line.trim() !== '---');

    return (
        <div className="space-y-4 text-text-secondary leading-relaxed">
            {lines.map((line, index) => {
                if (line.startsWith('##')) {
                    return <h3 key={index} className="text-xl font-semibold text-text-primary mt-6 mb-2">{line.replace('##', '').trim()}</h3>;
                }
                if (line.startsWith('#')) {
                    return <h2 key={index} className="text-2xl font-bold text-text-primary mb-4">{line.replace('#', '').trim()}</h2>;
                }
                if (line.startsWith('*')) {
                    return <p key={index} className="ml-4 flex items-start"><span className="mr-2 mt-1 text-brand">●</span><span>{line.replace('*', '').trim()}</span></p>;
                }
                return <p key={index}>{line}</p>;
            })}
        </div>
    );
};

const RundownEngine: React.FC = () => {
    const { state } = useFinancials();
    const [months, setMonths] = useState<number>(24);
    const [forecast, setForecast] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerateRundown = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setForecast('');
        try {
            const result = await getFinancialRundown(state, months);
            if(result.includes("Could not") || result.includes("unexpected error")) {
                setError(result);
            } else {
                setForecast(result);
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred while generating the rundown.');
        } finally {
            setIsLoading(false);
        }
    }, [state, months]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Icons.Rundown className="w-6 h-6 mr-3 text-brand"/>
                    Financial Rundown
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <div className="flex-1 w-full sm:w-auto">
                        <label htmlFor="rundown-months-dash" className="block text-sm font-medium text-text-secondary mb-2">Months to Forecast</label>
                        <input
                            id="rundown-months-dash"
                            type="number"
                            value={months}
                            onChange={(e) => setMonths(parseInt(e.target.value, 10))}
                            min="6"
                            max="60"
                            step="1"
                            className="w-full bg-background p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary"
                        />
                    </div>
                    <button
                        onClick={handleGenerateRundown}
                        disabled={isLoading}
                        className="w-full sm:w-auto mt-4 sm:mt-0 self-end px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:bg-primary disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <Icons.Rundown className="w-5 h-5 mr-2 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <span>Generate Rundown</span>
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-danger/20 rounded-lg">
                        <p className="font-semibold text-danger">Error</p>
                        <p className="text-text-secondary">{error}</p>
                    </div>
                )}

                {isLoading && (
                    <div className="mt-4 text-center">
                        <p className="animate-pulse text-text-secondary">Generating your financial forecast...</p>
                        <p className="text-sm mt-2 text-text-secondary/70">This may take a moment.</p>
                    </div>
                )}

                {forecast && (
                    <div className="mt-4 border-t border-secondary pt-4 animate-fade-in">
                        <FormattedResponse content={forecast} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Good morning, Sam</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><NetWorthTracker /></div>
        <GoalProgress />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MonthlySummary />
        <PlannedPurchases />
        <InsightsEngine />
      </div>
      <div className="animate-fade-in">
        <RundownEngine />
      </div>
    </div>
  );
};

export default Dashboard;