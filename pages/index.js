import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import GameCanvas from '../components/GameCanvas';
import HUD from '../components/HUD';
import Controls from '../components/Controls';
import Modal from '../components/Modal';
import { getMuted, setMuted } from '../components/Sounds';

export default function Home() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'paused', 'gameOver'
  const [isDark, setIsDark] = useState(false);
  const [isMuted, setIsMutedState] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Load muted state on mount
    setIsMutedState(getMuted());
  }, []);

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMutedState(newMuted);
    setMuted(newMuted);
  };

  const handlePause = () => {
    if (typeof window !== 'undefined' && window.pauseTrexGame) {
      window.pauseTrexGame();
    }
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && window.restartTrexGame) {
      window.restartTrexGame();
    }
  };

  const handleJump = () => {
    // Trigger jump via keyboard event
    if (gameState === 'start') {
      const event = new KeyboardEvent('keydown', { code: 'Space' });
      window.dispatchEvent(event);
    } else if (gameState === 'playing') {
      const event = new KeyboardEvent('keydown', { code: 'Space' });
      window.dispatchEvent(event);
    }
  };

  const handleDuck = () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
    window.dispatchEvent(event);
  };

  const handleDuckRelease = () => {
    const event = new KeyboardEvent('keyup', { code: 'ArrowDown' });
    window.dispatchEvent(event);
  };

  const handleCanvasClick = () => {
    if (gameState === 'start') {
      handleJump();
    }
  };

  const bgColor = isDark ? 'bg-night-bg' : 'bg-day-bg';

  return (
    <>
      <Head>
        <title>T-Rex Game</title>
        <meta name="description" content="A complete clone of the Chrome T-Rex offline game built with Next.js and Tailwind CSS" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦖</text></svg>" />
      </Head>

      <main className={`min-h-screen flex items-center justify-center ${bgColor} theme-transition relative overflow-hidden`}>
        <div className="w-full h-screen flex items-center justify-center relative">
          {/* Game Canvas */}
          <div 
            className="w-full max-w-4xl mx-auto px-4 relative cursor-pointer"
            onClick={handleCanvasClick}
          >
            <GameCanvas
              onScoreChange={setScore}
              onHighScoreChange={setHighScore}
              onGameStateChange={setGameState}
              onThemeChange={setIsDark}
              isPaused={isPaused}
              onPauseChange={setIsPaused}
            />

            {/* HUD Overlay */}
            {gameState !== 'start' && (
              <HUD
                score={score}
                highScore={highScore}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                onPause={handlePause}
                isPaused={isPaused}
                isDark={isDark}
              />
            )}

            {/* Touch Controls for Mobile */}
            {gameState === 'playing' && !isPaused && (
              <Controls
                onJump={handleJump}
                onDuck={handleDuck}
                onDuckRelease={handleDuckRelease}
                isDark={isDark}
              />
            )}

            {/* Modals */}
            {gameState === 'start' && (
              <Modal
                type="start"
                isDark={isDark}
              />
            )}

            {gameState === 'gameOver' && (
              <Modal
                type="gameOver"
                score={score}
                highScore={highScore}
                onRestart={handleRestart}
                isDark={isDark}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
