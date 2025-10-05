
import React, { useState } from 'react';
import { TokenData } from '../types';
import { CloseIcon } from './icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { DS_TO_BUBBLEMAPS_CHAIN } from '../constants';

interface RowDrawerProps {
    token: TokenData;
    isOpen: boolean;
    onClose: () => void;
}

const KeyValue: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700">
        <dt className="text-sm text-gray-400">{label}</dt>
        <dd className="text-sm font-medium text-white text-right">{value}</dd>
    </div>
);


export const RowDrawer: React.FC<RowDrawerProps> = ({ token, isOpen, onClose }) => {
    const [manualConcentrationRisk, setManualConcentrationRisk] = useState(false);

    if (!isOpen) return null;
    
    const bubbleMapsChain = DS_TO_BUBBLEMAPS_CHAIN[token.ds.chainId];
    const bubbleMapsUrl = bubbleMapsChain ? `https://app.bubblemaps.io/${bubbleMapsChain}/token/${token.ds.baseToken.address}` : '';

    const primaryData = token.primaryRiskData || {};
    const secondaryData = token.secondaryRiskData || {};

    const getPrimaryDataValue = (key: string) => {
        if (token.primaryRiskProvider === 'rugcheck' && key === 'mintAuthorityActive') return (primaryData as any)?.riskDetails?.mintAuthorityActive?.toString();
        if (token.primaryRiskProvider === 'rugcheck' && key === 'freezeAuthorityActive') return (primaryData as any)?.riskDetails?.freezeAuthorityActive?.toString();
        return primaryData[key]?.toString() || 'N/A';
    };

    return (
        <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        >
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-gray-800 shadow-xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-white">{token.ds.baseToken.symbol}</h2>
                            <p className="text-sm text-gray-400">{token.ds.baseToken.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-4">
                        <Tabs defaultValue="overview">
                            <TabsList className="mb-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                {bubbleMapsUrl && <TabsTrigger value="bubblemaps">Bubble Maps</TabsTrigger>}
                                {token.primaryRiskData && <TabsTrigger value="primary_json">Primary JSON</TabsTrigger>}
                                {token.secondaryRiskData && <TabsTrigger value="secondary_json">Secondary JSON</TabsTrigger>}
                            </TabsList>
                            
                            <TabsContent value="overview">
                                <div className="space-y-4">
                                    <div className="bg-gray-900/50 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">Key Facts</h3>
                                        <dl>
                                            <KeyValue label="Owner" value={getPrimaryDataValue('owner_address')} />
                                            <KeyValue label="Buy Tax" value={`${(Number(getPrimaryDataValue('buy_tax')) * 100).toFixed(2)}%`} />
                                            <KeyValue label="Sell Tax" value={`${(Number(getPrimaryDataValue('sell_tax')) * 100).toFixed(2)}%`} />
                                            <KeyValue label="Mintable" value={getPrimaryDataValue('is_mintable')} />
                                            <KeyValue label="Mint Authority" value={getPrimaryDataValue('mintAuthorityActive')} />
                                            <KeyValue label="Freeze Authority" value={getPrimaryDataValue('freezeAuthorityActive')} />
                                        </dl>
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-lg">
                                         <h3 className="font-semibold mb-2">Holder Concentration</h3>
                                         <p className="text-sm text-gray-400 mb-3">Use Bubble Maps to visually inspect holder concentration. If it looks risky, you can manually add a flag.</p>
                                         <label className="flex items-center space-x-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={manualConcentrationRisk}
                                                onChange={() => setManualConcentrationRisk(!manualConcentrationRisk)}
                                                className="form-checkbox h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">Mark as risky due to holder concentration</span>
                                         </label>
                                         <p className="text-xs text-gray-500 mt-1">This will add +20 to the risk score (TODO: implement rescore).</p>
                                    </div>
                                </div>
                            </TabsContent>
                            
                            {bubbleMapsUrl && (
                                <TabsContent value="bubblemaps">
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden">
                                        <iframe
                                            src={bubbleMapsUrl}
                                            title="Bubble Maps"
                                            className="w-full h-full border-0"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </TabsContent>
                            )}

                            {token.primaryRiskData && (
                                <TabsContent value="primary_json">
                                    <pre className="bg-gray-900/50 p-4 rounded-lg text-xs overflow-x-auto text-gray-300">
                                        {JSON.stringify(token.primaryRiskData, null, 2)}
                                    </pre>
                                </TabsContent>
                            )}
                            
                            {token.secondaryRiskData && (
                                <TabsContent value="secondary_json">
                                    <pre className="bg-gray-900/50 p-4 rounded-lg text-xs overflow-x-auto text-gray-300">
                                        {JSON.stringify(token.secondaryRiskData, null, 2)}
                                    </pre>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-700">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                            Rescan Token (TODO)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
