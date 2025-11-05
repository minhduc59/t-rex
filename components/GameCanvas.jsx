import React, { useRef, useEffect, useState } from 'react';
import { initAudio, playJump, playPoint, playHit, getMuted, setMuted } from './Sounds';

// ========== GAME CONSTANTS ==========
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 200;
const GROUND_Y = 160;

// Player constants
const PLAYER_X = 50;
const PLAYER_WIDTH = 44;
const PLAYER_HEIGHT = 44;
const PLAYER_DUCK_HEIGHT = 26;

// Physics constants - ADJUSTED FOR BETTER PLAYABILITY
const GRAVITY = 0.3;
const JUMP_VELOCITY = -12;
const MAX_FALL_SPEED = 6;

// Game speed constants - MUCH SLOWER FOR BETTER GAMEPLAY
const INITIAL_SPEED = 2;
const SPEED_INCREMENT = 0.15;
const SPEED_INCREASE_INTERVAL = 400; // Increase speed every 400 points
const MAX_SPEED = 5;

// Obstacle constants - INCREASED SPACING FOR EASIER GAMEPLAY
const MIN_OBSTACLE_SPACING = 400;
const MAX_OBSTACLE_SPACING = 800;
const CACTUS_MIN_WIDTH = 20;
const CACTUS_MAX_WIDTH = 48;
const CACTUS_MIN_HEIGHT = 40;
const CACTUS_MAX_HEIGHT = 60;

// Pterodactyl constants
const PTERODACTYL_WIDTH = 46;
const PTERODACTYL_HEIGHT = 40;
const PTERODACTYL_Y_POSITIONS = [100, 120]; // Two flight heights

// Scoring and milestones
const MILESTONE_INTERVAL = 100;
const DAY_NIGHT_THRESHOLD = 500;

// Animation constants
const RUN_FRAME_INTERVAL = 120; // ms between run frames
const BLINK_INTERVAL = 3000; // ms between blinks

// ========== PLAYER CLASS ==========
class Player {
  constructor() {
    this.x = PLAYER_X;
    this.y = GROUND_Y - PLAYER_HEIGHT;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.velocityY = 0;
    this.isJumping = false;
    this.isDucking = false;
    this.runFrame = 0;
    this.lastFrameTime = 0;
    this.blinkTime = 0;
    this.isBlinking = false;
    this.image = null;
  }

  setImage(img) {
    this.image = img;
  }

  jump() {
    if (!this.isJumping && !this.isDucking) {
      this.velocityY = JUMP_VELOCITY;
      this.isJumping = true;
      playJump();
    }
  }

  duck() {
    if (!this.isJumping) {
      this.isDucking = true;
      this.height = PLAYER_DUCK_HEIGHT;
      this.y = GROUND_Y - PLAYER_DUCK_HEIGHT;
    }
  }

  stopDucking() {
    if (this.isDucking && !this.isJumping) {
      this.isDucking = false;
      this.height = PLAYER_HEIGHT;
      this.y = GROUND_Y - PLAYER_HEIGHT;
    }
  }

  update(deltaTime) {
    // Apply gravity
    if (this.isJumping) {
      this.velocityY += GRAVITY;
      if (this.velocityY > MAX_FALL_SPEED) {
        this.velocityY = MAX_FALL_SPEED;
      }
      this.y += this.velocityY;

      // Land on ground
      if (this.y >= GROUND_Y - this.height) {
        this.y = GROUND_Y - this.height;
        this.isJumping = false;
        this.velocityY = 0;
      }
    }

    // Update run animation
    this.lastFrameTime += deltaTime;
    if (this.lastFrameTime >= RUN_FRAME_INTERVAL) {
      this.runFrame = (this.runFrame + 1) % 2;
      this.lastFrameTime = 0;
    }

    // Update blink animation
    this.blinkTime += deltaTime;
    if (this.blinkTime >= BLINK_INTERVAL) {
      this.isBlinking = true;
      setTimeout(() => {
        this.isBlinking = false;
      }, 100);
      this.blinkTime = 0;
    }
  }

