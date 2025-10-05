
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextProps {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | null>(null);

// Main Tabs component
export const Tabs: React.FC<{
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
}> = ({ defaultValue, value, onValueChange, children }) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const activeTab = value !== undefined ? value : internalValue;

    const setActiveTab = (newValue: string) => {
        if (onValueChange) {
            onValueChange(newValue);
        }
        if (value === undefined) {
            setInternalValue(newValue);
        }
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div>{children}</div>
        </TabsContext.Provider>
    );
};

// TabsList component
export const TabsList: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <div className={`inline-flex items-center justify-center rounded-md bg-gray-800 p-1 ${className}`}>
            {children}
        </div>
    );
};

// TabsTrigger component
export const TabsTrigger: React.FC<{ value: string; children: ReactNode; className?: string }> = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within a Tabs component');
    const { activeTab, setActiveTab } = context;
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all
                ${isActive ? 'bg-gray-900/80 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                disabled:pointer-events-none disabled:opacity-50
                ${className}`}
        >
            {children}
        </button>
    );
};

// TabsContent component
export const TabsContent: React.FC<{ value: string; children: ReactNode; className?: string }> = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within a Tabs component');
    const { activeTab } = context;
    const isActive = activeTab === value;

    return isActive ? <div className={className}>{children}</div> : null;
};
