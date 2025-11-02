import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';

const Settings: React.FC = () => {
    const [storedApiKey, setStoredApiKey] = useLocalStorage<string>('geminiApiKey', '');
    const [apiKeyInput, setApiKeyInput] = useState(storedApiKey);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

    useEffect(() => {
        setApiKeyInput(storedApiKey);
    }, [storedApiKey]);

    const handleSave = () => {
        setStoredApiKey(apiKeyInput);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000); // Hide message after 3 seconds
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Icons.Settings className="w-5 h-5 mr-2 text-brand" />
                        API Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-text-secondary mb-2">
                            To use AI-powered features like Financial Insights and Rundowns, you need to provide your own Google Gemini API key.
                            Your key is stored securely in your browser's local storage and is never sent to our servers.
                        </p>
                        <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline">
                            Get your Gemini API key from Google AI Studio &rarr;
                        </a>
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="api-key-input" className="text-sm font-medium text-text-secondary">
                            Your Gemini API Key
                        </label>
                        <div className="flex items-center space-x-3">
                             <input
                                id="api-key-input"
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="Enter your API key here"
                                className="w-full bg-background p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand border border-secondary"
                            />
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    {saveStatus === 'success' && (
                        <p className="text-sm text-success font-medium animate-fade-in">
                            API key saved successfully!
                        </p>
                    )}
                     {storedApiKey && saveStatus !== 'success' && (
                         <p className="text-sm text-text-secondary">
                            An API key is currently saved. You can update it above.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;
