
import React, { useState, useRef, useEffect } from 'react';
import { getAudioContext } from '../utils/audioUtils.ts';

// Simplified melody for "Auld Lang Syne"
// [frequency, duration_in_seconds]
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
  const [sourceIndex, setSourceIndex] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthTimeoutRef = useRef<number | null>(null);
  const synthMasterGainRef = useRef<GainNode | null>(null);

  const musicSources = [
    "https://upload.wikimedia.org/wikipedia/commons/1/10/Auld_Lang_Syne_-_piano_solo.mp3",
    "https://archive.org/download/AuldLangSyne_201612/Auld%20Lang%20Syne.mp3",
    "https://www.chosic.com/wp-content/uploads/2021/04/Auld-Lang-Syne-Instrumental.mp3"
  ];

  const stopAll = () => {
    // Stop MP3
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop Synth
    if (synthTimeoutRef.current) {
      window.clearTimeout(synthTimeoutRef.current);
      synthTimeoutRef.current = null;
    }
    
    if (synthMasterGainRef.current) {
      const ctx = getAudioContext();
      synthMasterGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      setTimeout(() => {
        synthMasterGainRef.current?.disconnect();
        synthMasterGainRef.current = null;
      }, 200);
    }

    setIsPlaying(false);
    setStatus('idle');
    setMode('none');
  };

  const playSynth = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(console.error);
    }

    // Create a master gain for the synth session
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.6; // Set to audible level
    synthMasterGainRef.current = masterGain;

    let noteIndex = 0;
    setStatus('playing');
    setMode('synth');
    setIsPlaying(true);

    const playNextNote = () => {
      // Check if we should still be playing
      if (synthMasterGainRef.current !== masterGain) return;

      const [freq, duration] = MELODY[noteIndex];
      const now = ctx.currentTime;

      if (freq > 0) {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        noteGain.connect(masterGain);
        osc.connect(noteGain);
        
        // Note envelope
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.05);
        
        osc.start(now);
        osc.stop(now + duration);
      }

      noteIndex = (noteIndex + 1) % MELODY.length;
      synthTimeoutRef.current = window.setTimeout(playNextNote, duration * 1000) as unknown as number;
    };

    playNextNote();
  };

  const toggleMusic = async () => {
    const ctx = getAudioContext();
    
    // Crucial: AudioContext must be resumed in a user interaction
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (isPlaying) {
      stopAll();
      return;
    }

    // Default strategy: Try high quality MP3 first
    try {
      setStatus('loading');
      setMode('mp3');
      if (audioRef.current) {
        audioRef.current.volume = 0.8; // Increased volume
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          setStatus('playing');
        }
      }
    } catch (err) {
      console.warn("MP3 playback failed, falling back to synthesizer:", err);
      handleAudioError();
    }
  };

  const handleAudioError = () => {
    // If there are more MP3 sources, try them
    if (sourceIndex < musicSources.length - 1) {
      const nextIndex = sourceIndex + 1;
      setSourceIndex(nextIndex);
      if (audioRef.current) {
        audioRef.current.src = musicSources[nextIndex];
        audioRef.current.load();
        // If we were trying to play, try playing this new source
        audioRef.current.play().catch(() => {
          // If this source also fails immediately, recursive error handling happens
        });
      }
    } else {
      // Total network failure: Use the Synth
      console.log("All remote audio failed. Activating internal synthesizer.");
      stopAll();
      playSynth();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthTimeoutRef.current) window.clearTimeout(synthTimeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <audio 
        ref={audioRef} 
        src={musicSources[sourceIndex]} 
        loop 
        preload="auto"
        onError={handleAudioError}
        onPlay={() => { setStatus('playing'); setIsPlaying(true); }}
      />
      
      <button
        onClick={toggleMusic}
        className={`group flex items-center gap-3 p-3 rounded-full backdrop-blur-lg border transition-all duration-500 shadow-2xl ${
          isPlaying 
            ? 'bg-amber-500/30 border-amber-400/60 scale-110 shadow-amber-500/40' 
            : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 hover:scale-105'
        }`}
        aria-label={isPlaying ? "Mute Background Music" : "Play Background Music"}
      >
        <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-950/80 overflow-hidden border border-white/5">
          {status === 'loading' ? (
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <div className="flex items-end gap-1 h-4">
              <div className="w-1 bg-amber-400 animate-[bounce_0.6s_infinite_100ms] rounded-full" style={{ height: '60%' }} />
              <div className="w-1 bg-amber-400 animate-[bounce_0.6s_infinite_300ms] rounded-full" style={{ height: '100%' }} />
              <div className="w-1 bg-amber-400 animate-[bounce_0.6s_infinite_500ms] rounded-full" style={{ height: '80%' }} />
              <div className="w-1 bg-amber-400 animate-[bounce_0.6s_infinite_200ms] rounded-full" style={{ height: '40%' }} />
            </div>
          ) : (
            <svg className="w-5 h-5 text-amber-500/80 group-hover:text-amber-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </div>
        
        <div className={`overflow-hidden transition-all duration-500 flex flex-col items-start ${isPlaying || status === 'loading' ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none text-amber-500">
            {status === 'loading' ? 'Loading' : mode === 'synth' ? 'Synthesizer' : 'Streaming'}
          </span>
          <span className="text-xs font-bold text-white whitespace-nowrap mt-1">
            Auld Lang Syne
          </span>
        </div>

        {!isPlaying && status === 'idle' && (
          <span className="absolute -top-12 left-0 bg-slate-800 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none shadow-xl">
            PLAY FESTIVE MUSIC
          </span>
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;
