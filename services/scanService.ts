
import { DS_NETWORKS, SCAN_MAX_PER_NETWORK, ENABLE_RUGCHECK_SOLANA, RUGCHECK_API_TOKEN } from '../config';
import { getRecentPairs } from './dexScreenerService';
import { getTokenSecurity } from './goplusService';
import { getRugcheck } from './rugcheckService';
import { scoreToken } from './riskService';
import { getGoPlusChainId } from './chainService';
import { TokenData } from '../types';
import { cacheService } from './cacheService';
import { pLimit } from './api';
import { API_CONCURRENCY_LIMIT } from '../constants';

const useRugcheck = ENABLE_RUGCHECK_SOLANA && !!RUGCHECK_API_TOKEN;

async function processToken(pair: any): Promise<TokenData> {
    const cacheKey = `token-data:${pair.chainId}-${pair.baseToken.address}`;
    const cached = cacheService.get<TokenData>(cacheKey);
    if (cached) {
        return cached;
    }
    
    const isSolana = pair.chainId === 'solana';
    const goPlusChainId = getGoPlusChainId(pair.chainId);

    let result: TokenData;

    if (isSolana && useRugcheck) {
        // Solana: RugCheck (PRIMARY) + GoPlus (SECONDARY)
        const [rcData, gpData] = await Promise.all([
            getRugcheck(pair.baseToken.address),
            goPlusChainId ? getTokenSecurity(goPlusChainId, pair.baseToken.address) : Promise.resolve(null),
        ]);
        result = scoreToken(pair, rcData, gpData, true);
    } else {
        // Non-Solana or RugCheck disabled: GoPlus (PRIMARY)
        const gpData = goPlusChainId ? await getTokenSecurity(goPlusChainId, pair.baseToken.address) : null;
        result = scoreToken(pair, gpData, null, false);
    }

    cacheService.set(cacheKey, result);
    return result;
}

export const runFullScan = async (): Promise<TokenData[]> => {
    console.log("Starting full scan across all networks...");
    
    const networkPromises = DS_NETWORKS.map(async (network) => {
        try {
            const pairs = await getRecentPairs(network);
            return pairs.slice(0, SCAN_MAX_PER_NETWORK);
        } catch (e) {
            console.error(`Failed to get pairs for ${network}`, e);
            return [];
        }
    });

    const allPairsNested = await Promise.all(networkPromises);
    const allPairs = allPairsNested.flat();

    const tokenProcessingTasks = allPairs.map(pair => () => processToken(pair));

    const results = await pLimit(API_CONCURRENCY_LIMIT, tokenProcessingTasks);

    console.log(`Scan complete. Processed ${results.length} tokens.`);
    return results.filter(Boolean); // Filter out any null/undefined results
};

// Placeholder for on-demand rescan
export const rescanToken = async (chainId: string, address: string): Promise<TokenData | null> => {
    // This would need a way to get the pair data first, maybe from a direct DS lookup
    console.log(`Rescanning ${address} on ${chainId}...`);
    // const pair = await getPairFromDexScreener(chainId, address);
    // if (!pair) return null;
    // return processToken(pair);
    return null; // TODO: Implement full rescan logic
};
