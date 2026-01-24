import React, { useRef } from 'react';
import { BellSettings, SoundType, Theme } from '../types';
import { ArrowLeft, Bell, Upload, PlayCircle } from 'lucide-react';
import { playSynthesizedSound, playAudioBuffer, initAudioContext } from '../utils/audioUtils';

interface Props {
  settings: BellSettings;
  onUpdateSettings: (settings: BellSettings) => void;
  onBack: () => void;
  onLoadCustomAudio: (buffer: AudioBuffer, name: string) => void;
  customAudioName: string | null;
  customAudioBuffer: AudioBuffer | null;
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
}

export const OptionsScreen: React.FC<Props> = ({ 
  settings, 
  onUpdateSettings, 
  onBack,
  onLoadCustomAudio,
  customAudioName,
  customAudioBuffer,
  theme,
  onSetTheme,
}) => {
  const isSteampunk = theme === 'steampunk';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTestSound = () => {
    const ctx = initAudioContext();
    if (settings.sound === 'custom' && customAudioBuffer) {
      playAudioBuffer(ctx, customAudioBuffer);
    } else {
      playSynthesizedSound(ctx, settings.sound);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ctx = initAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      try {
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        onLoadCustomAudio(audioBuffer, file.name);
        onUpdateSettings({ ...settings, sound: 'custom' });
      } catch (error) {
        console.error("Error decoding audio", error);
        alert("Error al cargar el archivo de audio.");
      }
    }
  };

  const containerClass = isSteampunk
    ? "h-full steampunk-wood-bg steampunk-steam flex flex-col overflow-y-auto"
    : "h-full bg-slate-900 flex flex-col overflow-y-auto";

  const headerClass = isSteampunk
    ? "p-6 steampunk-panel flex items-center gap-4 sticky top-0 z-10"
    : "p-6 border-b border-slate-800 flex items-center gap-4 sticky top-0 bg-slate-900/90 backdrop-blur z-10";

  const titleClass = isSteampunk
    ? "steampunk-title text-xl md:text-2xl flex-1 text-center"
    : "text-xl font-bold text-white";

  const sectionTitleClass = isSteampunk
    ? "steampunk-subtitle text-sm uppercase tracking-wider font-semibold"
    : "text-sm uppercase tracking-wider text-slate-500 font-semibold";

  const panelClass = isSteampunk
    ? "steampunk-panel p-6"
    : "bg-slate-800 p-6 rounded-xl border border-slate-700";

  const buttonClass = (isSelected: boolean) => isSteampunk
    ? `steampunk-button p-4 flex items-center justify-between group transition-all ${isSelected ? 'ring-2 ring-amber-500' : ''}`
    : `p-4 rounded-xl border flex items-center justify-between group transition-all ${
        isSelected 
        ? 'bg-sky-500/10 border-sky-500 text-sky-400' 
        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
      }`;

  const sliderClass = isSteampunk
    ? "steampunk-slider w-full"
    : "w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500";

  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isSteampunk ? 'steampunk-button' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className={titleClass}>{isSteampunk ? "Configuración General" : "Opciones"}</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full space-y-8 pb-10">
        
        {/* Sound Selection */}
        <section className="space-y-4">
          <h2 className={sectionTitleClass}>{isSteampunk ? "PREFERENCIAS DE TEMPORIZADOR" : "Sonido de Alarma"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['real-bell', 'digital', 'grave'] as SoundType[]).map((type) => (
              <button
                key={type}
                onClick={() => onUpdateSettings({ ...settings, sound: type })}
                className={buttonClass(settings.sound === type)}
              >
                <span className={`capitalize ${isSteampunk ? 'steampunk-subtitle' : ''}`}>{type.replace('-', ' ')}</span>
                {settings.sound === type && <Bell className={`w-5 h-5 ${isSteampunk ? 'text-amber-200' : 'fill-current'}`} />}
              </button>
            ))}
            
            {/* Custom Sound Button */}
            <div className={buttonClass(settings.sound === 'custom') + ' flex-col'}>
                <button 
                  onClick={() => onUpdateSettings({ ...settings, sound: 'custom' })}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className={`capitalize steampunk-subtitle ${settings.sound === 'custom' ? 'text-amber-200' : 'text-amber-300'}`}>Personalizado</span>
                  {settings.sound === 'custom' && <Bell className={`w-5 h-5 ${isSteampunk ? 'text-amber-200' : 'text-sky-400 fill-current'}`} />}
                </button>
                
                <div className="flex items-center gap-2 mt-2">
                   <input 
                      type="file" 
                      accept="audio/*" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange}
                   />
                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isSteampunk 
                        ? 'steampunk-button text-sm' 
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500'
                      }`}
                   >
                     <Upload className="w-3 h-3" />
                     {customAudioName ? (customAudioName.length > 15 ? customAudioName.substring(0,12) + '...' : customAudioName) : 'Subir audio'}
                   </button>
                </div>
            </div>
          </div>
          
          <button 
            onClick={handleTestSound}
            className={`flex items-center gap-2 text-sm font-medium mt-2 px-2 ${
              isSteampunk 
              ? 'steampunk-button text-amber-200 hover:text-amber-100' 
              : 'text-sky-400 hover:text-sky-300'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            Probar sonido actual
          </button>
        </section>

        {/* Repetitions */}
        <section className="space-y-4">
           <h2 className={sectionTitleClass}>{isSteampunk ? "CONFIGURACIÓN DE REPETICIONES" : "Configuración de Repeticiones"}</h2>
           <div className={panelClass}>
             <div className="flex items-center justify-between mb-2">
               <span className={isSteampunk ? 'steampunk-subtitle' : 'text-white'}>Cantidad</span>
               <span className={`font-mono text-xl ${isSteampunk ? 'steampunk-display' : 'text-sky-400'}`}>{settings.repetitions}</span>
             </div>
             <input 
               type="range" 
               min="1" 
               max="10" 
               value={settings.repetitions}
               onChange={(e) => onUpdateSettings({ ...settings, repetitions: parseInt(e.target.value) })}
               className={sliderClass}
             />
             <p className={`text-xs mt-4 ${isSteampunk ? 'steampunk-subtitle text-amber-200/80' : 'text-slate-500'}`}>
               Número de veces que sonará la campana en cada aviso (inicio protegido, fin protegido y final).
             </p>
           </div>
        </section>
        
        {/* Interval */}
        <section className="space-y-4">
           <h2 className={sectionTitleClass}>{isSteampunk ? "INTERVALO DE ALERTA" : "Intervalo (ms)"}</h2>
           <div className={panelClass}>
             <div className="flex items-center justify-between mb-2">
               <span className={isSteampunk ? 'steampunk-subtitle' : 'text-white'}>Velocidad</span>
               <span className={`font-mono text-xl ${isSteampunk ? 'steampunk-display' : 'text-sky-400'}`}>{settings.interval}ms</span>
             </div>
             <input 
               type="range" 
               min="100" 
               max="2000" 
               step="100"
               value={settings.interval}
               onChange={(e) => onUpdateSettings({ ...settings, interval: parseInt(e.target.value) })}
               className={sliderClass}
             />
           </div>
        </section>

        {/* Theme Selection */}
        {isSteampunk && (
          <section className="space-y-4">
            <h2 className={sectionTitleClass}>TEMA</h2>
            <div className={panelClass}>
              <div className="flex gap-4">
                <button
                  onClick={() => onSetTheme('modern')}
                  className="steampunk-button flex-1 py-3"
                >
                  <span className="steampunk-subtitle">Claro</span>
                </button>
                <button
                  onClick={() => onSetTheme('steampunk')}
                  className="steampunk-button flex-1 py-3 ring-2 ring-amber-500"
                >
                  <span className="steampunk-subtitle">Steampunk</span>
                </button>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};