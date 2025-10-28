
import React, { useState, useCallback } from 'react';
import { FinancialProvider, useFinancials } from './context/FinancialContext';
import { View } from './types';
import { Icons } from './components/ui/Icons';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Debts from './components/Debts';
import Income from './components/Income';
import Investments from './components/Investments';
import Purchases from './components/Purchases';

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg group ${
      isActive
        ? 'bg-accent text-white'
        : 'text-text-secondary hover:bg-primary hover:text-text-primary'
    }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    <span className="truncate">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs font-medium transition-colors duration-200 group ${
        isActive
          ? 'text-accent'
          : 'text-text-secondary hover:text-accent'
      }`}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="truncate">{label}</span>
    </button>
  );

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { state, dispatch } = useFinancials();

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'zenith_finance_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [state]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          // Basic validation
          if (json.expenses && json.debts && json.income && json.assets) {
            dispatch({ type: 'SET_STATE', payload: json });
            alert('Data imported successfully!');
          } else {
            alert('Invalid file format.');
          }
        } catch (error) {
          alert('Error reading file.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input to allow re-uploading the same file
    event.target.value = '';
  }, [dispatch]);

  const navItems = [
    { view: 'dashboard', icon: Icons.Dashboard, label: 'Dashboard' },
    { view: 'expenses', icon: Icons.Expenses, label: 'Expenses' },
    { view: 'debts', icon: Icons.Debts, label: 'Debt Center' },
    { view: 'income', icon: Icons.Income, label: 'Income' },
    { view: 'investments', icon: Icons.Investments, label: 'Investments' },
    { view: 'purchases', icon: Icons.Purchases, label: 'Purchases' },
  ] as const;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'expenses': return <Expenses />;
      case 'debts': return <Debts />;
      case 'income': return <Income />;
      case 'investments': return <Investments />;
      case 'purchases': return <Purchases />;
      default: return <Dashboard />;
    }
  };
  
  return (
    <div className="flex h-screen bg-background text-text-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface flex-shrink-0">
        <div className="flex items-center justify-center h-20 border-b border-primary">
          <Icons.Goal className="w-8 h-8 text-accent" />
          <span className="ml-2 text-xl font-bold">Zenith</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map(item => (
                <NavItem 
                    key={item.view}
                    icon={item.icon} 
                    label={item.label}
                    isActive={currentView === item.view}
                    onClick={() => setCurrentView(item.view)}
                />
            ))}
        </nav>
        <div className="px-4 py-4 border-t border-primary space-y-2">
            <button onClick={handleExport} className="flex items-center w-full px-4 py-3 text-sm font-medium text-text-secondary hover:bg-primary hover:text-text-primary rounded-lg group">
                <Icons.JSON className="w-5 h-5 mr-3" /> Export Data
            </button>
             <label className="flex items-center w-full px-4 py-3 text-sm font-medium text-text-secondary hover:bg-primary hover:text-text-primary rounded-lg group cursor-pointer">
                <Icons.Upload className="w-5 h-5 mr-3" />
                <span>Import Data</span>
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <header className="flex items-center justify-between p-4 bg-surface shadow-md md:hidden">
          <div className="flex items-center">
            <Icons.Goal className="w-7 h-7 text-accent" />
            <span className="ml-2 text-lg font-bold">Zenith</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-primary md:hidden flex justify-around">
        {navItems.map(item => (
            <MobileNavItem 
                key={item.view}
                icon={item.icon}
                label={item.label}
                isActive={currentView === item.view}
                onClick={() => setCurrentView(item.view)}
            />
        ))}
      </nav>
    </div>
  );
};


const App: React.FC = () => {
    return (
        <FinancialProvider>
            <AppContent />
        </FinancialProvider>
    )
}

export default App;