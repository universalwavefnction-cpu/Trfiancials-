import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Asset, InvestmentBasket, AssetCategory } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const formatCurrency = (value: number) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COLORS = ['#212529', '#0d6efd', '#6c757d', '#198754', '#adb5bd'];

interface AssetFormProps {
    onSave: (assetData: Omit<Asset, 'id'>) => void;
    onCancel: () => void;
    initialData?: Asset | null;
}

const AssetForm: React.FC<AssetFormProps> = ({ onSave, onCancel, initialData }) => {
    const isEditMode = !!initialData;
    const [name, setName] = useState(initialData?.name || '');
    const [category, setCategory] = useState<AssetCategory>(initialData?.category || AssetCategory.StocksETFs);
    const [amountInvested, setAmountInvested] = useState(initialData?.amountInvested.toString() || '');
    const [currentValue, setCurrentValue] = useState(initialData?.currentValue.toString() || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const assetData = {
            name,
            category,
            amountInvested: parseFloat(amountInvested),
            currentValue: parseFloat(currentValue),
            date,
        };

        if (name && !isNaN(assetData.amountInvested) && !isNaN(assetData.currentValue)) {
            onSave(assetData);
        } else {
            alert('Please fill all fields with valid data.');
        }
    };

    return (
        <div className="my-4 p-4 bg-primary/50 rounded-lg animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">{isEditMode ? 'Edit Asset' : 'Add New Asset'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Asset Name</label>
                        <input type="text" placeholder="e.g., Apple Inc." value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface p-2 rounded-md border border-secondary" required />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value as AssetCategory)} className="w-full bg-surface p-2 rounded-md border border-secondary">
                            {Object.values(AssetCategory).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Amount Invested (€)</label>
                        <input type="number" placeholder="1000" value={amountInvested} onChange={e => setAmountInvested(e.target.value)} className="w-full bg-surface p-2 rounded-md border border-secondary" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Current Value (€)</label>
                        <input type="number" placeholder="1200" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full bg-surface p-2 rounded-md border border-secondary" required />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Purchase Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-surface p-2 rounded-md border border-secondary" required />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary rounded-lg hover:bg-secondary/80 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-accent rounded-lg hover:bg-accent-hover text-white font-semibold transition-colors">{isEditMode ? 'Save Changes' : 'Save Asset'}</button>
                </div>
            </form>
        </div>
    );
};

const AssetActionMenu: React.FC<{ onEdit: () => void; onDelete: () => void }> = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(p => !p)} className="p-1 rounded-full text-text-secondary hover:bg-primary/50"><Icons.More className="w-5 h-5" /></button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-surface rounded-md shadow-lg z-10 border border-secondary animate-fade-in">
                    <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-primary flex items-center"><Icons.Edit className="w-4 h-4 mr-2" /> Edit</button>
                    <button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center"><Icons.Trash className="w-4 h-4 mr-2" /> Delete</button>
                </div>
            )}
        </div>
    );
};


