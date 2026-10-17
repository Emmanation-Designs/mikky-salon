import React from 'react';

export const MikkysLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; light?: boolean }> = ({
  size = 'md',
  light = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const subSizes = {
    sm: 'text-[7px]',
    md: 'text-[9px]',
    lg: 'text-[12px]',
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Stylized Red Scissor 'M' Logo from Screenshot */}
      <svg
        viewBox="0 0 100 100"
        className={`${iconSizes[size]} text-red-600 drop-shadow-sm`}
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Left leg of M */}
        <line x1="20" y1="85" x2="20" y2="25" />
        {/* Scissor diagonal 1 */}
        <line x1="20" y1="25" x2="50" y2="70" />
        {/* Scissor diagonal 2 */}
        <line x1="80" y1="25" x2="50" y2="70" />
        {/* Right leg of M */}
        <line x1="80" y1="25" x2="80" y2="85" />
        {/* Scissor Finger Rings at bottom center */}
        <circle cx="38" cy="85" r="9" strokeWidth="9" />
        <circle cx="62" cy="85" r="9" strokeWidth="9" />
      </svg>

      <span
        className={`font-black tracking-widest uppercase mt-1 leading-none ${textSizes[size]} ${
          light ? 'text-black' : 'text-white'
        }`}
      >
        MIKKYS
      </span>
      <span
        className={`font-bold tracking-[0.25em] uppercase text-red-600 mt-0.5 leading-none ${subSizes[size]}`}
      >
        BARBING SALON
      </span>
    </div>
  );
};
