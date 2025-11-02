import React, { useState, useCallback } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { getFinancialRundown } from '../services/geminiService';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Icons } from './ui/Icons';

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


const Rundown: React.FC = () => {
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
            if(result.toLowerCase().includes("error") || result.toLowerCase().includes("api key")) {
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
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Financial Rundown</h1>
                <p className="text-text-secondary mt-1">Forecast your financial future and see how long your money will last based on current trends.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                         <div className="flex-1 w-full sm:w-auto">
                            <label htmlFor="rundown-months" className="block text-sm font-medium text-text-secondary mb-2">Months to Forecast</label>
                            <input
                                id="rundown-months"
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
                                    <Icons.Rundown className="w-5 h-5 mr-2" />
                                    <span>Generate Rundown</span>
                                </>
                            )}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {error && (
                 <Card className="border-l-4 border-danger">
                    <CardContent className="pt-6">
                        <p className="font-semibold text-danger">Error</p>
                        <p className="text-text-secondary">{error}</p>
                    </CardContent>
                </Card>
            )}

            {isLoading && (
                 <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="animate-pulse text-text-secondary">Generating your financial forecast...</p>
                        <p className="text-sm mt-2 text-text-secondary/70">This may take a moment.</p>
                    </CardContent>
                </Card>
            )}

            {forecast && (
                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle>AI-Generated Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormattedResponse content={forecast} />
                    </CardContent>
                </Card>
            )}

            {!forecast && !isLoading && !error && (
                 <Card>
                    <CardContent className="pt-6 text-center text-text-secondary">
                        <p>Your financial rundown will appear here once generated.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Rundown;