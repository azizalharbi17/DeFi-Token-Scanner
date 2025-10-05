
import React from 'react';
import { RiskResult } from '../types';

interface ScoreBadgeProps {
    score: number;
    verdict: RiskResult['verdict'];
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, verdict }) => {
    const badgeColor = {
        'OK': 'bg-green-500/20 text-green-300 border-green-500/30',
        'CAUTION': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        'RISKY': 'bg-red-500/20 text-red-300 border-red-500/30',
    }[verdict];

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${badgeColor}`}>
            <span className="font-bold mr-2">{score}</span>
            <span>{verdict}</span>
        </div>
    );
};
