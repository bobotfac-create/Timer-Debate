import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScreenType, FormatType, TimerState, Speech, BellSettings, CustomAudioState } from './types';
import { FormatSelectionScreen } from './components/FormatSelectionScreen';
import { ConfigScreen } from './components/ConfigScreen';
import { TimerScreen } from './components/TimerScreen';
import { OptionsScreen } from './components/OptionsScreen';
import { initAudioContext, playSynthesizedSound, playAudioBuffer, unlockAudioContext } from './utils/audioUtils';

const App: React.FC = () => {
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
  
  // Audio Buffers
  const [yerkoRawBuffer, setYerkoRawBuffer] = useState<ArrayBuffer | null>(null);
  const [yerkoDecodedBuffer, setYerkoDecodedBuffer] = useState<AudioBuffer | null>(null);
  
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

  // Helper to activate audio system and decode pending buffers
  const activateAudioSystem = () => {
    const ctx = ensureAudioContext();
    
    // Decode Yerko if we have raw data but haven't decoded it yet
    if (yerkoRawBuffer && !yerkoDecodedBuffer) {
      // Clone the buffer because decodeAudioData might detach it
      const bufferClone = yerkoRawBuffer.slice(0);
      ctx.decodeAudioData(bufferClone)
        .then(decoded => {
          console.log("Yerko audio decoded successfully");
          setYerkoDecodedBuffer(decoded);
        })
        .catch(err => console.error("Error decoding Yerko audio:", err));
    }
  };

  // 1. Fetch the audio file as ArrayBuffer on mount (Don't decode yet)
  useEffect(() => {
    const fetchYerkoSound = async () => {
      try {
        const response = await fetch('/assets/AudioT.mp3');
        if (!response.ok) {
           console.warn("AudioT.mp3 not found at /assets/AudioT.mp3");
           return;
        }
        const arrayBuffer = await response.arrayBuffer();
        setYerkoRawBuffer(arrayBuffer);
        console.log("AudioT.mp3 loaded into memory");
      } catch (error) {
        console.error("Could not load AudioT.mp3 raw data", error);
      }
    };
    fetchYerkoSound();
  }, []);

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
      } else if (bellSettings.sound === 'yerko' && yerkoDecodedBuffer) {
        playAudioBuffer(ctx, yerkoDecodedBuffer);
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
  }, [bellSettings, customAudio, yerkoDecodedBuffer]);

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

    // Time elapsed = totalDuration - currentTime
    const elapsed = totalDuration - currentTime;
    const currentSpeech = speechQueue[currentSpeechIndex];

    // Special Logic for Prep Time (specific alarm times based on REMAINING time)
    if (currentSpeech && currentSpeech.isPrep && currentSpeech.alarmTimes) {
      currentSpeech.alarmTimes.forEach(remainingSecondsTarget => {
         // Check if current time (remaining) matches target
         if (Math.abs(currentTime - remainingSecondsTarget) < 0.5 && lastRingRef.current !== remainingSecondsTarget) {
             triggerBell(bellSettings.repetitions);
             lastRingRef.current = remainingSecondsTarget;
         }
      });
      // Clear ref if we are far from current alarm
      if (lastRingRef.current !== null && Math.abs(currentTime - lastRingRef.current) > 2) {
        lastRingRef.current = null;
      }
      return; // Skip standard logic for prep time
    }
    
    // Standard Debate Logic (Protected Minutes)
    // 1. End of initial protected time (e.g. 1st minute passed)
    if (Math.abs(elapsed - protectedSeconds) < 0.5 && lastRingRef.current !== protectedSeconds) {
       triggerBell(bellSettings.repetitions);
       lastRingRef.current = protectedSeconds;
    }
    
    // 2. Start of final protected time (e.g. 1 minute remaining)
    if (Math.abs(currentTime - protectedSeconds) < 0.5 && lastRingRef.current !== currentTime) {
       triggerBell(bellSettings.repetitions);
       lastRingRef.current = currentTime;
    }

    // Reset ref if we move away from checkpoints
    if (Math.abs(elapsed - protectedSeconds) > 2 && Math.abs(currentTime - protectedSeconds) > 2) {
       lastRingRef.current = null;
    }

  }, [currentTime, totalDuration, protectedSeconds, timerState, triggerBell, bellSettings.repetitions, speechQueue, currentSpeechIndex]);


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
    <div className="h-screen w-full bg-slate-900 text-slate-100 overflow-hidden">
      {screen === 'format' && (
        <FormatSelectionScreen 
          onSelectFormat={handleSelectFormat} 
          onOpenOptions={handleOpenOptions} 
        />
      )}

      {screen === 'config' && format && (
        <ConfigScreen 
          format={format} 
          onBack={() => setScreen('format')} 
          onStart={handleStartDebate} 
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
          yerkoBuffer={yerkoDecodedBuffer}
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
        />
      )}
    </div>
  );
};

export default App;