import React, { useEffect } from 'react';
import { useForm, useFieldArray, UseFormRegisterReturn } from 'react-hook-form';
import { FormatType, Speech } from '../types';
import { ArrowLeft, Play, Trash2, Plus } from 'lucide-react';

interface Props {
  format: FormatType;
  onBack: () => void;
  onStart: (queue: Speech[]) => void;
}

// Interfaces para los formularios actualizadas para Min/Seg
interface WSDCFormData {
  protectedSeconds: number;
  speech1Min: number; speech1Sec: number; // Principal
  speech2Min: number; speech2Sec: number; // Medios
  speech3Min: number; speech3Sec: number; // Finales
  speech4Min: number; speech4Sec: number; // Réplica
}

interface BPFormData {
  protectedSeconds: number;
  speechMin: number; 
  speechSec: number;
}

interface CustomFormData {
  protectedSeconds: number;
  speeches: {
    title: string;
    durationMin: number;
    durationSec: number;
  }[];
}

// Componente reutilizable para Input de Tiempo (Min : Seg)
const TimeInput = ({ 
  label, 
  minRegister, 
  secRegister 
}: { 
  label: string, 
  minRegister: UseFormRegisterReturn, 
  secRegister: UseFormRegisterReturn 
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input 
          type="number" 
          min="0"
          {...minRegister} 
          className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-center" 
          placeholder="0"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">min</span>
      </div>
      <span className="text-slate-400 font-bold">:</span>
      <div className="relative flex-1">
        <input 
          type="number" 
          min="0"
          max="59"
          {...secRegister} 
          className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-center" 
          placeholder="00"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">seg</span>
      </div>
    </div>
  </div>
);

export const ConfigScreen: React.FC<Props> = ({ format, onBack, onStart }) => {
  // Hooks para cada tipo de formulario
  const wsdcForm = useForm<WSDCFormData>({
    defaultValues: {
      protectedSeconds: 60,
      speech1Min: 8, speech1Sec: 0,
      speech2Min: 8, speech2Sec: 0,
      speech3Min: 8, speech3Sec: 0,
      speech4Min: 4, speech4Sec: 0
    }
  });

  const bpForm = useForm<BPFormData>({
    defaultValues: {
      protectedSeconds: 60,
      speechMin: 7,
      speechSec: 0
    }
  });

  const customForm = useForm<CustomFormData>({
    defaultValues: { 
      protectedSeconds: 60,
      speeches: [{ title: "Discurso 1", durationMin: 5, durationSec: 0 }] 
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: customForm.control,
    name: "speeches"
  });

  // Helpers para calcular segundos totales
  const getSeconds = (min: number, sec: number) => (Number(min) * 60) + Number(sec);

  // Manejadores de envío
  const onSubmitWSDC = (data: WSDCFormData) => {
    const s1 = getSeconds(data.speech1Min, data.speech1Sec);
    const s2 = getSeconds(data.speech2Min, data.speech2Sec);
    const s3 = getSeconds(data.speech3Min, data.speech3Sec);
    const s4 = getSeconds(data.speech4Min, data.speech4Sec);

    const queue: Speech[] = [
      { id: '1', title: 'Prop. Team 1', duration: s1, protectedSeconds: data.protectedSeconds },
      { id: '2', title: 'Opp. Team 1', duration: s1, protectedSeconds: data.protectedSeconds },
      { id: '3', title: 'Prop. Team 2', duration: s2, protectedSeconds: data.protectedSeconds },
      { id: '4', title: 'Opp. Team 2', duration: s2, protectedSeconds: data.protectedSeconds },
      { id: '5', title: 'Prop. Team 3', duration: s3, protectedSeconds: data.protectedSeconds },
      { id: '6', title: 'Opp. Team 3', duration: s3, protectedSeconds: data.protectedSeconds },
      { id: '7', title: 'Opp. Reply', duration: s4, protectedSeconds: Math.max(0, data.protectedSeconds / 2) },
      { id: '8', title: 'Prop. Reply', duration: s4, protectedSeconds: Math.max(0, data.protectedSeconds / 2) },
    ];
    onStart(queue);
  };

  const onSubmitBP = (data: BPFormData) => {
    const duration = getSeconds(data.speechMin, data.speechSec);
    const titles = ["PM", "LO", "DPM", "DLO", "MG", "MO", "GW", "OW"];
    const queue: Speech[] = titles.map((title, i) => ({
      id: `bp-${i}`,
      title,
      duration: duration,
      protectedSeconds: data.protectedSeconds
    }));
    onStart(queue);
  };

  const onSubmitCustom = (data: CustomFormData) => {
    const queue: Speech[] = data.speeches.map((s, i) => ({
      id: `custom-${i}-${Date.now()}`,
      title: s.title,
      duration: getSeconds(s.durationMin, s.durationSec),
      protectedSeconds: data.protectedSeconds,
    }));
    onStart(queue);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-white">
          Configuración {format}
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto pb-8">
          
          {/* WSDC Form */}
          {format === 'WSDC' && (
            <form id="wsdc-form" onSubmit={wsdcForm.handleSubmit(onSubmitWSDC)} className="flex flex-col gap-4 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-center text-white mb-4">Configuración WSDC</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Segundos protegidos</label>
                <input type="number" {...wsdcForm.register('protectedSeconds', { required: true, min: 0 })} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
              </div>

              <TimeInput 
                label="Discursos Principales (1er Orador)" 
                minRegister={wsdcForm.register('speech1Min', { required: true, min: 0 })}
                secRegister={wsdcForm.register('speech1Sec', { required: true, min: 0, max: 59 })}
              />

              <TimeInput 
                label="Discursos Medios (2do Orador)" 
                minRegister={wsdcForm.register('speech2Min', { required: true, min: 0 })}
                secRegister={wsdcForm.register('speech2Sec', { required: true, min: 0, max: 59 })}
              />

              <TimeInput 
                label="Discursos Finales (3er Orador)" 
                minRegister={wsdcForm.register('speech3Min', { required: true, min: 0 })}
                secRegister={wsdcForm.register('speech3Sec', { required: true, min: 0, max: 59 })}
              />

              <TimeInput 
                label="Discursos de Réplica" 
                minRegister={wsdcForm.register('speech4Min', { required: true, min: 0 })}
                secRegister={wsdcForm.register('speech4Sec', { required: true, min: 0, max: 59 })}
              />
              
              <button type="submit" className="w-full mt-4 bg-sky-600 hover:bg-sky-500 transition-all duration-300 rounded-lg py-3 text-lg font-semibold text-white shadow-lg shadow-sky-900/20">
                Iniciar Debate
              </button>
            </form>
          )}

          {/* BP Form */}
          {format === 'BP' && (
            <form id="bp-form" onSubmit={bpForm.handleSubmit(onSubmitBP)} className="flex flex-col gap-4 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-center text-white mb-4">Configuración BP</h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Segundos protegidos</label>
                <input type="number" {...bpForm.register('protectedSeconds', { required: true, min: 0 })} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              
              <TimeInput 
                label="Duración de discursos" 
                minRegister={bpForm.register('speechMin', { required: true, min: 0 })}
                secRegister={bpForm.register('speechSec', { required: true, min: 0, max: 59 })}
              />

              <button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 rounded-lg py-3 text-lg font-semibold text-white shadow-lg shadow-indigo-900/20">
                Iniciar Debate
              </button>
            </form>
          )}

          {/* Custom Form */}
          {format === 'Custom' && (
            <form id="custom-form" onSubmit={customForm.handleSubmit(onSubmitCustom)} className="flex flex-col gap-4 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-center text-white mb-4">Formato Personalizado</h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Segundos protegidos (Global)</label>
                <input type="number" {...customForm.register('protectedSeconds', { required: true, min: 0 })} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>

              <div className="border-t border-slate-600 my-2"></div>
              <h3 className="text-lg font-semibold text-center text-slate-200 mb-2">Discursos</h3>
              
              <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center justify-between gap-2">
                        <input 
                          type="text" 
                          {...customForm.register(`speeches.${index}.title` as const, { required: true })}
                          placeholder="Nombre del discurso" 
                          className="flex-grow text-sm bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-1 focus:ring-teal-500 outline-none" 
                        />
                        <button type="button" onClick={() => remove(index)} disabled={fields.length <= 1} className="p-2 text-slate-400 hover:text-rose-500 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors rounded-full">
                          <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <div className="relative flex-1">
                          <input 
                            type="number" 
                            min="0"
                            {...customForm.register(`speeches.${index}.durationMin` as const, { required: true, min: 0 })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white text-center focus:ring-1 focus:ring-teal-500 outline-none" 
                            placeholder="Min"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">m</span>
                        </div>
                        <span className="text-slate-500">:</span>
                        <div className="relative flex-1">
                          <input 
                            type="number" 
                            min="0"
                            max="59"
                            {...customForm.register(`speeches.${index}.durationSec` as const, { required: true, min: 0, max: 59 })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white text-center focus:ring-1 focus:ring-teal-500 outline-none" 
                            placeholder="Seg"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">s</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={() => append({ title: `Discurso ${fields.length + 1}`, durationMin: 5, durationSec: 0 })} className="w-full mt-2 bg-slate-600 hover:bg-slate-500 transition-all duration-300 rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Agregar Discurso
              </button>

              <button type="submit" className="w-full mt-4 bg-teal-600 hover:bg-teal-500 transition-all duration-300 rounded-lg py-3 text-lg font-semibold text-white shadow-lg shadow-teal-900/20">
                Iniciar Debate
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};