
import { GpTokenRisk, RcRisk, RiskSignals, RiskResult, DsPair, TokenData } from '../types';

// --- Flag Definitions ---
export const FLAGS: Record<string, { label: string; tooltip: string }> = {
    low_liquidity: { label: 'Low Liq.', tooltip: 'Liquidity is very low, increasing price volatility and risk.' },
    very_new: { label: 'New', tooltip: 'The token or pair was created less than 24 hours ago.' },
    honeypot_signals: { label: 'Honeypot', tooltip: 'Indicators suggest this token may be a honeypot (buyable but not sellable).' },
    high_tax: { label: 'High Tax', tooltip: 'Buy or sell tax is over 10%.' },
    blacklist_enabled: { label: 'Blacklist', tooltip: 'A blacklist function exists, allowing the owner to prevent addresses from trading.' },
    anti_whale: { label: 'Anti-Whale', tooltip: 'An anti-whale mechanism is in place, which may restrict trading.' },
    cooldown: { label: 'Cooldown', tooltip: 'A trading cooldown function exists.' },
    trading_disabled: { label: 'Trading Paused', tooltip: 'Trading is currently disabled or pausable.' },
    owner_can_retake: { label: 'Retakable Own.', tooltip: 'Ownership can be taken back by the creator.' },
    hidden_owner: { label: 'Hidden Owner', tooltip: 'The true owner of the contract may be hidden.' },
    proxy_upgradable: { label: 'Proxy', tooltip: 'The contract is a proxy and can be upgraded, changing its logic.' },
    mintable_supply: { label: 'Mintable', tooltip: 'New tokens can be minted, potentially diluting supply.' },
    mint_authority_active: { label: 'Mint Active', tooltip: 'The mint authority is still active for this Solana token.' },
    freeze_authority_active: { label: 'Freeze Active', tooltip: 'The freeze authority is still active for this Solana token.' },
    lp_unlocked_or_unknown: { label: 'Unlocked LP', tooltip: 'A significant portion of the liquidity pool is not locked or burned.' },
    manual_holder_concentration: { label: 'Holders', tooltip: 'Manually flagged for risky holder concentration.' },
};

// --- Normalization & Merging ---

const normalizeGoPlus = (gp: GpTokenRisk): RiskSignals => ({
    provider: 'goplus',
    honeypot: gp.is_honeypot === '1',
    buyTax: parseFloat(gp.buy_tax || '0'),
    sellTax: parseFloat(gp.sell_tax || '0'),
    isMintable: gp.is_mintable === '1',
    ownerCanRetake: gp.can_take_back_ownership === '1',
    hiddenOwner: gp.hidden_owner === '1',
    isProxy: gp.is_proxy === '1',
    canBlacklist: gp.is_blacklisted === '1',
    canWhitelist: gp.is_whitelisted === '1',
    hasAntiWhale: gp.anti_whale === '1',
    hasCooldown: gp.trading_cooldown === '1',
    isTradingDisabled: gp.transfer_pausable === '1',
    lpLockPercent: null, // GoPlus doesn't provide this directly in a simple format
    raw: gp,
});

const normalizeRugCheck = (rc: RcRisk): RiskSignals => ({
    provider: 'rugcheck',
    honeypot: rc.risk === 'danger', // Simplified mapping
    buyTax: 0, // Not provided
    sellTax: 0, // Not provided
    isMintable: rc.riskDetails.mintAuthorityActive,
    ownerCanRetake: false, // Not provided
    hiddenOwner: false, // Not provided
    isProxy: false, // Not provided
    canBlacklist: false, // Not provided
    canWhitelist: false, // Not provided
    hasAntiWhale: false, // Not provided
    hasCooldown: false, // Not provided
    isTradingDisabled: false, // Not provided
    lpLockPercent: null, // Assume unknown from this source
    mintAuthorityActive: rc.riskDetails.mintAuthorityActive,
    freezeAuthorityActive: rc.riskDetails.freezeAuthorityActive,
    raw: rc,
});

