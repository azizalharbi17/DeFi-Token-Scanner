
import { DsPair } from '../types';
import { DEXSCREENER_API_URL } from '../constants';
import { apiFetch, ApiError } from './api';

interface DexScreenerApiResponse {
    pairs: DsPair[];
}

export const getRecentPairs = async (network: string): Promise<DsPair[]> => {
    // DexScreener's search is quite flexible. We can query for new pairs on a network.
    // A simple query for the native token (like WETH on ethereum) often returns recent pairs.
    // A better approach is to use their pairs endpoint with sorting.
    const url = `${DEXSCREENER_API_URL}/${network}?sort=pairCreatedAt&order=desc`;

    try {
        const data = await apiFetch<DexScreenerApiResponse>(url);
        return data?.pairs || [];
    } catch (error) {
        if (error instanceof ApiError) {
            console.error(`DexScreener API Error for ${network}: ${error.message}`);
        } else {
            console.error(`Failed to fetch pairs from DexScreener for ${network}:`, error);
        }
        return []; // Return empty array on failure to not break the entire scan
    }
};
