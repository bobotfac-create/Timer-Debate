import React from 'react';
import { useForm, useFieldArray, UseFormRegisterReturn, UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { FormatType, Speech } from '../../shared/domain/types';
import { ArrowLeft, Trash2, Plus, Clock, BellRing } from 'lucide-react';
import { createBPQueue, createCustomQueue, createWSDCQueue } from '../domain/mappers';

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
  prepAlarms: string;
}

interface WSDCFormData extends CommonFormData {
  protectedSeconds: number;
  speech1Min: number; speech1Sec: number;
  speech2Min: number; speech2Sec: number;
  speech3Min: number; speech3Sec: number;
  speech4Min: number; speech4Sec: number;
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
}) => {
  const labelClass = "text-slate-300";
  const inputClass = "w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-center";
  const textAccent = "text-slate-400";
  const colonAccent = "text-slate-400";

  return (
    <div>
      <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input 
            type="number" 
            min="0"
            {...minRegister} 
            className={inputClass}
            placeholder="0"
          />
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${textAccent}`}>min</span>
        </div>
        <span className={`font-bold ${colonAccent}`}>:</span>
        <div className="relative flex-1">
          <input 
            type="number" 
            min="0"
            max="59"
            {...secRegister} 
            className={inputClass}
            placeholder="00"
          />
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${textAccent}`}>seg</span>
        </div>
      </div>
    </div>
  );
};