  draw(ctx, color) {
    // Draw T-Rex image if loaded, otherwise fallback to shapes
    if (this.image && this.image.complete) {
      ctx.save();
      
      if (this.isDucking) {
        // Draw ducking pose (flipped/scaled)
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      } else {
        // Draw standing/jumping pose
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
      
      ctx.restore();
    } else {
      // Fallback to original drawing code
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      if (this.isDucking) {
        // Draw ducking T-Rex (simplified)
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Head
        ctx.fillRect(this.x, this.y - 10, 30, 10);
        // Eyes
        if (!this.isBlinking) {
          ctx.fillRect(this.x + 20, this.y - 8, 4, 4);
        }
      } else {
        // Draw standing T-Rex
        // Body
        ctx.fillRect(this.x, this.y + 10, 28, 28);
        // Head
        ctx.fillRect(this.x + 20, this.y, 18, 18);
        // Eyes
        if (!this.isBlinking) {
          ctx.fillRect(this.x + 30, this.y + 4, 4, 4);
        }
        // Arms
        ctx.fillRect(this.x + 8, this.y + 18, 8, 12);
        // Legs (animated)
        if (this.runFrame === 0 && !this.isJumping) {
          ctx.fillRect(this.x + 10, this.y + 38, 8, 10);
          ctx.fillRect(this.x + 22, this.y + 38, 8, 6);
        } else if (!this.isJumping) {
          ctx.fillRect(this.x + 10, this.y + 38, 8, 6);
          ctx.fillRect(this.x + 22, this.y + 38, 8, 10);
        } else {
          // Jump pose
          ctx.fillRect(this.x + 10, this.y + 38, 8, 8);
          ctx.fillRect(this.x + 22, this.y + 38, 8, 8);
        }
        // Tail
        ctx.fillRect(this.x - 8, this.y + 12, 12, 8);
      }
    }
  }

  getBounds() {
    // Return tighter hitbox for better gameplay
    const padding = 4;
    return {
      x: this.x + padding,
      y: this.y + padding,
      width: this.width - padding * 2,
      height: this.height - padding * 2,
    };
  }
}

// ========== OBSTACLE CLASSES ==========
class Cactus {
  constructor(x, width, height) {
    this.x = x;
    this.width = width;
    this.height = height;
    this.y = GROUND_Y - height;
    this.type = 'cactus';
  }

  update(speed) {
    this.x -= speed;
  }

  draw(ctx, color) {
    ctx.fillStyle = color;
    // Main body
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Arms (if wide enough)
    if (this.width > 30) {
      ctx.fillRect(this.x + 5, this.y + 10, 8, 12);
      ctx.fillRect(this.x + this.width - 13, this.y + 10, 8, 12);
    }
  }

