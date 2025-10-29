
import React, { useState, useMemo } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Asset } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const formatCurrency = (value: number) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COLORS = ['#38b2ac', '#4299e1', '#9f7aea', '#ed8936', '#f56565'];

const AssetAllocationChart: React.FC = () => {
    const { state } = useFinancials();

    const data = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        state.assets.forEach(asset => {
            categoryMap[asset.category] = (categoryMap[asset.category] || 0) + asset.currentValue;
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [state.assets]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    // Fix: The `percent` prop from recharts can be undefined. Using `|| 0` ensures we always have a number
                    // for the multiplication, preventing the type error on the arithmetic operation.
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#2d3748', border: 'none'}}/>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

const AssetListItem: React.FC<{ asset: Asset }> = ({ asset }) => {
    const roi = useMemo(() => {
        if (asset.amountInvested === 0) return 0;
        return ((asset.currentValue - asset.amountInvested) / asset.amountInvested) * 100;
    }, [asset.amountInvested, asset.currentValue]);

    const isPositive = roi >= 0;

    return (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 items-center p-3 hover:bg-primary rounded-lg">
            <div>
                <p className="font-semibold">{asset.name}</p>
                <p className="text-sm text-text-secondary">{asset.category}</p>
            </div>
            <div className="text-right md:text-left">
                <p className="font-semibold">{formatCurrency(asset.currentValue)}</p>
                <p className="text-sm text-text-secondary">Value</p>
            </div>
            <div className="text-right md:text-left">
                <p className="font-semibold">{formatCurrency(asset.amountInvested)}</p>
                <p className="text-sm text-text-secondary">Invested</p>
            </div>
            <div className={`font-bold text-right ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? '+' : ''}{roi.toFixed(2)}%
            </div>
        </div>
    );
};

const PortfolioManager: React.FC = () => {
    const { state } = useFinancials();
    
    const totalValue = useMemo(() => {
        return state.assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    }, [state.assets]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Investment Portfolio</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Total Portfolio Value</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatCurrency(totalValue)}</p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Asset Allocation</CardTitle></CardHeader>
                    <CardContent>
                        <AssetAllocationChart />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Asset List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {state.assets.map(asset => (
                            <AssetListItem key={asset.id} asset={asset} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PortfolioManager;