export const mergeSolanaRisk = (rcSignals: RiskSignals, gpSignals: RiskSignals): RiskSignals => {
    // RugCheck (rc) is primary. Augment with non-overlapping GoPlus (gp) signals.
    return {
        ...rcSignals,
        provider: 'merged',
        // Take specific fields from GoPlus if not well-defined in RugCheck
        honeypot: rcSignals.honeypot || gpSignals.honeypot,
        buyTax: gpSignals.buyTax,
        sellTax: gpSignals.sellTax,
        ownerCanRetake: gpSignals.ownerCanRetake,
        hiddenOwner: gpSignals.hiddenOwner,
        isProxy: gpSignals.isProxy,
        canBlacklist: gpSignals.canBlacklist,
        canWhitelist: gpSignals.canWhitelist,
        hasAntiWhale: gpSignals.hasAntiWhale,
        hasCooldown: gpSignals.hasCooldown,
        isTradingDisabled: gpSignals.isTradingDisabled,
        // Raw data is kept from primary
        raw: rcSignals.raw,
    };
};

// --- Scoring ---

export const scoreToken = (ds: DsPair, primaryRisk: GpTokenRisk | RcRisk | null, secondaryRisk: GpTokenRisk | null, isSolana: boolean): TokenData => {
    let score = 0;
    const flags: string[] = [];
    
    let primarySignals: RiskSignals | null = null;
    let secondarySignals: RiskSignals | null = null;
    let finalSignals: RiskSignals | null = null;

    let primaryRiskProvider: TokenData['primaryRiskProvider'] = null;
    let secondaryRiskProvider: TokenData['secondaryRiskProvider'] = null;

    if (isSolana) {
        primaryRiskProvider = 'rugcheck';
        secondaryRiskProvider = 'goplus';
        const rc = primaryRisk as RcRisk;
        const gp = secondaryRisk as GpTokenRisk;
        if(rc) primarySignals = normalizeRugCheck(rc);
        if(gp) secondarySignals = normalizeGoPlus(gp);

        if(primarySignals && secondarySignals) {
            finalSignals = mergeSolanaRisk(primarySignals, secondarySignals);
        } else {
            finalSignals = primarySignals || secondarySignals;
        }

    } else {
        primaryRiskProvider = 'goplus';
        const gp = primaryRisk as GpTokenRisk;
        if (gp) finalSignals = normalizeGoPlus(gp);
    }
    
    // Scoring Logic
    if (finalSignals) {
        if (finalSignals.honeypot) { score += 60; flags.push('honeypot_signals'); }
        if (finalSignals.buyTax > 0.1 || finalSignals.sellTax > 0.1) { score += 15; flags.push('high_tax'); }
        if (finalSignals.canBlacklist) { score += 10; flags.push('blacklist_enabled'); }
        if (finalSignals.hasAntiWhale) { score += 10; flags.push('anti_whale'); }
        if (finalSignals.hasCooldown) { score += 10; flags.push('cooldown'); }
        if (finalSignals.isTradingDisabled) { score += 40; flags.push('trading_disabled'); }
        if (finalSignals.ownerCanRetake) { score += 25; flags.push('owner_can_retake'); }
        if (finalSignals.hiddenOwner) { score += 25; flags.push('hidden_owner'); }
        if (finalSignals.isProxy) { score += 10; flags.push('proxy_upgradable'); }
        if (finalSignals.isMintable) { score += 20; flags.push('mintable_supply'); }
        if (finalSignals.mintAuthorityActive) { score += 20; flags.push('mint_authority_active'); }
        if (finalSignals.freezeAuthorityActive) { score += 15; flags.push('freeze_authority_active'); }
        if (finalSignals.lpLockPercent === null || finalSignals.lpLockPercent < 50) { score += 15; flags.push('lp_unlocked_or_unknown'); }
    }

    const liquidity = ds.liquidity?.usd ?? 0;
    if (liquidity < 1000) { score += 30; flags.push('low_liquidity'); }
    else if (liquidity < 5000) { score += 20; flags.push('low_liquidity'); }

    const pairAge = ds.pairCreatedAt ? (Date.now() - ds.pairCreatedAt) / 1000 / 3600 : Infinity;
    if (pairAge < 24) { score += 10; flags.push('very_new'); }

    // Final verdict
    score = Math.min(100, score); // Clamp score
    let verdict: RiskResult['verdict'] = 'OK';
    if (score >= 60) verdict = 'RISKY';
    else if (score >= 30) verdict = 'CAUTION';

    return {
        id: `${ds.chainId}-${ds.baseToken.address}`,
        ds,
        risk: { score, verdict, flags: [...new Set(flags)] }, // Dedupe flags
        primaryRiskProvider,
        primaryRiskData: primaryRisk,
        secondaryRiskProvider,
        secondaryRiskData: secondaryRisk
    };
};
