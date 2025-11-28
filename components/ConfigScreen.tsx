import React from 'react';
import { useForm, useFieldArray, UseFormRegisterReturn, UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { FormatType, Speech } from '../types';
import { ArrowLeft, Trash2, Plus, Clock, BellRing } from 'lucide-react';

interface Props {
  format: FormatType;
  onBack: () => void;
  onStart: (queue: Speech[]) => void;
}

// Interfaces updated to include Prep Time fields
interface CommonFormData {
  prepEnabled: boolean;
  prepMin: number;
  prepSec: number;
  prepAlarms: string; // Comma separated string "1, 5, 8"
}

interface WSDCFormData extends CommonFormData {
  protectedSeconds: number;
  speech1Min: number; speech1Sec: number;
  speech2Min: number; speech2Sec: number;
  speech3Min: number; speech3Sec: number;
  speech4Min: number; speech4Sec: number;
  // Specific alarm for Reply speeches
  replyAlarmMin: number; 
  replyAlarmSec: number;
}

interface BPFormData extends CommonFormData {
  protectedSeconds: number;
  speechMin: number; 
  speechSec: number;
}

interface CustomFormData extends CommonFormData {
  protectedSeconds: number;
  speeches: {
    title: string;
    durationMin: number;
    durationSec: number;
  }[];
}

// Reusable Time Input Component
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

// Reusable Prep Time Section Component
const PrepConfigSection = <T extends FieldValues>({ 
  register, 
  enabled 
}: { 
  register: UseFormRegister<T>, 
  enabled: boolean 
}) => (
  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-4">
    <div className="flex items-center gap-2 mb-3">
      <input 
        type="checkbox" 
        id="prepEnabled"
        {...register("prepEnabled" as Path<T>)} 
        className="w-5 h-5 rounded border-slate-600 text-sky-600 focus:ring-sky-500 bg-slate-700"
      />
      <label htmlFor="prepEnabled" className="text-white font-medium flex items-center gap-2 cursor-pointer">
        <Clock className="w-4 h-4 text-sky-400" />
        Tiempo de Preparación
      </label>
    </div>

    {enabled && (
      <div className="pl-7 space-y-4 animate-in slide-in-from-top-2 duration-200">
        <TimeInput 
          label="Duración"
          minRegister={register("prepMin" as Path<T>, { valueAsNumber: true })}
          secRegister={register("prepSec" as Path<T>, { valueAsNumber: true })}
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Alarmas Intermedias (minutos restantes)
          </label>
          <input 
            type="text" 
            {...register("prepAlarms" as Path<T>)}
            placeholder="Ej: 8, 5, 1" 
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none" 
          />
          <p className="text-xs text-slate-500 mt-1">Separa con comas los minutos donde sonará la alarma (ej: cuando falten 5 min).</p>
        </div>
      </div>
    )}
  </div>
);

export const ConfigScreen: React.FC<Props> = ({ format, onBack, onStart }) => {
  // Hooks for each form type
  const wsdcForm = useForm<WSDCFormData>({
    defaultValues: {
      protectedSeconds: 60,
      speech1Min: 8, speech1Sec: 0,
      speech2Min: 8, speech2Sec: 0,
      speech3Min: 8, speech3Sec: 0,
      speech4Min: 4, speech4Sec: 0,
      prepEnabled: false, prepMin: 15, prepSec: 0, prepAlarms: "",
      replyAlarmMin: 1, replyAlarmSec: 0 // Default alarm at 1 minute remaining
    }
  });

  const bpForm = useForm<BPFormData>({
    defaultValues: {
      protectedSeconds: 60,
      speechMin: 7, speechSec: 0,
      prepEnabled: false, prepMin: 15, prepSec: 0, prepAlarms: ""
    }
  });

  const customForm = useForm<CustomFormData>({
    defaultValues: { 
      protectedSeconds: 60,
      speeches: [{ title: "Discurso 1", durationMin: 5, durationSec: 0 }],
      prepEnabled: false, prepMin: 15, prepSec: 0, prepAlarms: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: customForm.control,
    name: "speeches"
  });

  // Helpers
  const getSeconds = (min: number, sec: number) => (Number(min) * 60) + Number(sec);

  // Helper to generate alarm times (in REMAINING seconds)
  const getAlarmTimes = (duration: number, protectedSec: number, skipStart: boolean = false) => {
    const alarms: number[] = [];
    // Start protected bell (e.g. at 1 min elapsed -> duration - protectedSec remaining)
    if (!skipStart && duration > protectedSec) {
      alarms.push(duration - protectedSec);
    }
    // End protected bell (e.g. at 1 min remaining -> protectedSec remaining)
    if (duration > protectedSec) {
      alarms.push(protectedSec);
    }
    return alarms;
  };

  const getPrepSpeech = (enabled: boolean, min: number, sec: number, alarmsStr: string): Speech | null => {
    if (!enabled) return null;
    
    const duration = getSeconds(min, sec);
    // Parse alarms string "1, 5" -> [60, 300]
    const alarmTimes = alarmsStr
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0)
      .map(min => min * 60);

    return {
      id: 'prep-time',
      title: 'Tiempo de Preparación',
      duration: duration,
      protectedSeconds: 0,
      isPrep: true,
      alarmTimes: alarmTimes
    };
  };

  // Submit Handlers
  const onSubmitWSDC = (data: WSDCFormData) => {
    const s1 = getSeconds(data.speech1Min, data.speech1Sec);
    const s2 = getSeconds(data.speech2Min, data.speech2Sec);
    const s3 = getSeconds(data.speech3Min, data.speech3Sec);
    const s4 = getSeconds(data.speech4Min, data.speech4Sec);
    
    const replyAlarmTime = getSeconds(data.replyAlarmMin, data.replyAlarmSec);

    const createSpeech = (id: string, title: string, duration: number, customAlarms: number[] | null = null): Speech => ({
      id,
      title,
      duration,
      protectedSeconds: data.protectedSeconds,
      // Use specific alarms if provided, otherwise default protected time logic
      alarmTimes: customAlarms ? customAlarms : getAlarmTimes(duration, data.protectedSeconds)
    });

    const queue: Speech[] = [
      createSpeech('1', 'Introducción Gobierno', s1),
      createSpeech('2', 'Introducción Oposición', s1),
      createSpeech('3', 'Argumentación Gobierno', s2),
      createSpeech('4', 'Argumentación Oposición', s2),
      createSpeech('5', 'Contra Gobierno', s3),
      createSpeech('6', 'Contra Oposición', s3),
      // Use the specific reply alarm time configured by user
      createSpeech('7', 'Replica Oposición', s4, [replyAlarmTime]), 
      createSpeech('8', 'Replica Gobierno', s4, [replyAlarmTime]), 
    ];

    const prep = getPrepSpeech(data.prepEnabled, data.prepMin, data.prepSec, data.prepAlarms);
    if (prep) queue.unshift(prep);

    onStart(queue);
  };

  const onSubmitBP = (data: BPFormData) => {
    const duration = getSeconds(data.speechMin, data.speechSec);
    const titles = ["1° Alta Gobierno", "1° Alta oposición", "2° Alta Gobierno", "2° Alta oposición", "1° Baja Gobierno", "1° Baja Oposición", "2° Baja Gobierno", "2° Baja Oposición"];
    
    const queue: Speech[] = titles.map((title, i) => ({
      id: `bp-${i}`,
      title,
      duration: duration,
      protectedSeconds: data.protectedSeconds,
      alarmTimes: getAlarmTimes(duration, data.protectedSeconds, false)
    }));

    const prep = getPrepSpeech(data.prepEnabled, data.prepMin, data.prepSec, data.prepAlarms);
    if (prep) queue.unshift(prep);

    onStart(queue);
  };

  const onSubmitCustom = (data: CustomFormData) => {
    const queue: Speech[] = data.speeches.map((s, i) => {
      const dur = getSeconds(s.durationMin, s.durationSec);
      return {
        id: `custom-${i}-${Date.now()}`,
        title: s.title,
        duration: dur,
        protectedSeconds: data.protectedSeconds,
        alarmTimes: getAlarmTimes(dur, data.protectedSeconds, false)
      };
    });

    const prep = getPrepSpeech(data.prepEnabled, data.prepMin, data.prepSec, data.prepAlarms);
    if (prep) queue.unshift(prep);

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
            <form onSubmit={wsdcForm.handleSubmit(onSubmitWSDC)} className="flex flex-col gap-4 animate-in fade-in duration-300">
              <PrepConfigSection register={wsdcForm.register} enabled={wsdcForm.watch('prepEnabled')} />
              
              <h2 className="text-2xl font-bold text-center text-white mb-4">Configuración WSDC</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Segundos protegidos</label>
                <input type="number" {...wsdcForm.register('protectedSeconds', { required: true, min: 0, valueAsNumber: true })} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
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

              <div className="border-t border-slate-800 my-2 pt-2">
                <TimeInput 
                  label="Discursos de Réplica" 
                  minRegister={wsdcForm.register('speech4Min', { required: true, min: 0 })}
                  secRegister={wsdcForm.register('speech4Sec', { required: true, min: 0, max: 59 })}
                />
                
                <div className="mt-3 p-3 bg-sky-900/20 rounded-lg border border-sky-800/50">
                   <div className="flex items-center gap-2 mb-2 text-sky-400">
                      <BellRing className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Alarma Réplica</h3>
                   </div>
                   <TimeInput 
                      label="Sonar cuando falten:"
                      minRegister={wsdcForm.register('replyAlarmMin', { required: true, min: 0 })}
                      secRegister={wsdcForm.register('replyAlarmSec', { required: true, min: 0, max: 59 })}
                   />
                   <p className="text-[10px] text-slate-400 mt-2 text-center">
                      La campana sonará una única vez cuando quede este tiempo.
                   </p>
                </div>
              </div>
              
              <button type="submit" className="w-full mt-4 bg-sky-600 hover:bg-sky-500 transition-all duration-300 rounded-lg py-3 text-lg font-semibold text-white shadow-lg shadow-sky-900/20">
                Iniciar Debate
              </button>
            </form>
          )}

          {/* BP Form */}
          {format === 'BP' && (
            <form onSubmit={bpForm.handleSubmit(onSubmitBP)} className="flex flex-col gap-4 animate-in fade-in duration-300">
              <PrepConfigSection register={bpForm.register} enabled={bpForm.watch('prepEnabled')} />

              <h2 className="text-2xl font-bold text-center text-white mb-4">Configuración BP</h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Segundos protegidos</label>
                <input type="number" {...bpForm.register('protectedSeconds', { required: true, min: 0, valueAsNumber: true })} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
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
            <form onSubmit={customForm.handleSubmit(onSubmitCustom)} className="flex flex-col gap-4 animate-in fade-in duration-300">
              <PrepConfigSection register={customForm.register} enabled={customForm.watch('prepEnabled')} />

              <h2 className="text-2xl font-bold text-center text-white mb-4">Formato Personalizado</h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Segundos protegidos (Global)</label>
                <input type="number" {...customForm.register('protectedSeconds', { required: true, min: 0, valueAsNumber: true })} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
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