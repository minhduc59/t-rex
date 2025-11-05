import React from 'react';

const Modal = ({ type, score, highScore, onRestart, isDark }) => {
  const bgColor = isDark ? 'bg-night-bg' : 'bg-day-bg';
  const textColor = isDark ? 'text-night-text' : 'text-day-text';
  
  if (type === 'start') {
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${bgColor} ${textColor} theme-transition`}>
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">T-Rex Game</h1>
          <div className="space-y-4 text-lg md:text-xl opacity-75">
            <p>Press <kbd className="px-2 py-1 border rounded">Space</kbd> or <kbd className="px-2 py-1 border rounded">↑</kbd> to jump</p>
            <p>Press <kbd className="px-2 py-1 border rounded">↓</kbd> to duck</p>
            <p>Press <kbd className="px-2 py-1 border rounded">P</kbd> or <kbd className="px-2 py-1 border rounded">ESC</kbd> to pause</p>
            <p className="text-sm md:text-base mt-8">Tap anywhere to start</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'gameOver') {
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${bgColor} bg-opacity-90 theme-transition`}>
        <div className={`text-center ${textColor} px-4`}>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Game Over</h2>
          <div className="space-y-2 mb-8 text-xl md:text-2xl">
            <p>Score: <span className="font-bold">{Math.floor(score)}</span></p>
            <p>Best: <span className="font-bold">{Math.floor(highScore)}</span></p>
          </div>
          <button
            onClick={onRestart}
            className={`px-8 py-4 text-xl md:text-2xl font-bold border-2 rounded-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 ${textColor}`}
            aria-label="Restart game"
          >
            Restart
          </button>
          <p className="text-sm md:text-base mt-4 opacity-75">or press <kbd className="px-2 py-1 border rounded">R</kbd></p>
        </div>
      </div>
    );
  }
  
  return null;
};

export default Modal;