const AssetListItem: React.FC<{ asset: Asset; onEdit: () => void; onDelete: () => void }> = ({ asset, onEdit, onDelete }) => {
    const roi = useMemo(() => {
        if (asset.amountInvested === 0) return 0;
        return ((asset.currentValue - asset.amountInvested) / asset.amountInvested) * 100;
    }, [asset.amountInvested, asset.currentValue]);
    const isPositive = roi >= 0;

    return (
        <div className="grid grid-cols-4 gap-4 items-center p-2 hover:bg-primary rounded-lg">
            <div>
                <p className="font-semibold">{asset.name}</p>
                <p className="text-sm text-text-secondary">{asset.category}</p>
            </div>
            <div className="text-right">
                <p className="font-semibold">{formatCurrency(asset.currentValue)}</p>
            </div>
            <div className={`font-bold text-right ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? '+' : ''}{roi.toFixed(2)}%
            </div>
            <div className="flex justify-end">
                <AssetActionMenu onEdit={onEdit} onDelete={onDelete} />
            </div>
        </div>
    );
};

const AllocationByBasketChart: React.FC = () => {
    const { state } = useFinancials();
    const data = useMemo(() => {
        return state.investmentBaskets.map(basket => ({
            name: basket.name,
            value: basket.assets.reduce((sum, asset) => sum + asset.currentValue, 0),
        }));
    }, [state.investmentBaskets]);

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}>
                    {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#ffffff', border: '1px solid #dee2e6', borderRadius: '0.5rem'}}/>
            </PieChart>
        </ResponsiveContainer>
    );
};

const InvestmentBasketCard: React.FC<{
    basket: InvestmentBasket;
    onAddAsset: (basketId: string) => void;
    onEditAsset: (asset: Asset, basketId: string) => void;
    onDeleteAsset: (assetId: string, basketId: string) => void;
    editingAsset: { asset: Asset, basketId: string } | null;
    addingToBasketId: string | null;
    onSaveAsset: (assetData: Omit<Asset, 'id'>, basketId: string, assetId?: string) => void;
    onCancelForm: () => void;
}> = ({ basket, onAddAsset, onEditAsset, onDeleteAsset, editingAsset, addingToBasketId, onSaveAsset, onCancelForm }) => {
    const { dispatch } = useFinancials();
    const [isEditingName, setIsEditingName] = useState(false);
    const [name, setName] = useState(basket.name);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const { totalValue, totalInvested, roi } = useMemo(() => {
        const value = basket.assets.reduce((sum, a) => sum + a.currentValue, 0);
        const invested = basket.assets.reduce((sum, a) => sum + a.amountInvested, 0);
        const returnOI = invested > 0 ? ((value - invested) / invested) * 100 : 0;
        return { totalValue: value, totalInvested: invested, roi: returnOI };
    }, [basket.assets]);

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isEditingName]);

    const handleNameSave = () => {
        if (name.trim()) {
            dispatch({ type: 'UPDATE_BASKET_NAME', payload: { basketId: basket.id, name: name.trim() } });
        } else {
            setName(basket.name); // Revert if empty
        }
        setIsEditingName(false);
    };
    
    const handleSave = (assetData: Omit<Asset, 'id'>) => {
        onSaveAsset(assetData, basket.id, editingAsset?.asset.id);
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    {isEditingName ? (
                        <input
                            ref={nameInputRef}
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onBlur={handleNameSave}
                            onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                            className="text-lg font-semibold bg-transparent border-b-2 border-brand focus:outline-none"
                        />
                    ) : (
                        <div className="flex items-center group" onClick={() => setIsEditingName(true)}>
                            <CardTitle className="cursor-pointer">{basket.name}</CardTitle>
                            <Icons.Edit className="w-4 h-4 ml-2 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </div>
                <div className="flex justify-between text-sm mt-2">
                    <span className="text-text-secondary">Total Value: <span className="font-semibold text-text-primary">{formatCurrency(totalValue)}</span></span>
                    <span className={`font-semibold ${roi >= 0 ? 'text-success' : 'text-danger'}`}>{roi.toFixed(2)}%</span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="space-y-1 max-h-60 overflow-y-auto">
                     {basket.assets.map(asset => (
                        <AssetListItem key={asset.id} asset={asset} onEdit={() => onEditAsset(asset, basket.id)} onDelete={() => onDeleteAsset(asset.id, basket.id)} />
                    ))}
                </div>

                {(addingToBasketId === basket.id || (editingAsset && editingAsset.basketId === basket.id)) && (
                    <AssetForm onSave={handleSave} onCancel={onCancelForm} initialData={editingAsset?.asset} />
                )}

                <div className="mt-auto pt-4">
                     {!(addingToBasketId || editingAsset) && (
                        <button onClick={() => onAddAsset(basket.id)} className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-primary text-text-primary font-semibold rounded-lg hover:bg-secondary/80 transition-colors text-sm">
                            <Icons.Plus className="w-4 h-4" />
                            <span>Add Asset</span>
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


const PortfolioManager: React.FC = () => {
    const { state, dispatch } = useFinancials();
    const [editingAsset, setEditingAsset] = useState<{ asset: Asset, basketId: string } | null>(null);
    const [addingToBasketId, setAddingToBasketId] = useState<string | null>(null);

    const totalValue = useMemo(() => {
        return state.investmentBaskets.flatMap(b => b.assets).reduce((sum, asset) => sum + asset.currentValue, 0);
    }, [state.investmentBaskets]);

    const handleAddAsset = (basketId: string) => {
        setEditingAsset(null);
        setAddingToBasketId(basketId);
    };

    const handleEditAsset = (asset: Asset, basketId: string) => {
        setAddingToBasketId(null);
        setEditingAsset({ asset, basketId });
    };
    
    const handleDeleteAsset = (assetId: string, basketId: string) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            dispatch({ type: 'DELETE_ASSET', payload: { basketId, assetId } });
        }
    }

    const handleSaveAsset = (assetData: Omit<Asset, 'id'>, basketId: string, assetId?: string) => {
        if (assetId) { // It's an update
            dispatch({ type: 'UPDATE_ASSET', payload: { basketId, asset: { id: assetId, ...assetData } } });
        } else { // It's a new asset
            dispatch({ type: 'ADD_ASSET', payload: { basketId, assetData } });
        }
        setEditingAsset(null);
        setAddingToBasketId(null);
    };
    
    const handleCancelForm = () => {
        setEditingAsset(null);
        setAddingToBasketId(null);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Investment Portfolio</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Total Portfolio Value</CardTitle></CardHeader>
                    <CardContent><p className="text-4xl font-bold">{formatCurrency(totalValue)}</p></CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Allocation by Basket</CardTitle></CardHeader>
                    <CardContent><AllocationByBasketChart /></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {state.investmentBaskets.map(basket => (
                    <InvestmentBasketCard 
                        key={basket.id} 
                        basket={basket}
                        onAddAsset={handleAddAsset}
                        onEditAsset={handleEditAsset}
                        onDeleteAsset={handleDeleteAsset}
                        editingAsset={editingAsset}
                        addingToBasketId={addingToBasketId}
                        onSaveAsset={handleSaveAsset}
                        onCancelForm={handleCancelForm}
                    />
                ))}
            </div>
        </div>
    );
};

export default PortfolioManager;
