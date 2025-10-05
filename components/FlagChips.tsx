
import React from 'react';
import { FLAGS } from '../services/riskService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/Tooltip';

interface FlagChipsProps {
    flags: string[];
}

export const FlagChips: React.FC<FlagChipsProps> = ({ flags }) => {
    if (flags.length === 0) {
        return <span className="text-xs text-gray-500">No flags</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            <TooltipProvider>
                {flags.map(flagKey => {
                    const flagInfo = FLAGS[flagKey];
                    if (!flagInfo) return null;

                    return (
                        <Tooltip key={flagKey}>
                            <TooltipTrigger asChild>
                                <span className="bg-red-800/70 text-red-200 text-xs font-medium px-2 py-0.5 rounded-md cursor-help">
                                    {flagInfo.label}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{flagInfo.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </TooltipProvider>
        </div>
    );
};
