import React, { useState, useMemo } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Purchase, PurchaseStatus, ExpenseCategory, ExpenseMode } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


const formatCurrency = (value: number) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ItemTypes = {
  PURCHASE: 'purchase',
};

const PurchaseCard: React.FC<{ purchase: Purchase }> = ({ purchase }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PURCHASE,
    item: { id: purchase.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="cursor-grab">
        <Card className="mb-4 bg-primary hover:shadow-lg">
            <CardContent className="p-3">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-text-primary">{purchase.name}</h4>
                    <span className="font-bold text-accent text-lg">{formatCurrency(purchase.cost)}</span>
                </div>
                <p className="text-sm text-text-secondary italic mt-2 mb-3">"{purchase.justification}"</p>
                <div className="text-xs text-text-secondary flex justify-between items-center">
                    <span>{purchase.category}</span>
                    <span>Added: {new Date(purchase.dateAdded).toLocaleDateString()}</span>
                </div>
            </CardContent>
        </Card>
    </div>
  );
};


const StatusColumn: React.FC<{ status: PurchaseStatus; children: React.ReactNode }> = ({ status, children }) => {
    const { dispatch } = useFinancials();
    
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.PURCHASE,
        drop: (item: { id: string }) => handleDrop(item.id),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const handleDrop = (purchaseId: string) => {
        dispatch({ type: 'UPDATE_PURCHASE_STATUS', payload: { id: purchaseId, status } });

        if (status === PurchaseStatus.Purchased) {
            const { purchases } = (window as any).__financial_context_state; // Hack to get latest state
            const purchase = purchases.find((p: Purchase) => p.id === purchaseId);
            if (purchase) {
                dispatch({
                    type: 'ADD_EXPENSE',
                    payload: {
                        id: `exp-from-pur-${purchase.id}`,
                        date: new Date().toISOString().split('T')[0],
                        category: purchase.category,
                        amount: purchase.cost,
                        description: purchase.name,
                        mode: ExpenseMode.Growth, // Defaulting to growth, could be made configurable
                    }
                });
            }
        }
    };

    const getStatusColor = () => {
        switch(status) {
            case PurchaseStatus.Considering: return 'border-yellow-500';
            case PurchaseStatus.Purchased: return 'border-green-500';
            case PurchaseStatus.Declined: return 'border-red-500';
            default: return 'border-primary';
        }
    }

    return (
        <div 
            ref={drop}
            className={`flex-1 p-4 rounded-lg bg-surface border-t-4 ${getStatusColor()} ${isOver ? 'bg-primary' : ''}`}
        >
            <h3 className="font-bold text-lg mb-4 text-text-primary">{status}</h3>
            <div className="space-y-2 min-h-[200px]">
                {children}
            </div>
        </div>
    );
};

const AddPurchaseForm: React.FC<{ onSave: (data: Omit<Purchase, 'id' | 'status' | 'dateAdded'>) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Personal);
    const [justification, setJustification] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && justification && !isNaN(parseFloat(cost))) {
            onSave({ name, cost: parseFloat(cost), category, justification });
        } else {
            alert('Please fill all fields with valid data.');
        }
    };
    
    return (
        <Card className="mb-6 animate-fade-in">
            <CardHeader><CardTitle>Add a Purchase Idea</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Item Name</label>
                            <input type="text" placeholder="e.g., New MacBook Pro" value={name} onChange={e => setName(e.target.value)} className="w-full bg-primary p-2 rounded-md" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Estimated Cost (€)</label>
                            <input type="number" placeholder="2500" value={cost} onChange={e => setCost(e.target.value)} className="w-full bg-primary p-2 rounded-md" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="w-full bg-primary p-2 rounded-md">
                                {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Justification (Why do you want this?)</label>
                        <textarea placeholder="It will improve my productivity for consulting work..." value={justification} onChange={e => setJustification(e.target.value)} className="w-full bg-primary p-2 rounded-md" required />
                    </div>
                     <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary rounded-lg hover:bg-secondary transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-accent rounded-lg hover:bg-accent-hover text-white font-semibold transition-colors">Add Idea</button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};


const PurchasesComponent: React.FC = () => {
    const { state, dispatch } = useFinancials();
    const [isAdding, setIsAdding] = useState(false);
    
    // A bit of a hack to ensure the drop handler has access to the latest state for creating an expense.
    (window as any).__financial_context_state = state;

    const purchasesByStatus = useMemo(() => {
        return state.purchases.reduce((acc, p) => {
            acc[p.status] = acc[p.status] || [];
            acc[p.status].push(p);
            return acc;
        }, {} as Record<PurchaseStatus, Purchase[]>);
    }, [state.purchases]);

    const handleSavePurchase = (data: Omit<Purchase, 'id' | 'status' | 'dateAdded'>) => {
        const newPurchase: Purchase = {
            ...data,
            id: `p-${Date.now()}`,
            status: PurchaseStatus.Considering,
            dateAdded: new Date().toISOString().split('T')[0],
        };
        dispatch({ type: 'ADD_PURCHASE', payload: newPurchase });
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Purchase Deliberation</h1>
                    <p className="text-text-secondary mt-1">Think before you spend. Drag cards to change their status.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="flex items-center space-x-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors">
                        <Icons.Plus className="w-5 h-5" />
                        <span>Add Purchase Idea</span>
                    </button>
                )}
            </div>

            {isAdding && <AddPurchaseForm onSave={handleSavePurchase} onCancel={() => setIsAdding(false)} />}

            <div className="flex flex-col md:flex-row gap-6">
                {Object.values(PurchaseStatus).map(status => (
                    <StatusColumn key={status} status={status}>
                        {purchasesByStatus[status]?.map(p => <PurchaseCard key={p.id} purchase={p} />)}
                    </StatusColumn>
                ))}
            </div>
        </div>
    );
};

const Purchases: React.FC = () => (
    <DndProvider backend={HTML5Backend}>
        <PurchasesComponent />
    </DndProvider>
);

export default Purchases;