// Reusable Prep Time Section Component
const PrepConfigSection = <T extends FieldValues>({ 
  register, 
  enabled
}: { 
  register: UseFormRegister<T>, 
  enabled: boolean
}) => {
  const containerClass = "bg-slate-800/50 border-slate-700";
  const labelClass = "text-white";
  const iconClass = "text-sky-400";
  const inputClass = "w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none";
  const checkboxClass = "border-slate-600 text-sky-600 focus:ring-sky-500 bg-slate-700";

  return (
    <div className={`${containerClass} p-4 rounded-lg border mb-4`}>
      <div className="flex items-center gap-2 mb-3">
        <input 
          type="checkbox" 
          id="prepEnabled"
          {...register("prepEnabled" as Path<T>)} 
          className={`w-5 h-5 rounded focus:ring-2 ${checkboxClass}`}
        />
        <label htmlFor="prepEnabled" className={`${labelClass} font-medium flex items-center gap-2 cursor-pointer`}>
          <Clock className={`w-4 h-4 ${iconClass}`} />
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
            <label className="block text-sm font-medium mb-1 text-slate-300">
              Alarmas Intermedias (minutos restantes)
            </label>
            <input 
              type="text" 
              {...register("prepAlarms" as Path<T>)}
              placeholder="Ej: 8, 5, 1" 
              className={inputClass}
            />
            <p className="text-xs mt-1 text-slate-500">Separa con comas los minutos donde sonará la alarma.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const ConfigScreen: React.FC<Props> = ({ format, onBack, onStart }) => {
  const containerClass = "bg-slate-900 text-slate-100";
  const headerClass = "border-slate-800 bg-slate-900/50";
  const titleClass = "font-semibold text-white";
  const btnBackClass = "text-slate-400 hover:bg-slate-800 hover:text-white";
  const inputClass = "w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none";
  const labelClass = "text-slate-300";
  const primaryBtnClass = "w-full mt-4 bg-sky-600 hover:bg-sky-500 transition-all duration-300 rounded-lg py-3 text-lg font-semibold text-white shadow-lg shadow-sky-900/20";

  // Hooks for each form type
  const wsdcForm = useForm<WSDCFormData>({
    defaultValues: {
      protectedSeconds: 60,
      speech1Min: 8, speech1Sec: 0,
      speech2Min: 8, speech2Sec: 0,
      speech3Min: 8, speech3Sec: 0,
      speech4Min: 4, speech4Sec: 0,
      prepEnabled: false, prepMin: 15, prepSec: 0, prepAlarms: "",
      replyAlarmMin: 1, replyAlarmSec: 0
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

  // Submit Handlers
  const onSubmitWSDC = (data: WSDCFormData) => {
    onStart(createWSDCQueue(data));
  };

  const onSubmitBP = (data: BPFormData) => {
    onStart(createBPQueue(data));
  };

  const onSubmitCustom = (data: CustomFormData) => {
    onStart(createCustomQueue(data));
  };

  return (
    <div className={`flex flex-col h-full ${containerClass}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b backdrop-blur-md sticky top-0 z-10 ${headerClass}`}>
        <button onClick={onBack} className={`p-2 rounded-full transition-colors ${btnBackClass}`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className={`text-xl ${titleClass}`}>
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
              <PrepConfigSection 
                register={wsdcForm.register} 
                enabled={wsdcForm.watch('prepEnabled')} 
              />
              
              <h2 className={`text-2xl font-bold text-center mb-4 ${titleClass}`}>Configuración WSDC</h2>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Segundos protegidos</label>
                <input type="number" {...wsdcForm.register('protectedSeconds', { required: true, min: 0, valueAsNumber: true })} className={inputClass} />
              </div>

              <TimeInput 
                label="Introducción (1er Orador)" 
                minRegister={wsdcForm.register('speech1Min', { required: true, min: 0 })}
                secRegister={wsdcForm.register('speech1Sec', { required: true, min: 0, max: 59 })}
              />

              <TimeInput 
                label="Argumentación (2do Orador)" 
                minRegister={wsdcForm.register('speech2Min', { required: true, min: 0 })}
                secRegister={wsdcForm.register('speech2Sec', { required: true, min: 0, max: 59 })}
              />

              <TimeInput 
                label="Refutación (3er Orador)" 
                minRegister={wsdcForm.register('speech3Min', { required: true, min: 0 })}
                secRegister={wsdcForm.register('speech3Sec', { required: true, min: 0, max: 59 })}
              />

              <div className="border-t my-2 pt-2 border-slate-800">
                <TimeInput 
                  label="Réplica" 
                  minRegister={wsdcForm.register('speech4Min', { required: true, min: 0 })}
                  secRegister={wsdcForm.register('speech4Sec', { required: true, min: 0, max: 59 })}
                />
                
                <div className="mt-3 p-3 rounded-lg border bg-sky-900/20 border-sky-800/50">
                   <div className="flex items-center gap-2 mb-2 text-sky-400">
                      <BellRing className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Alarma Réplica</h3>
                   </div>
                   <TimeInput 
                      label="Sonar cuando falten:"
                      minRegister={wsdcForm.register('replyAlarmMin', { required: true, min: 0 })}
                      secRegister={wsdcForm.register('replyAlarmSec', { required: true, min: 0, max: 59 })}
                   />
                </div>
              </div>
              
              <button type="submit" className={primaryBtnClass}>
                Iniciar Debate
              </button>
            </form>
          )}

          {/* BP Form */}
          {format === 'BP' && (
            <form onSubmit={bpForm.handleSubmit(onSubmitBP)} className="flex flex-col gap-4 animate-in fade-in duration-300">
              <PrepConfigSection 
                register={bpForm.register} 
                enabled={bpForm.watch('prepEnabled')} 
              />

              <h2 className={`text-2xl font-bold text-center mb-4 ${titleClass}`}>Configuración BP</h2>
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Segundos protegidos</label>
                <input type="number" {...bpForm.register('protectedSeconds', { required: true, min: 0, valueAsNumber: true })} className={inputClass} />
              </div>
              
              <TimeInput 
                label="Duración de discursos" 
                minRegister={bpForm.register('speechMin', { required: true, min: 0 })}
                secRegister={bpForm.register('speechSec', { required: true, min: 0, max: 59 })}
              />

              <button type="submit" className={primaryBtnClass}>
                Iniciar Debate
              </button>
            </form>
          )}

          {/* Custom Form */}
          {format === 'Custom' && (
            <form onSubmit={customForm.handleSubmit(onSubmitCustom)} className="flex flex-col gap-4 animate-in fade-in duration-300">
              <PrepConfigSection 
                register={customForm.register} 
                enabled={customForm.watch('prepEnabled')} 
              />

              <h2 className={`text-2xl font-bold text-center mb-4 ${titleClass}`}>Formato Personalizado</h2>
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Segundos protegidos (Global)</label>
                <input type="number" {...customForm.register('protectedSeconds', { required: true, min: 0, valueAsNumber: true })} className={inputClass} />
              </div>

              <div className="border-t my-2 border-slate-600"></div>
              <h3 className="text-lg font-semibold text-center mb-2 text-slate-200">Discursos</h3>
              
              <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col gap-2 p-3 border rounded-lg animate-in slide-in-from-bottom-2 duration-200 bg-slate-800/50 border-slate-700">
                    <div className="flex items-center justify-between gap-2">
                        <input 
                          type="text" 
                          {...customForm.register(`speeches.${index}.title` as const, { required: true })}
                          placeholder="Nombre del discurso" 
                          className="flex-grow text-sm p-2 focus:ring-1 outline-none bg-slate-700 border border-slate-600 text-white focus:ring-teal-500 rounded-md" 
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
                            className="w-full p-2 text-center focus:ring-1 outline-none bg-slate-700 border border-slate-600 text-white focus:ring-teal-500 rounded-md"
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
                            className="w-full p-2 text-center focus:ring-1 outline-none bg-slate-700 border border-slate-600 text-white focus:ring-teal-500 rounded-md"
                            placeholder="Seg"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">s</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={() => append({ title: `Discurso ${fields.length + 1}`, durationMin: 5, durationSec: 0 })} className="w-full mt-2 transition-all duration-300 rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white">
                <Plus className="w-4 h-4" /> Agregar Discurso
              </button>

              <button type="submit" className={primaryBtnClass}>
                 Iniciar Debate
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};