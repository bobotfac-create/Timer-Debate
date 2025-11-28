import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScreenType, FormatType, TimerState, Speech, BellSettings, CustomAudioState, Theme } from './types';
import { FormatSelectionScreen } from './components/FormatSelectionScreen';
import { ConfigScreen } from './components/ConfigScreen';
import { TimerScreen } from './components/TimerScreen';
import { OptionsScreen } from './components/OptionsScreen';
import { MotionGeneratorScreen } from './components/MotionGeneratorScreen';
import { initAudioContext, playSynthesizedSound, playAudioBuffer, unlockAudioContext } from './utils/audioUtils';

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<Theme>('modern');

  // Navigation State
  const [screen, setScreen] = useState<ScreenType>('format');
  const [format, setFormat] = useState<FormatType>(null);

  // Timer Data State
  const [speechQueue, setSpeechQueue] = useState<Speech[]>([]);
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(0);
  
  // Timer Running State
  const [timerState, setTimerState] = useState<TimerState>('stopped');
  const [currentTime, setCurrentTime] = useState(0); // seconds remaining
  const [totalDuration, setTotalDuration] = useState(0);
  const [protectedSeconds, setProtectedSeconds] = useState(0);

  // Audio State
  const [bellSettings, setBellSettings] = useState<BellSettings>({
    sound: 'real-bell',
    repetitions: 4,
    interval: 600,
  });
  const [bellRung, setBellRung] = useState(0);
  const [customAudio, setCustomAudio] = useState<CustomAudioState>({ buffer: null, fileName: null });
  
  const audioContextRef = useRef<AudioContext | null>(null);

  // Helper to ensure AudioContext is ready and UNLOCKED (Crucial for iOS)
  const ensureAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = initAudioContext();
    }
    
    // Unlock iOS audio context on interaction
    unlockAudioContext(audioContextRef.current);

    return audioContextRef.current;
  };

  // Helper to activate audio system (mainly for iOS unlock)
  const activateAudioSystem = () => {
    ensureAudioContext();
  };

  // Sound Player
  const triggerBell = useCallback((times: number) => {
    // Ensure context exists (it should by now)
    const ctx = audioContextRef.current || initAudioContext();
    audioContextRef.current = ctx;

    setBellRung(times);
    
    // Animate visual overlay for 1.5s then hide
    setTimeout(() => setBellRung(0), 1500);

    const playOne = () => {
      if (bellSettings.sound === 'custom' && customAudio.buffer) {
        playAudioBuffer(ctx, customAudio.buffer);
      } else {
        playSynthesizedSound(ctx, bellSettings.sound);
      }
    };

    let count = 0;
    // Play immediately first time
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

  // Logic: Navigation & Setup
  const handleSelectFormat = (fmt: FormatType) => {
    activateAudioSystem();
    setFormat(fmt);
    setScreen('config');
  };

  const handleOpenOptions = () => {
    activateAudioSystem();
    setScreen('options');
  };

  const handleOpenGenerator = () => {
    setScreen('motion-generator');
  };

  const handleStartDebate = (queue: Speech[]) => {
    setSpeechQueue(queue);
    setCurrentSpeechIndex(0);
    loadSpeech(queue[0]);
    setScreen('timer');
    setTimerState('stopped');
  };

  const loadSpeech = (speech: Speech) => {
    setTotalDuration(speech.duration);
    setCurrentTime(speech.duration);
    setProtectedSeconds(speech.protectedSeconds);
    setTimerState('stopped');
  };

  // Logic: Timer Loop
  useEffect(() => {
    let interval: number;

    if (timerState === 'running' && currentTime > 0) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev - 1; 
          return next;
        });
      }, 1000);
    } else if (currentTime <= 0 && timerState === 'running') {
      setTimerState('finished');
      // Trigger end bell using global repetition settings
      triggerBell(bellSettings.repetitions);
    }

    return () => clearInterval(interval);
  }, [timerState, currentTime, bellSettings.repetitions, triggerBell]);

  // Logic: Bell Triggers (Effect monitoring time)
  // We use a ref to prevent double ringing if re-renders happen quickly
  const lastRingRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerState !== 'running') return;

    const currentSpeech = speechQueue[currentSpeechIndex];

    if (currentSpeech) {
      // Unified Alarm Logic using alarmTimes (defined in ConfigScreen for all speeches)
      // alarmTimes contains the REMAINING seconds when the bell should ring
      const alarms = currentSpeech.alarmTimes || [];
      
      alarms.forEach(targetRemaining => {
         // Check if current time (remaining) matches target
         if (Math.abs(currentTime - targetRemaining) < 0.5 && lastRingRef.current !== targetRemaining) {
             triggerBell(bellSettings.repetitions);
             lastRingRef.current = targetRemaining;
         }
      });

      // Reset ref if we move away from any alarm checkpoint
      // This prevents re-ringing if we hover around a time, but allows ringing different alarms
      const isNearAny = alarms.some(t => Math.abs(currentTime - t) < 2);
      if (!isNearAny && lastRingRef.current !== null) {
          lastRingRef.current = null;
      }
    }

  }, [currentTime, timerState, triggerBell, bellSettings.repetitions, speechQueue, currentSpeechIndex]);


  // Logic: Timer Controls
  const toggleTimer = () => {
    ensureAudioContext();
    setTimerState(prev => prev === 'running' ? 'paused' : 'running');
  };

  const nextSpeech = () => {
    if (currentSpeechIndex < speechQueue.length - 1) {
      const nextIndex = currentSpeechIndex + 1;
      setCurrentSpeechIndex(nextIndex);
      loadSpeech(speechQueue[nextIndex]);
    }
  };

  const prevSpeech = () => {
    if (currentSpeechIndex > 0) {
      const prevIndex = currentSpeechIndex - 1;
      setCurrentSpeechIndex(prevIndex);
      loadSpeech(speechQueue[prevIndex]);
    }
  };

  const stopTimer = () => {
    setTimerState('stopped');
    const speech = speechQueue[currentSpeechIndex];
    if (speech) {
      setCurrentTime(speech.duration); // Reset to full
    }
  };

  // Rendering
  return (
    <div className="h-[100dvh] w-full bg-slate-900 text-slate-100 overflow-hidden">
      {screen === 'format' && (
        <FormatSelectionScreen 
          onSelectFormat={handleSelectFormat} 
          onOpenOptions={handleOpenOptions}
          onOpenGenerator={handleOpenGenerator}
          theme={theme}
        />
      )}

      {screen === 'config' && format && (
        <ConfigScreen 
          format={format} 
          onBack={() => setScreen('format')} 
          onStart={handleStartDebate}
          theme={theme}
        />
      )}

      {screen === 'options' && (
        <OptionsScreen 
          settings={bellSettings}
          onUpdateSettings={setBellSettings}
          onBack={() => setScreen('format')} 
          onLoadCustomAudio={(buf, name) => setCustomAudio({ buffer: buf, fileName: name })}
          customAudioName={customAudio.fileName}
          customAudioBuffer={customAudio.buffer}
          theme={theme}
          onSetTheme={setTheme}
        />
      )}

      {screen === 'motion-generator' && (
        <MotionGeneratorScreen 
          onBack={() => setScreen('format')}
          theme={theme}
        />
      )}

      {screen === 'timer' && speechQueue[currentSpeechIndex] && (
        <TimerScreen 
          speech={speechQueue[currentSpeechIndex]}
          timerState={timerState}
          currentTime={currentTime}
          totalDuration={totalDuration}
          protectedSeconds={protectedSeconds}
          bellRungCount={bellRung}
          onToggleTimer={toggleTimer}
          onStopTimer={stopTimer}
          onNextSpeech={nextSpeech}
          onPrevSpeech={prevSpeech}
          onExit={() => {
            setTimerState('stopped');
            setScreen('format');
          }}
          isLastSpeech={currentSpeechIndex >= speechQueue.length - 1}
          isFirstSpeech={currentSpeechIndex === 0}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;