// components/auth/StepIndicator.tsx
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            currentStep >= idx + 1 ? 'bg-[#8B5CF6]' : 'bg-[#263346]'
          }`}
        />
      ))}
    </div>
  );
}