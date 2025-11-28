import React, { useState } from 'react';
import { Theme } from '../types';
import { ArrowLeft, Sparkles, Copy, RefreshCw, AlertCircle, Cpu } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onBack: () => void;
  theme: Theme;
}

export const MotionGeneratorScreen: React.FC<Props> = ({ onBack, theme }) => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Politica');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSteampunk = theme === 'steampunk';

  // --- Theme Styles ---
  const containerClass = isSteampunk 
    ? "bg-[url('https://img.freepik.com/free-photo/grunge-paint-background_1409-1337.jpg?w=1380&t=st=1709840000~exp=1709840600~hmac=d4e5f6g7')] bg-cover bg-center text-amber-100 font-serif" 
    : "bg-slate-900 text-slate-100 font-sans";

  const headerBgClass = isSteampunk ? "bg-slate-900/80 border-b border-amber-700/50" : "bg-slate-900/50 border-b border-slate-800";
  const titleClass = isSteampunk ? "font-['Rye'] text-amber-500" : "font-semibold text-white";
  const inputBgClass = isSteampunk ? "bg-slate-900/80 border-amber-700/50 focus:border-amber-500 text-amber-100" : "bg-slate-800 border-slate-700 focus:border-pink-500 text-white";
  const buttonClass = isSteampunk 
    ? "bg-amber-700 hover:bg-amber-600 border border-amber-500 text-amber-100 font-['Rye'] shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
    : "bg-pink-600 hover:bg-pink-500 text-white font-semibold shadow-lg shadow-pink-900/20";
  const resultBoxClass = isSteampunk 
    ? "bg-slate-900/90 border-2 border-amber-600/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" 
    : "bg-slate-800 border border-slate-700 shadow-xl";

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Actúa como un equipo de adjudicación experto de torneos de debate universitarios (formato BP/WSDC). 
      
      Genera una moción de debate equilibrada, profunda y debatible basada en los siguientes parámetros:
      - Temática General: "${topic}"
      - Tipo de Moción: "${type}"
      
      Reglas:
      1. La moción debe estar en Español.
      2. Debe ser una oración completa empezando típicamente por "EC...", "ECCQ...", "ECL...", etc.
      3. No añadidas explicaciones, solo la moción.
      4. Si es una moción de actor, especifica claramente el actor.
      5. Asegúrate de que haya carga de la prueba para ambos lados.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text;
      if (text) {
        setResult(text.trim());
      } else {
        throw new Error("No se generó respuesta");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el autómata de generación. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      // Optional: Show toast
    }
  };

  return (
    <div className={`flex flex-col h-full ${containerClass} overflow-y-auto`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 backdrop-blur-md sticky top-0 z-10 ${headerBgClass}`}>
        <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isSteampunk ? 'hover:bg-amber-900/50 text-amber-400' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className={`text-xl ${titleClass}`}>
          {isSteampunk ? "Motion Automaton" : "Generador de Mociones"}
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 max-w-2xl mx-auto w-full">
        
        {/* Input Section */}
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <label className={`block text-sm font-medium ${isSteampunk ? 'text-amber-400/80 uppercase tracking-widest' : 'text-slate-300'}`}>
                    Temática General
                </label>
                <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Educación, Inteligencia Artificial, Guerra en Ucrania..."
                    className={`w-full p-4 rounded-xl border outline-none transition-all placeholder:text-slate-500/50 ${inputBgClass}`}
                />
            </div>

            <div className="space-y-2">
                <label className={`block text-sm font-medium ${isSteampunk ? 'text-amber-400/80 uppercase tracking-widest' : 'text-slate-300'}`}>
                    Tipo de Moción
                </label>
                <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`w-full p-4 rounded-xl border outline-none appearance-none cursor-pointer transition-all ${inputBgClass}`}
                >
                    <option value="Politica">Moción Política (EC haría X...)</option>
                    <option value="Analisis">Moción de Análisis (EC cree que X...)</option>
                    <option value="Lamentar">Moción de Lamentar (EC lamenta X...)</option>
                    <option value="Actor">Moción de Actor (EC, como X, haría Y...)</option>
                    <option value="Valor">Moción de Valor (EC prefiere X sobre Y...)</option>
                </select>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className={`w-full py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
            >
                {loading ? (
                    <>
                       <div className={`w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin`} />
                       <span>{isSteampunk ? "Forging Motion..." : "Generando..."}</span>
                    </>
                ) : (
                    <>
                       {isSteampunk ? <Cpu className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                       <span>{isSteampunk ? "Activate Machine" : "Generar Moción"}</span>
                    </>
                )}
            </button>
        </div>

        {/* Error Display */}
        {error && (
            <div className="mt-8 w-full p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
            </div>
        )}

        {/* Result Display */}
        {result && (
            <div className={`mt-8 w-full p-8 rounded-2xl relative group animate-in zoom-in-95 duration-500 ${resultBoxClass}`}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${isSteampunk ? 'bg-amber-600 text-amber-100 border border-amber-400' : 'bg-pink-500 text-white'}`}>
                    Moción Generada
                </div>
                
                <p className={`text-xl md:text-2xl text-center leading-relaxed ${isSteampunk ? 'font-serif text-amber-50 drop-shadow-md' : 'font-medium text-white'}`}>
                    {result}
                </p>

                <div className="mt-6 flex justify-center gap-4">
                    <button 
                        onClick={copyToClipboard}
                        className={`p-2 rounded-full transition-all ${isSteampunk ? 'hover:bg-amber-900/40 text-amber-400 hover:text-amber-200' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
                        title="Copiar"
                    >
                        <Copy className="w-5 h-5" />
                    </button>
                    <button 
                         onClick={handleGenerate}
                        className={`p-2 rounded-full transition-all ${isSteampunk ? 'hover:bg-amber-900/40 text-amber-400 hover:text-amber-200' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
                        title="Regenerar"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};