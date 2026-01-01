
import React, { useState } from 'react';
import { generateAchievementImage } from '../services/geminiService.ts';
import { Achievement } from '../types.ts';

const AchievementsGallery: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      text: '',
      imageUrl: null,
      loading: false,
    }))
  );

  const handleTextChange = (id: number, val: string) => {
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, text: val } : a));
  };

  const handleGenerateImage = async (id: number) => {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement || !achievement.text.trim()) return;

    setAchievements(prev => prev.map(a => a.id === id ? { ...a, loading: true } : a));
    
    try {
      const url = await generateAchievementImage(achievement.text);
      setAchievements(prev => prev.map(a => a.id === id ? { ...a, imageUrl: url, loading: false } : a));
    } catch (error) {
      console.error("Failed to generate achievement image", error);
      setAchievements(prev => prev.map(a => a.id === id ? { ...a, loading: false } : a));
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-inner">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-6xl font-display text-white mb-4">Hall of Triumphs</h2>
        <p className="text-slate-400 max-w-xl mx-auto">Commemorate your 10 biggest victories of 2025. Input each achievement and let AI visualize your success.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {achievements.map((a) => (
          <div key={a.id} className="group flex flex-col gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 hover:border-amber-500/30 transition-all duration-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm border border-amber-500/20">
                {a.id + 1}
              </span>
              <input 
                type="text"
                value={a.text}
                onChange={(e) => handleTextChange(a.id, e.target.value)}
                placeholder="What was your big win?"
                className="flex-1 bg-transparent border-b border-slate-700 focus:border-amber-500 text-white py-2 px-1 outline-none transition-colors"
              />
            </div>

            <div className="relative aspect-square w-full bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {a.imageUrl ? (
                <img src={a.imageUrl} alt={a.text} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700" />
              ) : (
                <div className="text-slate-600 flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-[10px] uppercase tracking-widest font-bold">Awaiting Input</span>
                </div>
              )}

              {a.loading && (
                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-amber-500 text-[10px] font-bold uppercase tracking-tighter animate-pulse">Visualizing...</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleGenerateImage(a.id)}
              disabled={a.loading || !a.text.trim()}
              className="mt-2 w-full py-3 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-slate-500 text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-amber-500/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Visualize Success
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsGallery;
