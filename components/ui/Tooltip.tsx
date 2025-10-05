
import React, { useState, createContext, useContext, ReactNode, cloneElement, ReactElement } from 'react';

interface TooltipContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const TooltipContext = createContext<TooltipContextProps | null>(null);

export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // In a real library, this would manage global state. For this simple case, it's a pass-through.
    return <>{children}</>;
};

export const Tooltip: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return <TooltipContext.Provider value={{ isOpen, setIsOpen }}>{children}</TooltipContext.Provider>;
};

export const TooltipTrigger: React.FC<{ children: ReactElement; asChild?: boolean }> = ({ children, asChild = false }) => {
  const context = useContext(TooltipContext);
  if (!context) throw new Error("TooltipTrigger must be used within a Tooltip");

  const { setIsOpen } = context;

  const triggerProps = {
    onMouseEnter: () => setIsOpen(true),
    onMouseLeave: () => setIsOpen(false),
    onFocus: () => setIsOpen(true),
    onBlur: () => setIsOpen(false),
  };
  
  if (asChild) {
      return cloneElement(children, triggerProps);
  }

  return <div {...triggerProps} className="inline-block">{children}</div>;
};


export const TooltipContent: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => {
  const context = useContext(TooltipContext);
  if (!context) throw new Error("TooltipContent must be used within a Tooltip");
  const { isOpen } = context;

  return (
    <div
      className={`
        absolute z-50
        px-3 py-1.5
        text-sm text-gray-100 bg-gray-900 rounded-md shadow-lg border border-gray-700
        transition-opacity duration-200
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${className}
      `}
      role="tooltip"
    >
      {children}
    </div>
  );
};
