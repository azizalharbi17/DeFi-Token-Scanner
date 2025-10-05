
import { RcRisk } from '../types';
import { RUGCHECK_API_URL } from '../constants';
import { RUGCHECK_API_TOKEN } from '../config';
import { apiFetch, ApiError } from './api';

export const getRugcheck = async (mint: string): Promise<RcRisk | null> => {
    if (!RUGCHECK_API_TOKEN) {
        console.warn("RugCheck API token is missing. Skipping RugCheck.");
        return null;
    }

    const url = `${RUGCHECK_API_URL}/${mint}`;
    
    try {
        const data = await apiFetch<RcRisk>(url, {
            headers: { 'Authorization': `Bearer ${RUGCHECK_API_TOKEN}` }
        });
        return data;
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            console.error('RugCheck API Error: Unauthorized. Check your API token.');
        } else if (error instanceof ApiError && error.status === 404) {
            // This is a common case, token not found
            console.log(`RugCheck: Token ${mint} not found.`);
        } else {
            console.error(`Failed to fetch RugCheck data for ${mint}:`, error);
        }
        return null;
    }
};
