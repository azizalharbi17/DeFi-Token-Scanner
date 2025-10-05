
import { GpTokenRisk } from '../types';
import { GOPLUS_API_URL } from '../constants';
import { GOPLUS_API_KEY } from '../config';
import { apiFetch, ApiError } from './api';

interface GoPlusApiResponse {
    code: number;
    message: string;
    result?: {
        [address: string]: GpTokenRisk;
    };
}

export const getTokenSecurity = async (chainId: string, address: string): Promise<GpTokenRisk | null> => {
    if (!GOPLUS_API_KEY) {
        console.warn("GoPlus API key is missing. Skipping GoPlus check.");
        return null;
    }

    const url = `${GOPLUS_API_URL}/${chainId}?contract_addresses=${address}`;
    
    try {
        const data = await apiFetch<GoPlusApiResponse>(url, {
            headers: { 'Authorization': `Bearer ${GOPLUS_API_KEY}` }
        });

        if (data.code !== 1 || !data.result) {
            console.error(`GoPlus API returned an error: ${data.message}`);
            return null;
        }

        return data.result[address.toLowerCase()] || null;
    } catch (error) {
         if (error instanceof ApiError && error.status === 401) {
             console.error('GoPlus API Error: Unauthorized. Check your API key.');
         } else {
             console.error(`Failed to fetch GoPlus data for ${address} on chain ${chainId}:`, error);
         }
        return null;
    }
};
