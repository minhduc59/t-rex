import React from 'react';

const HUD = ({ score, highScore, isMuted, onToggleMute, onPause, isPaused, isDark }) => {
  const textColor = isDark ? 'text-night-text' : 'text-day-text';
  
  return (
    <div className={`absolute top-0 left-0 right-0 p-4 ${textColor} theme-transition pointer-events-none`}>
      <div className="flex justify-between items-start">
        {/* High Score */}
        <div className="text-sm md:text-base font-mono">
          <div className="opacity-75">BEST</div>
          <div className="text-xl md:text-2xl font-bold">{Math.floor(highScore).toString().padStart(5, '0')}</div>
        </div>
        
        {/* Current Score */}
        <div className="text-sm md:text-base font-mono text-right">
          <div className="opacity-75">SCORE</div>
          <div className="text-xl md:text-2xl font-bold">{Math.floor(score).toString().padStart(5, '0')}</div>
        </div>
      </div>
      
      {/* Control Buttons - Positioned below scores */}
      <div className="absolute top-20 right-4 flex flex-col gap-2 pointer-events-auto">
        {/* Pause Button */}
        <button
          onClick={onPause}
          className={`p-3 rounded-full border-2 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 ${textColor} bg-opacity-50`}
          aria-label={isPaused ? 'Resume' : 'Pause'}
          title={isPaused ? 'Resume (P)' : 'Pause (P)'}
        >
          {isPaused ? (
            // Play icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            // Pause icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </button>
        
        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          className={`p-3 rounded-full border-2 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 ${textColor} bg-opacity-50`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            // Muted icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            // Unmuted icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default HUD;
