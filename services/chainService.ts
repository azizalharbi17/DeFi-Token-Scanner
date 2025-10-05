
import { DS_TO_GOPLUS_CHAIN_ID } from '../constants';

export const getGoPlusChainId = (dsChainId: string): string | null => {
    return DS_TO_GOPLUS_CHAIN_ID[dsChainId] || null;
};
