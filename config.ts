
// --- SIMULATED .env FILE ---
// In a real Next.js/Vite app, these would be process.env.VARIABLE_NAME

export const GOPLUS_API_KEY: string | undefined = undefined; // IMPORTANT: Replace undefined with your key as a string, or set it in your environment
export const RUGCHECK_API_TOKEN: string | undefined = undefined; // IMPORTANT: Replace undefined with your key as a string, or set it in your environment

export const ENABLE_RUGCHECK_SOLANA: boolean = true;

// Comma-separated list of DexScreener network identifiers
export const DS_NETWORKS_STRING: string = 'ethereum,bsc,base,arbitrum,optimism,polygon,avalanche,fantom,cronos,solana';

export const SCAN_MAX_PER_NETWORK: number = 20;

// --- END SIMULATED .env FILE ---

export const DS_NETWORKS = DS_NETWORKS_STRING.split(',').map(s => s.trim()).filter(Boolean);

interface ApiKeyStatus {
    missingKeys: string[];
    rugcheckDisabled: boolean;
}

export const checkApiKeys = (): ApiKeyStatus => {
    const missingKeys: string[] = [];
    if (!GOPLUS_API_KEY) missingKeys.push('GoPlus');
    if (!RUGCHECK_API_TOKEN) missingKeys.push('RugCheck');
    
    return {
        missingKeys,
        rugcheckDisabled: !ENABLE_RUGCHECK_SOLANA || !RUGCHECK_API_TOKEN,
    };
};
