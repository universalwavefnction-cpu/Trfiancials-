import React, { useCallback } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';

const Sync: React.FC = () => {
    const { state, dispatch } = useFinancials();

    const handleExport = useCallback(() => {
        const dataStr = JSON.stringify(state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
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
                        if (window.confirm("Are you sure? Importing data will overwrite all existing data on this device.")) {
                            dispatch({ type: 'SET_STATE', payload: json });
                            alert('Data imported successfully!');
                        }
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

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-text-primary">Sync & Backup</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Icons.Insights className="w-5 h-5 mr-2 text-accent" />
                        How Your Data is Stored
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-text-secondary">
                    <p>
                        <strong>Zenith Finance Tracker is built for privacy.</strong> All of your financial data is stored
                        exclusively on your current device and in your browser's local storage.
                    </p>
                    <p>
                        We do not have a server, and we never see, store, or have access to your information.
                        This means your data is secure and private, but it also means it does not automatically sync
                        between your devices (e.g., from your computer to your phone).
                    </p>
                    <p>
                        To use your data on another device, you must manually transfer it using the Export/Import process below.
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                           <Icons.Upload className="w-5 h-5 mr-2" />
                           Step 1: Export Data From a Device
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-text-secondary mb-4">
                            Click the button below to download a complete backup of your data as a single JSON file.
                            You can use this file to move your data to another device or to keep as a secure backup.
                        </p>
                        <button 
                            onClick={handleExport} 
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                        >
                            <Icons.JSON className="w-5 h-5" />
                            <span>Export Data (.json)</span>
                        </button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                           <Icons.JSON className="w-5 h-5 mr-2" />
                           Step 2: Import Data to New Device
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-text-secondary mb-4">
                            Select the <code>.json</code> file you exported from another device. This will replace all data on this device.
                        </p>
                         <label className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-text-primary font-semibold rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                            <Icons.Upload className="w-5 h-5" />
                            <span>Import Data (.json)</span>
                            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                        </label>
                         <div className="mt-4 text-sm text-warning/80 flex items-start space-x-2">
                            <Icons.Warning className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Warning:</strong> Importing a file will completely overwrite your current data. This action cannot be undone.</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center">
                        <Icons.Settings className="w-5 h-5 mr-2 text-secondary" />
                        Recommended Workflow
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-text-secondary">
                     <p>1. Make all your entries and updates on one primary device (e.g., your computer).</p>
                     <p>2. When you are done, <strong>Export</strong> your data from that primary device.</p>
                     <p>3. Transfer the file to your other devices (e.g., via email to yourself, AirDrop, Google Drive).</p>
                     <p>4. <strong>Import</strong> the file on your other devices to have the latest data available for viewing.</p>
                </CardContent>
            </Card>

        </div>
    );
}

export default Sync;
