
import React, { useState } from 'react';
import { generateFestiveImage } from '../services/geminiService';

const FestiveGallery: React.FC = () => {
  const [theme, setTheme] = useState('Classic Golden');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const img = await generateFestiveImage(theme);
      setImage(img);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl h-full">
      <h3 className="text-2xl font-display text-white mb-6 flex items-center gap-2">
        <span className="text-amber-500">📸</span> Festive Vision
      </h3>

      <div className="space-y-6">
        <div>
          <label className="text-slate-400 text-sm font-medium block mb-2">Atmosphere Theme:</label>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          >
            <option>Classic Golden & Champagne</option>
            <option>Neon Cyberpunk Celebration</option>
            <option>Snowy Midnight Serenity</option>
            <option>Retro 1920s Gatsby Gala</option>
            <option>Minimalist Silver & White</option>
          </select>
        </div>

        <button 
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:from-slate-700 disabled:to-slate-800 text-slate-950 font-bold px-6 py-4 rounded-xl transition-all flex items-center justify-center"
        >
          {loading ? "Capturing the magic..." : "Generate Festive Image"}
        </button>

        <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
          {image ? (
            <img src={image} alt="Generated New Year Festive Vision" className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-500 flex flex-col items-center gap-3">
              <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs uppercase tracking-widest font-bold">Image Preview</p>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-amber-500 text-xs font-bold uppercase animate-pulse">Painting Atmosphere...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FestiveGallery;
