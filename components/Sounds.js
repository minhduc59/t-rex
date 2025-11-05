// Sounds.js - WebAudio API helper for game sounds
// Generates sounds procedurally using oscillators for jump, point milestone, and collision

let audioContext = null;
let isMuted = false;

// Initialize AudioContext (must be done after user interaction)
export const initAudio = () => {
  if (!audioContext && typeof window !== 'undefined') {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
      // Load mute preference from localStorage
      const savedMute = localStorage.getItem('trex_muted');
      isMuted = savedMute === 'true';
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }
  return audioContext;
};

// Set mute state and persist to localStorage
export const setMuted = (muted) => {
  isMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('trex_muted', muted.toString());
  }
};

// Get current mute state
export const getMuted = () => {
  return isMuted;
};

// Play jump sound - short upward sweep
export const playJump = () => {
  if (!audioContext || isMuted) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.warn('Error playing jump sound', e);
  }
};

// Play point milestone sound - pleasant chime
export const playPoint = () => {
  if (!audioContext || isMuted) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (e) {
    console.warn('Error playing point sound', e);
  }
};

// Play collision/hit sound - harsh downward sweep
export const playHit = () => {
  if (!audioContext || isMuted) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.warn('Error playing hit sound', e);
  }
};
