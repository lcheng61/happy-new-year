
import React, { useState } from 'react';
import { generateCelebrationSpeech, generateSpeechAudio } from '../services/geminiService.ts';
import { CelebrationMessage } from '../types.ts';
import { playRawPcm } from '../utils/audioUtils.ts';

const SpeechSection: React.FC = () => {
  const [mood, setMood] = useState('Hopeful');
  const [speech, setSpeech] = useState<CelebrationMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateCelebrationSpeech(mood);
      setSpeech(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleListen = async () => {
    if (!speech || playingAudio) return;
    setPlayingAudio(true);
    try {
      const audioData = await generateSpeechAudio(`Read this speech with feeling: ${speech.content}`);
      if (audioData) {
        await playRawPcm(audioData);
      }
    } catch (error) {
      console.error("Audio playback error", error);
    } finally {
      setPlayingAudio(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H14.017C13.4647 8 13.017 8.44772 13.017 9V12C13.017 12.5523 12.5693 13 12.017 13H10.017C9.46472 13 9.017 12.5523 9.017 12V9C9.017 8.44772 8.56928 8 8.017 8H3.017C2.46472 8 2.017 8.44772 2.017 9V15C2.017 15.5523 2.46472 16 3.017 16H6.017C7.12157 16 8.017 16.8954 8.017 18L8.017 21H14.017Z" />
          </svg>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-display text-white mb-4">Midnight Address</h2>
          <p className="text-slate-400">Generate a personalized New Year message based on your current state of mind.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['Hopeful', 'Ambitious', 'Grateful', 'Relieved', 'Excited', 'Reflective'].map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                mood === m 
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex justify-center mb-12">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="group relative px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-white/20"
          >
            {loading ? "Thinking..." : "Generate My Speech"}
          </button>
        </div>

        {speech && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative p-8 md:p-12 bg-slate-950/50 rounded-[2rem] border border-slate-800">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={handleListen}
                  disabled={playingAudio}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-amber-500 transition-all border border-slate-700 disabled:opacity-50"
                  title="Listen to Address"
                >
                  {playingAudio ? (
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v18c-4.97 0-9-4.03-9-9s4.03-9 9-9zM14 12c0-1.66-1.34-3-3-3v6c1.66 0 3-1.34 3-3z"/>
                      <path d="M16.5 12c0-3.07-1.63-5.64-4.5-6.32v12.64c2.87-.68 4.5-3.25 4.5-6.32z"/>
                    </svg>
                  )}
                </button>
              </div>
              <h4 className="text-amber-500 font-display text-2xl mb-4 text-center">"{speech.title}"</h4>
              <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light italic text-center">
                {speech.content}
              </p>
              <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest text-slate-500 mb-1">Signed by</span>
                <span className="text-lg font-display text-white">{speech.author}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechSection;
