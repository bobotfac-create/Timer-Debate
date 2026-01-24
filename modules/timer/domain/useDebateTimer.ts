import { useState, useRef, useEffect, useCallback } from 'react';
import { TimerState, Speech, BellSettings, CustomAudioState } from '../../shared/domain/types';
import { initAudioContext, playAudioBuffer, playSynthesizedSound, unlockAudioContext } from '../../shared/infrastructure/audio';

export const useDebateTimer = (
  initialSpeech: Speech | undefined,
  bellSettings: BellSettings,
  customAudio: CustomAudioState
) => {
  const [timerState, setTimerState] = useState<TimerState>('stopped');
  const [currentTime, setCurrentTime] = useState(0);
  const [bellRung, setBellRung] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastRingRef = useRef<number | null>(null);

  // Initialize context helper
  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = initAudioContext();
    }
    unlockAudioContext(audioContextRef.current);
    return audioContextRef.current;
  }, []);

  // Bell Trigger Logic
  const triggerBell = useCallback((times: number) => {
    const ctx = audioContextRef.current || initAudioContext();
    audioContextRef.current = ctx;

    setBellRung(times);
    setTimeout(() => setBellRung(0), 1500);

    const playOne = () => {
      if (bellSettings.sound === 'custom' && customAudio.buffer) {
        playAudioBuffer(ctx, customAudio.buffer);
      } else {
        playSynthesizedSound(ctx, bellSettings.sound);
      }
    };

    let count = 0;
    playOne();
    count++;

    if (times > 1) {
      const intervalId = setInterval(() => {
        if (count >= times) {
          clearInterval(intervalId);
          return;
        }
        playOne();
        count++;
      }, bellSettings.interval);
    }
  }, [bellSettings, customAudio]);

  // Load new speech
  const loadSpeech = useCallback((speech: Speech) => {
    setCurrentTime(speech.duration);
    setTimerState('stopped');
    lastRingRef.current = null;
  }, []);

  // Timer Loop
  useEffect(() => {
    let interval: number;

    if (timerState === 'running' && currentTime > 0) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => prev - 1);
      }, 1000);
    } else if (currentTime <= 0 && timerState === 'running') {
      setTimerState('finished');
      triggerBell(bellSettings.repetitions);
    }

    return () => clearInterval(interval);
  }, [timerState, currentTime, bellSettings.repetitions, triggerBell]);

  // Alarm Monitoring
  useEffect(() => {
    if (timerState !== 'running' || !initialSpeech) return;

    const alarms = initialSpeech.alarmTimes || [];
    
    alarms.forEach(targetRemaining => {
       if (Math.abs(currentTime - targetRemaining) < 0.5 && lastRingRef.current !== targetRemaining) {
           triggerBell(bellSettings.repetitions);
           lastRingRef.current = targetRemaining;
       }
    });

    const isNearAny = alarms.some(t => Math.abs(currentTime - t) < 2);
    if (!isNearAny && lastRingRef.current !== null) {
        lastRingRef.current = null;
    }

  }, [currentTime, timerState, triggerBell, bellSettings.repetitions, initialSpeech]);

  const toggleTimer = () => {
    ensureAudioContext();
    setTimerState(prev => prev === 'running' ? 'paused' : 'running');
  };

  const stopTimer = () => {
    setTimerState('stopped');
    if (initialSpeech) {
      setCurrentTime(initialSpeech.duration);
    }
  };

  return {
    timerState,
    currentTime,
    bellRung,
    toggleTimer,
    stopTimer,
    loadSpeech,
    ensureAudioContext,
    setTimerState
  };
};