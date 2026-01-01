
import React, { useState } from 'react';
import { generateResolutions } from '../services/geminiService';
import { Resolution } from '../types';

const ResolutionBuddy: React.FC = () => {
  const [interests, setInterests] = useState('');
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!interests.trim()) return;
    setLoading(true);
    try {
      const res = await generateResolutions(interests);
      setResolutions(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <h3 className="text-2xl font-display text-white mb-6 flex items-center gap-2">
        <span className="text-amber-500">✨</span> AI Resolution Buddy
      </h3>
      
      <div className="flex flex-col gap-4">
        <label className="text-slate-400 text-sm font-medium">Tell us your interests (e.g., coding, travel, fitness):</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="What excites you?"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center min-w-[120px]"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Inspire Me"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {resolutions.map((res, i) => (
          <div key={res.id || i} className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/50 transition-all hover:translate-x-1">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full">{res.category}</span>
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{res.goal}</h4>
            <p className="text-slate-400 text-sm mt-1">
              <span className="font-semibold text-slate-300">Action:</span> {res.action}
            </p>
          </div>
        ))}
        {resolutions.length === 0 && !loading && (
          <p className="text-center text-slate-500 py-10 italic">No resolutions generated yet. Start your journey above!</p>
        )}
      </div>
    </div>
  );
};

export default ResolutionBuddy;
