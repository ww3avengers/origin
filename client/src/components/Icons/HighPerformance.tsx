import React from 'react';

interface IconProps {
  className?: string;
  stroke?: string;
}

export const HighPerformance: React.FC<IconProps> = ({
  className = 'h-6 w-6',
  stroke = 'currentColor',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke={stroke}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);
