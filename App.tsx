
import React, { useState, useCallback } from 'react';
import { FinancialProvider } from './context/FinancialContext';
import { View } from './types';
import { Icons } from './components/ui/Icons';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Debts from './components/Debts';
import Income from './components/Income';
import Investments from './components/Investments';
import Purchases from './components/Purchases';
import Sync from './components/Sync';
import Rundown from './components/Rundown';

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

  const navItems = [
    { view: 'dashboard', icon: Icons.Dashboard, label: 'Dashboard' },
    { view: 'expenses', icon: Icons.Expenses, label: 'Expenses' },
    { view: 'debts', icon: Icons.Debts, label: 'Debt Center' },
    { view: 'income', icon: Icons.Income, label: 'Income' },
    { view: 'investments', icon: Icons.Investments, label: 'Investments' },
    { view: 'purchases', icon: Icons.Purchases, label: 'Purchases' },
    { view: 'rundown', icon: Icons.Rundown, label: 'Rundown' },
    { view: 'sync', icon: Icons.Sync, label: 'Sync & Backup' },
  ] as const;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'expenses': return <Expenses />;
      case 'debts': return <Debts />;
      case 'income': return <Income />;
      case 'investments': return <Investments />;
      case 'purchases': return <Purchases />;
      case 'rundown': return <Rundown />;
      case 'sync': return <Sync />;
      default: return <Dashboard />;
    }
  };
  
  return (
    <div className="flex h-screen bg-background text-text-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface flex-shrink-0 border-r border-primary/50">
        <div className="flex items-center justify-center h-20 border-b border-primary/50">
          <Icons.Goal className="w-8 h-8 text-accent" />
          <span className="ml-2 text-xl font-bold">WaveFinances</span>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <header className="flex items-center justify-between p-4 bg-surface shadow-sm md:hidden border-b border-primary/50">
          <div className="flex items-center">
            <Icons.Goal className="w-7 h-7 text-accent" />
            <span className="ml-2 text-lg font-bold">WaveFinances</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-primary/50 md:hidden flex justify-around">
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
