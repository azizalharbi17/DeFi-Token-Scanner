
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TokenData } from './types';
import { runFullScan } from './services/scanService';
import { DS_NETWORKS } from './config';
import { TokenTable } from './components/TokenTable';
import { RowDrawer } from './components/RowDrawer';
import { Tabs, TabsList, TabsTrigger } from './components/ui/Tabs';
import { WarningIcon } from './components/icons';
import { checkApiKeys } from './config';

const App: React.FC = () => {
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
    const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const apiKeyStatus = useMemo(() => checkApiKeys(), []);

    const handleScan = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await runFullScan();
            setTokens(results);
        } catch (err) {
            console.error("Scan failed:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during the scan.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        handleScan();
    }, [handleScan]);

    const handleSelectToken = (token: TokenData) => {
        setSelectedToken(token);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedToken(null);
    };
    
    const filteredTokens = useMemo(() => {
        let filtered = tokens;

        if (selectedNetwork !== 'all') {
            filtered = filtered.filter(token => token.ds.chainId === selectedNetwork);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(token =>
                token.ds.baseToken.symbol.toLowerCase().includes(lowercasedQuery) ||
                token.ds.baseToken.name.toLowerCase().includes(lowercasedQuery) ||
                token.ds.baseToken.address.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        return filtered;
    }, [tokens, selectedNetwork, searchQuery]);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <header className="p-4 border-b border-gray-700 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white">DeFi Token Scanner</h1>
                    <p className="text-gray-400">Scan new pairs for risks across multiple chains.</p>
                </div>
            </header>

            <main className="container mx-auto p-4">
                 {apiKeyStatus.missingKeys.length > 0 && (
                    <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-md mb-4 flex items-start space-x-3">
                        <WarningIcon className="h-5 w-5 mt-0.5"/>
                        <div>
                            <p className="font-bold">API Key Warning</p>
                            <p>Missing keys for: {apiKeyStatus.missingKeys.join(', ')}. The app will run in a degraded state.</p>
                        </div>
                    </div>
                )}
                {apiKeyStatus.rugcheckDisabled && (
                     <div className="bg-blue-900/50 border border-blue-700 text-blue-300 px-4 py-3 rounded-md mb-4 flex items-start space-x-3">
                        <WarningIcon className="h-5 w-5 mt-0.5"/>
                        <div>
                             <p className="font-bold">Configuration Notice</p>
                             <p>RugCheck is disabled for Solana. GoPlus will be used as the primary risk provider.</p>
                        </div>
                    </div>
                )}


                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <Tabs value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            {DS_NETWORKS.map(net => (
                                <TabsTrigger key={net} value={net} className="capitalize">{net}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                         <input
                            type="text"
                            placeholder="Search token symbol, name, or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                            onClick={handleScan}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors whitespace-nowrap"
                        >
                            {loading ? 'Scanning...' : 'Refresh Scan'}
                        </button>
                    </div>
                </div>

                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md mb-4">{error}</div>}
                
                <TokenTable 
                    tokens={filteredTokens}
                    isLoading={loading}
                    onRowClick={handleSelectToken}
                />
            </main>
            
            {selectedToken && (
                <RowDrawer
                    token={selectedToken}
                    isOpen={isDrawerOpen}
                    onClose={handleCloseDrawer}
                />
            )}
        </div>
    );
};

export default App;
