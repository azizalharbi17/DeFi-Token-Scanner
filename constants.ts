
// Mapping from DexScreener chainId to GoPlus chain_id
export const DS_TO_GOPLUS_CHAIN_ID: Record<string, string> = {
    'ethereum': '1',
    'bsc': '56',
    'polygon': '137',
    'arbitrum': '42161',
    'avalanche': '43114',
    'base': '8453',
    'optimism': '10',
    'fantom': '250',
    'cronos': '25',
    'zkSync': '324',
    'scroll': '534352',
    'linea': '59144',
    'mantle': '5000',
    'blast': '81457',
    'solana': 'solana',
};

// Mapping from DexScreener chainId to BubbleMaps chain label
export const DS_TO_BUBBLEMAPS_CHAIN: Record<string, string> = {
    'ethereum': 'ethereum',
    'bsc': 'bsc',
    'polygon': 'polygon',
    'arbitrum': 'arbitrum',
    'base': 'base',
    'avalanche': 'avalanche',
    'fantom': 'fantom',
    'cronos': 'cronos',
    'solana': 'solana',
    // zkSync, scroll, linea, mantle, blast not supported as of spec
};

// API Endpoints
export const DEXSCREENER_API_URL = 'https://api.dexscreener.com/latest/dex/pairs';
export const GOPLUS_API_URL = 'https://api.gopluslabs.io/api/v1/token_security';
export const RUGCHECK_API_URL = 'https://api.rugcheck.xyz/v1/tokens';

// Cache TTL (Time-to-Live) in milliseconds
export const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

// Concurrency limit for API calls
export const API_CONCURRENCY_LIMIT = 5;