  getBounds() {
    const padding = 2;
    return {
      x: this.x + padding,
      y: this.y + padding,
      width: this.width - padding * 2,
      height: this.height - padding * 2,
    };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

class Pterodactyl {
  constructor(x, yPosition) {
    this.x = x;
    this.y = yPosition;
    this.width = PTERODACTYL_WIDTH;
    this.height = PTERODACTYL_HEIGHT;
    this.type = 'pterodactyl';
    this.wingFrame = 0;
    this.lastFrameTime = 0;
  }

  update(speed, deltaTime) {
    this.x -= speed;
    
    // Update wing animation
    this.lastFrameTime += deltaTime;
    if (this.lastFrameTime >= 150) {
      this.wingFrame = (this.wingFrame + 1) % 2;
      this.lastFrameTime = 0;
    }
  }

  draw(ctx, color) {
    ctx.fillStyle = color;
    // Body
    ctx.fillRect(this.x + 10, this.y + 10, 26, 16);
    // Head
    ctx.fillRect(this.x + 28, this.y + 6, 16, 12);
    // Beak
    ctx.fillRect(this.x + 44, this.y + 10, 6, 6);
    // Wings (animated)
    if (this.wingFrame === 0) {
      ctx.fillRect(this.x, this.y, 20, 8);
      ctx.fillRect(this.x, this.y + 28, 20, 8);
    } else {
      ctx.fillRect(this.x + 5, this.y + 2, 15, 8);
      ctx.fillRect(this.x + 5, this.y + 26, 15, 8);
    }
  }

  getBounds() {
    const padding = 4;
    return {
      x: this.x + padding,
      y: this.y + padding,
      width: this.width - padding * 2,
      height: this.height - padding * 2,
    };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// ========== OBSTACLE MANAGER ==========
class ObstacleManager {
  constructor() {
    this.obstacles = [];
    this.nextSpawnDistance = MIN_OBSTACLE_SPACING;
    this.distanceTraveled = 0;
  }

  update(speed, deltaTime, score) {
    this.distanceTraveled += speed;

    // Update existing obstacles
    this.obstacles.forEach((obstacle) => {
      if (obstacle.type === 'pterodactyl') {
        obstacle.update(speed, deltaTime);
      } else {
        obstacle.update(speed);
      }
    });

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter((obstacle) => !obstacle.isOffScreen());

    // Spawn new obstacles
    if (this.distanceTraveled >= this.nextSpawnDistance) {
      this.spawnObstacle(score);
      this.distanceTraveled = 0;
      // Decrease spacing as score increases
      const spacing = Math.max(
        MIN_OBSTACLE_SPACING,
        MAX_OBSTACLE_SPACING - score * 0.1
      );
      this.nextSpawnDistance = spacing + Math.random() * 100;
    }
  }

  spawnObstacle(score) {
    const spawnX = CANVAS_WIDTH + 50;

    // Introduce pterodactyls after score > 500
    const canSpawnPterodactyl = score > 500;
    const spawnPterodactyl = canSpawnPterodactyl && Math.random() < 0.3;

    if (spawnPterodactyl) {
      const yPosition = PTERODACTYL_Y_POSITIONS[Math.floor(Math.random() * PTERODACTYL_Y_POSITIONS.length)];
      this.obstacles.push(new Pterodactyl(spawnX, yPosition));
    } else {
      // Spawn cactus with random dimensions
      const width = CACTUS_MIN_WIDTH + Math.random() * (CACTUS_MAX_WIDTH - CACTUS_MIN_WIDTH);
      const height = CACTUS_MIN_HEIGHT + Math.random() * (CACTUS_MAX_HEIGHT - CACTUS_MIN_HEIGHT);
      this.obstacles.push(new Cactus(spawnX, width, height));
    }
  }

  draw(ctx, color) {
    this.obstacles.forEach((obstacle) => obstacle.draw(ctx, color));
  }

  reset() {
    this.obstacles = [];
    this.nextSpawnDistance = MIN_OBSTACLE_SPACING;
    this.distanceTraveled = 0;
  }
}

// ========== COLLISION DETECTION ==========
function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect2.height > rect2.y
  );
}

// ========== MAIN GAME CANVAS COMPONENT ==========
const GameCanvas = ({ onScoreChange, onHighScoreChange, onGameStateChange, onThemeChange, isPaused, onPauseChange }) => {
  const canvasRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const trexImageRef = useRef(null);
  
  const gameStateRef = useRef({
    player: new Player(),
    obstacleManager: new ObstacleManager(),
    score: 0,
    highScore: 0,
    gameSpeed: INITIAL_SPEED,
    isRunning: false,
    isPaused: false,
    isGameOver: false,
    lastTime: 0,
    groundX: 0,
    lastMilestone: 0,
    isDark: false,
    keys: {},
  });

  useEffect(() => {
    // Load images
    const bgImg = new Image();
    bgImg.src = '/background.jpg';
    backgroundImageRef.current = bgImg;

    const trexImg = new Image();
    trexImg.src = '/t-rex.png';
    trexImg.onload = () => {
      gameStateRef.current.player.setImage(trexImg);
    };
    trexImageRef.current = trexImg;

    // Load high score from localStorage
    if (typeof window !== 'undefined') {
      const savedHighScore = localStorage.getItem('trex_highscore_v1');
      if (savedHighScore) {
        gameStateRef.current.highScore = parseFloat(savedHighScore);
        onHighScoreChange(gameStateRef.current.highScore);
      }
      initAudio();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas display size with devicePixelRatio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    // ========== INPUT HANDLERS ==========
    const handleKeyDown = (e) => {
      const game = gameStateRef.current;
      game.keys[e.code] = true;

      if (!game.isRunning && !game.isGameOver) {
        // Start game
        startGame();
        return;
      }

      if (game.isGameOver && e.code === 'KeyR') {
        // Restart game
        restartGame();
        return;
      }

      if (game.isRunning && !game.isGameOver) {
        if (e.code === 'KeyP' || e.code === 'Escape') {
          // Toggle pause
          e.preventDefault();
          togglePause();
        } else if (!game.isPaused) {
          if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            game.player.jump();
          } else if (e.code === 'ArrowDown') {
            e.preventDefault();
            game.player.duck();
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      const game = gameStateRef.current;
      game.keys[e.code] = false;

      if (e.code === 'ArrowDown') {
        game.player.stopDucking();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && gameStateRef.current.isRunning && !gameStateRef.current.isPaused) {
        // Pause game when tab is hidden
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ========== GAME FUNCTIONS ==========
    const startGame = () => {
      const game = gameStateRef.current;
      game.isRunning = true;
      game.isGameOver = false;
      game.isPaused = false;
      game.lastTime = performance.now();
      onGameStateChange('playing');
      if (onPauseChange) onPauseChange(false);
      initAudio();
    };

    const togglePause = () => {
      const game = gameStateRef.current;
      if (game.isRunning && !game.isGameOver) {
        game.isPaused = !game.isPaused;
        if (!game.isPaused) {
          game.lastTime = performance.now();
        }
        onGameStateChange(game.isPaused ? 'paused' : 'playing');
        if (onPauseChange) onPauseChange(game.isPaused);
      }
    };

    const restartGame = () => {
      const game = gameStateRef.current;
      game.player = new Player();
      game.player.setImage(trexImageRef.current);
      game.obstacleManager.reset();
      game.score = 0;
      game.gameSpeed = INITIAL_SPEED;
      game.lastMilestone = 0;
      game.groundX = 0;
      game.isDark = false;
      onScoreChange(0);
      onThemeChange(false);
      startGame();
    };

    const gameOver = () => {
      const game = gameStateRef.current;
      game.isRunning = false;
      game.isGameOver = true;
      game.isPaused = false;
      playHit();

      // Update high score
      if (game.score > game.highScore) {
        game.highScore = game.score;
        localStorage.setItem('trex_highscore_v1', game.highScore.toString());
        onHighScoreChange(game.highScore);
      }

      onGameStateChange('gameOver');
      if (onPauseChange) onPauseChange(false);
    };

    // ========== GAME LOOP ==========
    const gameLoop = (currentTime) => {
      const game = gameStateRef.current;
      const deltaTime = game.isPaused ? 0 : currentTime - game.lastTime;
      if (!game.isPaused) {
        game.lastTime = currentTime;
      }

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background image
      if (backgroundImageRef.current && backgroundImageRef.current.complete) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.drawImage(backgroundImageRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }

      // Determine theme color
      const color = game.isDark ? '#fff' : '#535353';

      // Draw ground
      drawGround(ctx, color);

      if (game.isRunning && !game.isGameOver && !game.isPaused) {
        // Update game state
        game.player.update(deltaTime);
        game.obstacleManager.update(game.gameSpeed, deltaTime, game.score);

        // Update score (increases over time)
        game.score += game.gameSpeed * 0.1;
        onScoreChange(game.score);

        // Check for speed increase with gradual acceleration
        const speedMilestone = Math.floor(game.score / SPEED_INCREASE_INTERVAL);
        const targetSpeed = Math.min(INITIAL_SPEED + (speedMilestone * SPEED_INCREMENT), MAX_SPEED);
        
        // Gradually increase speed towards target
        if (game.gameSpeed < targetSpeed) {
          game.gameSpeed = Math.min(game.gameSpeed + 0.01, targetSpeed);
        }

        // Check for milestone achievements (sound effect)
        const currentMilestone = Math.floor(game.score / MILESTONE_INTERVAL);
        if (currentMilestone > game.lastMilestone) {
          playPoint();
          game.lastMilestone = currentMilestone;
        }

        // Check for day/night theme toggle
        const themeToggle = Math.floor(game.score / DAY_NIGHT_THRESHOLD);
        const shouldBeDark = themeToggle % 2 === 1;
        if (shouldBeDark !== game.isDark) {
          game.isDark = shouldBeDark;
          onThemeChange(game.isDark);
        }

        // Update ground parallax
        game.groundX -= game.gameSpeed;
        if (game.groundX <= -100) {
          game.groundX = 0;
        }

        // Collision detection
        const playerBounds = game.player.getBounds();
        for (const obstacle of game.obstacleManager.obstacles) {
          const obstacleBounds = obstacle.getBounds();
          if (checkCollision(playerBounds, obstacleBounds)) {
            gameOver();
            break;
          }
        }
      }

      // Draw game objects
      game.player.draw(ctx, color);
      game.obstacleManager.draw(ctx, color);

      // Draw pause overlay
      if (game.isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = color;
        ctx.font = 'bold 40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.font = '20px monospace';
        ctx.fillText('Press P or ESC to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
      }

      requestAnimationFrame(gameLoop);
    };

    // Draw ground with parallax pattern
    const drawGround = (ctx, color) => {
      const game = gameStateRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
      ctx.stroke();

      // Draw ground pattern (small lines)
      for (let i = 0; i < CANVAS_WIDTH + 100; i += 100) {
        const x = (i + game.groundX) % (CANVAS_WIDTH + 100);
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y + 5);
        ctx.lineTo(x + 30, GROUND_Y + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 50, GROUND_Y + 5);
        ctx.lineTo(x + 70, GROUND_Y + 5);
        ctx.stroke();
      }
    };

    // Start game loop
    gameLoop(performance.now());

    // Expose restart and pause functions
    window.restartTrexGame = restartGame;
    window.pauseTrexGame = togglePause;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      delete window.restartTrexGame;
      delete window.pauseTrexGame;
    };
  }, [onScoreChange, onHighScoreChange, onGameStateChange, onThemeChange, onPauseChange]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto max-w-4xl mx-auto"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default GameCanvas;
