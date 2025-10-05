
// DexScreener Pair Data
export interface DsPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceUsd?: string;
    liquidity: {
        usd?: number;
    };
    fdv?: number;
    pairCreatedAt?: number;
    txns: {
        h1: { buys: number; sells: number; };
        h24: { buys: number; sells: number; };
    };
    volume: {
        h24: number;
    };
}

// GoPlus Token Security Data
export interface GpTokenRisk {
    [key: string]: any; // Allows for flexible properties
    anti_whale?: string;
    buy_tax?: string;
    can_take_back_ownership?: string;
    cannot_sell_all?: string;
    dex?: any[];
    hidden_owner?: string;
    honeypot_with_same_creator?: string;
    is_honeypot?: string;
    is_in_dex?: string;
    is_mintable?: string;
    is_proxy?: string;
    owner_address?: string;
    sell_tax?: string;
    slippage_modifiable?: string;
    trading_cooldown?: string;
    transfer_pausable?: string;
    is_blacklisted?: string;
    is_whitelisted?: string;
}

// RugCheck Risk Data
export interface RcRisk {
    [key: string]: any; // Allows for flexible properties
    risk: string;
    riskDetails: {
        mintAuthorityActive: boolean;
        freezeAuthorityActive: boolean;
        hasSocials: boolean;
        top10HolderBalance: number;
        top10HolderPercent: number;
    };
    markets: any[];
}

// Unified Risk Signals
export interface RiskSignals {
    provider: 'goplus' | 'rugcheck' | 'merged';
    honeypot: boolean;
    buyTax: number;
    sellTax: number;
    isMintable: boolean;
    ownerCanRetake: boolean;
    hiddenOwner: boolean;
    isProxy: boolean;
    canBlacklist: boolean;
    canWhitelist: boolean;
    hasAntiWhale: boolean;
    hasCooldown: boolean;
    isTradingDisabled: boolean;
    lpLockPercent: number | null;
    mintAuthorityActive?: boolean; // Solana-specific
    freezeAuthorityActive?: boolean; // Solana-specific
    raw: GpTokenRisk | RcRisk;
}

// Risk Scoring Result
export interface RiskResult {
    score: number;
    verdict: 'OK' | 'CAUTION' | 'RISKY';
    flags: string[];
}

// Combined Token Data for UI
export interface TokenData {
    id: string; // unique key: chainId-tokenAddress
    ds: DsPair;
    risk: RiskResult;
    primaryRiskProvider: 'goplus' | 'rugcheck' | null;
    primaryRiskData: GpTokenRisk | RcRisk | null;
    secondaryRiskProvider: 'goplus' | null;
    secondaryRiskData: GpTokenRisk | null;
}
