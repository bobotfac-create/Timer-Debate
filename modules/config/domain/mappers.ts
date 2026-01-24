import { Speech } from "../../shared/domain/types";

// Helper functions moved from ConfigScreen to Domain Layer
export const getSeconds = (min: number, sec: number) => (Number(min) * 60) + Number(sec);

export const getAlarmTimes = (duration: number, protectedSec: number, skipStart: boolean = false) => {
  const alarms: number[] = [];
  if (!skipStart && duration > protectedSec) {
    alarms.push(duration - protectedSec);
  }
  if (duration > protectedSec) {
    alarms.push(protectedSec);
  }
  return alarms;
};

export const getPrepSpeech = (enabled: boolean, min: number, sec: number, alarmsStr: string): Speech | null => {
  if (!enabled) return null;
  
  const duration = getSeconds(min, sec);
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

export const createWSDCQueue = (data: any): Speech[] => {
    const s1 = getSeconds(data.speech1Min, data.speech1Sec);
    const s2 = getSeconds(data.speech2Min, data.speech2Sec);
    const s3 = getSeconds(data.speech3Min, data.speech3Sec);
    const s4 = getSeconds(data.speech4Min, data.speech4Sec);
    const replyAlarmTime = getSeconds(data.replyAlarmMin, data.replyAlarmSec);

    const createSpeech = (id: string, title: string, duration: number, customAlarms: number[] | null = null): Speech => ({
      id, title, duration, protectedSeconds: data.protectedSeconds,
      alarmTimes: customAlarms ? customAlarms : getAlarmTimes(duration, data.protectedSeconds)
    });

    const queue: Speech[] = [
      createSpeech('1', 'Introducción Gobierno', s1),
      createSpeech('2', 'Introducción Oposición', s1),
      createSpeech('3', 'Argumentación Gobierno', s2),
      createSpeech('4', 'Argumentación Oposición', s2),
      createSpeech('5', 'Contra Gobierno', s3),
      createSpeech('6', 'Contra Oposición', s3),
      createSpeech('7', 'Replica Oposición', s4, [replyAlarmTime]), 
      createSpeech('8', 'Replica Gobierno', s4, [replyAlarmTime]), 
    ];

    const prep = getPrepSpeech(data.prepEnabled, data.prepMin, data.prepSec, data.prepAlarms);
    if (prep) queue.unshift(prep);
    return queue;
};

export const createBPQueue = (data: any): Speech[] => {
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
    return queue;
};

export const createCustomQueue = (data: any): Speech[] => {
    const queue: Speech[] = data.speeches.map((s: any, i: number) => {
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
    return queue;
};