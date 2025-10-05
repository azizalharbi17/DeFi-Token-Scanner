
import React, { useState, useMemo } from 'react';
import { TokenData } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { FlagChips } from './FlagChips';
import { ExternalLinkIcon, SortAscIcon, SortDescIcon, SortIcon } from './icons';
import { DS_TO_BUBBLEMAPS_CHAIN } from '../constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/Tooltip';


type SortKey = 'pairCreatedAt' | 'liquidity' | 'risk' | 'h24';
type SortDirection = 'asc' | 'desc';

interface TokenTableProps {
    tokens: TokenData[];
    isLoading: boolean;
    onRowClick: (token: TokenData) => void;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const TokenTable: React.FC<TokenTableProps> = ({ tokens, isLoading, onRowClick }) => {
    const [sortKey, setSortKey] = useState<SortKey>('pairCreatedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const sortedTokens = useMemo(() => {
        return [...tokens].sort((a, b) => {
            let valA: number, valB: number;

            switch (sortKey) {
                case 'liquidity':
                    valA = a.ds.liquidity.usd ?? 0;
                    valB = b.ds.liquidity.usd ?? 0;
                    break;
                case 'risk':
                    valA = a.risk.score;
                    valB = b.risk.score;
                    break;
                case 'h24':
                    valA = a.ds.volume.h24 ?? 0;
                    valB = b.ds.volume.h24 ?? 0;
                    break;
                case 'pairCreatedAt':
                default:
                    valA = a.ds.pairCreatedAt ?? 0;
                    valB = b.ds.pairCreatedAt ?? 0;
                    break;
            }

            if (sortDirection === 'asc') {
                return valA - valB;
            } else {
                return valB - valA;
            }
        });
    }, [tokens, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };
    
    const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortKey !== columnKey) return <SortIcon className="h-4 w-4 text-gray-500" />;
        if (sortDirection === 'asc') return <SortAscIcon className="h-4 w-4 text-white" />;
        return <SortDescIcon className="h-4 w-4 text-white" />;
    };
    
    const HeaderCell: React.FC<{ sortKey: SortKey; children: React.ReactNode, className?: string }> = ({ sortKey, children, className }) => (
        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${className}`}>
            <button onClick={() => handleSort(sortKey)} className="flex items-center gap-2 group">
                {children}
                <SortIndicator columnKey={sortKey} />
            </button>
        </th>
    );

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                            <HeaderCell sortKey="pairCreatedAt">Age</HeaderCell>
                            <HeaderCell sortKey="liquidity">Liquidity</HeaderCell>
                            <HeaderCell sortKey="h24">Volume (24h)</HeaderCell>
                            <HeaderCell sortKey="risk">Risk</HeaderCell>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Flags</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Links</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-gray-600 rounded w-3/4"></div></td>
                                    <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-gray-600 rounded w-1/2"></div></td>
                                    <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-gray-600 rounded w-1/2"></div></td>
                                    <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-gray-600 rounded w-1/2"></div></td>
                                    <td className="px-4 py-4 whitespace-nowrap"><div className="h-8 bg-gray-600 rounded w-16"></div></td>
                                    <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-gray-600 rounded w-full"></div></td>
                                    <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-gray-600 rounded w-16"></div></td>
                                </tr>
                            ))
                        ) : sortedTokens.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500">
                                    No tokens found. Try adjusting your filters or refreshing the scan.
                                </td>
                            </tr>
                        ) : (
                            sortedTokens.map(token => (
                                <tr key={token.id} onClick={() => onRowClick(token)} className="hover:bg-gray-700/50 cursor-pointer transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-sm">
                                                {token.ds.baseToken.symbol.charAt(0)}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-semibold text-white">{token.ds.baseToken.symbol}</div>
                                                <div className="text-xs text-gray-400">{token.ds.chainId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {token.ds.pairCreatedAt ? new Date(token.ds.pairCreatedAt).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(token.ds.liquidity.usd)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(token.ds.volume.h24)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <ScoreBadge score={token.risk.score} verdict={token.risk.verdict} />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap max-w-xs">
                                        <FlagChips flags={token.risk.flags} />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <a href={token.ds.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-blue-400 hover:text-blue-300">DS</a>
                                            {DS_TO_BUBBLEMAPS_CHAIN[token.ds.chainId] ? (
                                                <a 
                                                    href={`https://app.bubblemaps.io/${DS_TO_BUBBLEMAPS_CHAIN[token.ds.chainId]}/token/${token.ds.baseToken.address}`} 
                                                    target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} 
                                                    className="text-purple-400 hover:text-purple-300"
                                                >
                                                    BM
                                                </a>
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-gray-600 cursor-not-allowed">BM</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>BubbleMaps not available for this chain.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
