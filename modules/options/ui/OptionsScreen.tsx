import React, { useRef } from 'react';
import { BellSettings, SoundType } from '../../shared/domain/types';
import { ArrowLeft, Bell, Upload, PlayCircle } from 'lucide-react';
import { playSynthesizedSound, playAudioBuffer, initAudioContext } from '../../shared/infrastructure/audio';

interface Props {
  settings: BellSettings;
  onUpdateSettings: (settings: BellSettings) => void;
  onBack: () => void;
  onLoadCustomAudio: (buffer: AudioBuffer, name: string) => void;
  customAudioName: string | null;
  customAudioBuffer: AudioBuffer | null;
}

export const OptionsScreen: React.FC<Props> = ({ 
  settings, 
  onUpdateSettings, 
  onBack,
  onLoadCustomAudio,
  customAudioName,
  customAudioBuffer,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Standard Styling
  const containerClass = "bg-slate-900 text-slate-100";
  const headerClass = "bg-slate-900/90 border-slate-800";
  const titleClass = "font-bold text-white";
  const sectionTitleClass = "text-slate-500";
  const cardBgClass = "bg-slate-800 border-slate-700";
  const activeOptionClass = "bg-sky-500/10 border-sky-500 text-sky-400";
  const inactiveOptionClass = "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600";

  const handleTestSound = () => {
    const ctx = initAudioContext();
    if (settings.sound === 'custom' && customAudioBuffer) {
      playAudioBuffer(ctx, customAudioBuffer);
    } else {
      playSynthesizedSound(ctx, settings.sound);
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className={`h-full flex flex-col overflow-y-auto ${containerClass}`}>
      <div className={`p-6 border-b flex items-center gap-4 sticky top-0 backdrop-blur z-10 ${headerClass}`}>
        <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className={`text-xl ${titleClass}`}>
          Opciones
        </h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full space-y-8 pb-10">
        
        {/* Sound Selection */}
        <section className="space-y-4">
          <h2 className={`text-sm uppercase tracking-wider font-semibold ${sectionTitleClass}`}>Sonido de Alarma</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['real-bell', 'digital', 'grave'] as SoundType[]).map((type) => (
              <button
                key={type}
                onClick={() => onUpdateSettings({ ...settings, sound: type })}
                className={`p-4 rounded-xl border flex items-center justify-between group transition-all ${
                  settings.sound === type ? activeOptionClass : inactiveOptionClass
                }`}
              >
                <span className="capitalize">{type.replace('-', ' ')}</span>
                {settings.sound === type && <Bell className="w-5 h-5 fill-current" />}
              </button>
            ))}
            
            {/* Custom Sound Button */}
            <div className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                  settings.sound === 'custom' ? activeOptionClass : inactiveOptionClass
                }`}>
                <button 
                  onClick={() => onUpdateSettings({ ...settings, sound: 'custom' })}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className={`capitalize ${settings.sound === 'custom' ? 'text-sky-400' : 'text-slate-300'}`}>Personalizado</span>
                  {settings.sound === 'custom' && <Bell className="w-5 h-5 fill-current text-sky-400" />}
                </button>
                
                <div className="flex items-center gap-2">
                   <input 
                      type="file" 
                      accept="audio/*" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleAudioFileChange}
                   />
                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-colors bg-slate-900 text-slate-400 hover:text-white border-slate-700 hover:border-slate-500"
                   >
                     <Upload className="w-3 h-3" />
                     {customAudioName ? (customAudioName.length > 15 ? customAudioName.substring(0,12) + '...' : customAudioName) : 'Subir audio'}
                   </button>
                </div>
            </div>
          </div>
          
          <button 
            onClick={handleTestSound}
            className="flex items-center gap-2 text-sm font-medium mt-2 px-2 text-sky-400 hover:text-sky-300"
          >
            <PlayCircle className="w-4 h-4" />
            Probar sonido actual
          </button>
        </section>

        {/* Repetitions */}
        <section className="space-y-4">
           <h2 className={`text-sm uppercase tracking-wider font-semibold ${sectionTitleClass}`}>Configuración de Repeticiones</h2>
           <div className={`p-6 rounded-xl border ${cardBgClass}`}>
             <div className="flex items-center justify-between mb-2">
               <span className="text-white">Cantidad</span>
               <span className="font-mono text-xl text-sky-400">{settings.repetitions}</span>
             </div>
             <input 
               type="range" 
               min="1" 
               max="10" 
               value={settings.repetitions}
               onChange={(e) => onUpdateSettings({ ...settings, repetitions: parseInt(e.target.value) })}
               className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-sky-500"
             />
             <p className="text-xs mt-4 text-slate-500">
               Número de veces que sonará la campana en cada aviso.
             </p>
           </div>
        </section>
        
        {/* Interval */}
        <section className="space-y-4">
           <h2 className={`text-sm uppercase tracking-wider font-semibold ${sectionTitleClass}`}>Intervalo (ms)</h2>
           <div className={`p-6 rounded-xl border ${cardBgClass}`}>
             <div className="flex items-center justify-between mb-2">
               <span className="text-white">Velocidad</span>
               <span className="font-mono text-xl text-sky-400">{settings.interval}ms</span>
             </div>
             <input 
               type="range" 
               min="100" 
               max="2000" 
               step="100"
               value={settings.interval}
               onChange={(e) => onUpdateSettings({ ...settings, interval: parseInt(e.target.value) })}
               className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-sky-500"
             />
           </div>
        </section>

      </div>
    </div>
  );
};