
import React, { useState, useRef, useEffect } from 'react';
import { getAudioContext } from '../utils/audioUtils.ts';

// Melody for "Auld Lang Syne"
const MELODY: [number, number][] = [
  [261.63, 0.5], [349.23, 0.75], [349.23, 0.25], [349.23, 0.5], [440.00, 0.5], 
  [392.00, 0.75], [349.23, 0.25], [392.00, 0.5], [440.00, 0.5], [349.23, 0.75], 
  [349.23, 0.25], [440.00, 0.5], [523.25, 0.5], [587.33, 1.0], [0, 0.1], 
  [523.25, 0.75], [440.00, 0.25], [440.00, 0.5], [349.23, 0.5], [392.00, 0.75], 
  [349.23, 0.25], [392.00, 0.5], [440.00, 0.5], [349.23, 0.75], [293.66, 0.25], 
  [293.66, 0.5], [261.63, 0.5], [349.23, 1.0]
];

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'mp3' | 'synth' | 'none'>('none');
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [ctxState, setCtxState] = useState<string>('unknown');
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthTimeoutRef = useRef<number | null>(null);
  const synthMasterGainRef = useRef<GainNode | null>(null);

  const musicSources = [
    "https://upload.wikimedia.org/wikipedia/commons/1/10/Auld_Lang_Syne_-_piano_solo.mp3",
    "https://archive.org/download/AuldLangSyne_201612/Auld%20Lang%20Syne.mp3"
  ];

  // Sync volume changes to active players
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (synthMasterGainRef.current) {
      const ctx = getAudioContext();
      synthMasterGainRef.current.gain.setTargetAtTime(volume * 0.6, ctx.currentTime, 0.1);
    }
  }, [volume]);

  // Monitor audio context state
  useEffect(() => {
    const ctx = getAudioContext();
    const updateState = () => setCtxState(ctx.state);
    ctx.addEventListener('statechange', updateState);
    updateState();
    return () => ctx.removeEventListener('statechange', updateState);
  }, []);

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (synthTimeoutRef.current) {
      window.clearTimeout(synthTimeoutRef.current);
      synthTimeoutRef.current = null;
    }
    if (synthMasterGainRef.current) {
      const ctx = getAudioContext();
      synthMasterGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      const oldGain = synthMasterGainRef.current;
      setTimeout(() => oldGain.disconnect(), 100);
      synthMasterGainRef.current = null;
    }
    setIsPlaying(false);
    setStatus('idle');
    setMode('none');
  };

  const playSynth = () => {
    const ctx = getAudioContext();
    
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, ctx.currentTime);
    
    masterGain.connect(filter);
    filter.connect(ctx.destination);
    
    // Use current volume setting
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.setTargetAtTime(volume * 0.6, ctx.currentTime, 0.1);
    
    synthMasterGainRef.current = masterGain;

    let noteIndex = 0;
    setStatus('playing');
    setMode('synth');
    setIsPlaying(true);

    const playNextNote = () => {
      if (synthMasterGainRef.current !== masterGain) return;

      const [freq, duration] = MELODY[noteIndex];
      const now = ctx.currentTime;

      if (freq > 0) {
        // Boosted oscillators for better mobile presence
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const noteGain = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(freq + 2, now); // Slight detune for thickness
        
        noteGain.connect(masterGain);
        osc1.connect(noteGain);
        osc2.connect(noteGain);
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.25, now + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.05);
        
        osc1.start(now);
        osc1.stop(now + duration);
        osc2.start(now);
        osc2.stop(now + duration);
      }

      noteIndex = (noteIndex + 1) % MELODY.length;
      synthTimeoutRef.current = window.setTimeout(playNextNote, duration * 1000) as unknown as number;
    };

    playNextNote();
  };

  const toggleMusic = async () => {
    const ctx = getAudioContext();
    
    // User interaction required for mobile
    if (ctx.state !== 'running') {
      await ctx.resume();
    }

    if (isPlaying) {
      stopAll();
      return;
    }

    try {
      setStatus('loading');
      setMode('mp3');
      if (audioRef.current) {
        audioRef.current.volume = volume;
        await audioRef.current.play();
        setIsPlaying(true);
        setStatus('playing');
      }
    } catch (err) {
      console.warn("MP3 blocked/failed, falling back to Synth.");
      stopAll();
      playSynth();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Mobile Hint & Debug */}
      <div className="flex flex-col gap-1">
        <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-mono uppercase tracking-widest text-white/50">
          Audio: <span className={ctxState === 'running' ? 'text-green-400' : 'text-amber-500'}>{ctxState}</span>
        </div>
        {ctxState !== 'running' && isPlaying && (
          <div className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[8px] font-bold uppercase text-red-300 animate-pulse">
            Tap screen to unmute
          </div>
        )}
      </div>

      <audio 
        ref={audioRef} 
        src={musicSources[0]} 
        loop 
        preload="auto"
        onError={() => { if(mode === 'mp3') playSynth(); }}
      />
      
      <div className="flex items-center gap-2 group">
        <button
          onClick={toggleMusic}
          onMouseEnter={() => setShowVolume(true)}
          className={`relative flex items-center gap-3 p-3 rounded-full backdrop-blur-xl border transition-all duration-500 shadow-2xl ${
            isPlaying 
              ? 'bg-amber-500/40 border-amber-400 scale-105 shadow-amber-500/50' 
              : 'bg-slate-900/95 border-slate-700 hover:border-slate-500'
          }`}
        >
          <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-slate-950/90 overflow-hidden border border-white/10">
            {status === 'loading' ? (
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <div className="flex items-end gap-1 h-5">
                <div className="w-1.5 bg-amber-400 animate-[bounce_0.4s_infinite_100ms] rounded-full" style={{ height: '70%' }} />
                <div className="w-1.5 bg-amber-400 animate-[bounce_0.4s_infinite_300ms] rounded-full" style={{ height: '100%' }} />
                <div className="w-1.5 bg-amber-400 animate-[bounce_0.4s_infinite_500ms] rounded-full" style={{ height: '80%' }} />
                <div className="w-1.5 bg-amber-400 animate-[bounce_0.4s_infinite_200ms] rounded-full" style={{ height: '50%' }} />
              </div>
            ) : (
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            )}
          </div>
          
          <div className={`overflow-hidden transition-all duration-500 flex flex-col items-start ${isPlaying || status === 'loading' ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none text-amber-500/80">
              {mode === 'synth' ? 'MOBILE BRASS' : 'PIANO SOLO'}
            </span>
            <span className="text-xs font-bold text-white whitespace-nowrap mt-1">
              Auld Lang Syne
            </span>
          </div>
        </button>

        {/* Dynamic Volume Control */}
        <div 
          className={`flex items-center gap-3 bg-slate-950/90 backdrop-blur-2xl border border-slate-800 p-4 rounded-full transition-all duration-500 shadow-2xl ${
            showVolume || isPlaying ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
          }`}
          onMouseLeave={() => setShowVolume(false)}
        >
          <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[10px] font-mono text-amber-500 w-6">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
      
      {isPlaying && (
        <p className="text-[9px] text-white/30 italic max-w-[180px] leading-tight">
          Pro-tip: Check your phone's physical silent switch if you don't hear anything.
        </p>
      )}
    </div>
  );
};

export default MusicPlayer;
