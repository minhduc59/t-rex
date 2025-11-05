import React from 'react';

const Controls = ({ onJump, onDuck, onDuckRelease, isDark }) => {
  const textColor = isDark ? 'text-night-text' : 'text-day-text';
  const borderColor = isDark ? 'border-night-text' : 'border-day-text';
  
  return (
    <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-4 md:hidden pointer-events-none">
      {/* Jump Button */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onJump();
        }}
        onClick={onJump}
        className={`touch-button pointer-events-auto w-20 h-20 rounded-full border-4 ${borderColor} ${textColor} flex items-center justify-center font-bold text-sm active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500`}
        aria-label="Jump"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      
      {/* Duck Button */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onDuck();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onDuckRelease();
        }}
        onClick={onDuck}
        className={`touch-button pointer-events-auto w-20 h-20 rounded-full border-4 ${borderColor} ${textColor} flex items-center justify-center font-bold text-sm active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500`}
        aria-label="Duck"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
};

export default Controls;
