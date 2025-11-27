import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScreenType, FormatType, TimerState, Speech, BellSettings, CustomAudioState } from './types';
import { FormatSelectionScreen } from './components/FormatSelectionScreen';
import { ConfigScreen } from './components/ConfigScreen';
import { TimerScreen } from './components/TimerScreen';
import { OptionsScreen } from './components/OptionsScreen';
import { initAudioContext, playSynthesizedSound, playAudioBuffer } from './utils/audioUtils';

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
  const [yerkoBuffer, setYerkoBuffer] = useState<AudioBuffer | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  // Helper to ensure AudioContext is ready
  const ensureAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = initAudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  // Load Yerko Sound on Mount
  useEffect(() => {
    const loadYerkoSound = async () => {
      try {
        const response = await fetch('/AudioT.mp3');
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        // We need a temporary context to decode if the main one isn't ready, 
        // or just use initAudioContext which creates one.
        // However, usually we want to use the main context ref if possible, but it might not be init yet.
        // Let's safe init.
        const ctx = ensureAudioContext();
        const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
        setYerkoBuffer(decodedBuffer);
      } catch (error) {
        console.error("Could not load AudioT.mp3", error);
      }
    };
    loadYerkoSound();
  }, []);

  // Sound Player
  const triggerBell = useCallback((times: number) => {
    const ctx = ensureAudioContext();
    setBellRung(times);
    
    // Animate visual overlay for 1.5s then hide
    setTimeout(() => setBellRung(0), 1500);

    const playOne = () => {
      if (bellSettings.sound === 'custom' && customAudio.buffer) {
        playAudioBuffer(ctx, customAudio.buffer);
      } else if (bellSettings.sound === 'yerko' && yerkoBuffer) {
        playAudioBuffer(ctx, yerkoBuffer);
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
  }, [bellSettings, customAudio, yerkoBuffer]);

  // Logic: Navigation & Setup
  const handleSelectFormat = (fmt: FormatType) => {
    setFormat(fmt);
    setScreen('config');
    ensureAudioContext(); // Initialize context on first interaction
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
    
    // Check points
    // 1. End of initial protected time (e.g. 1st minute passed)
    if (Math.abs(elapsed - protectedSeconds) < 0.5 && lastRingRef.current !== protectedSeconds) {
       // Trigger using global repetition settings
       triggerBell(bellSettings.repetitions);
       lastRingRef.current = protectedSeconds;
    }
    
    // 2. Start of final protected time (e.g. 1 minute remaining)
    // elapsed == totalDuration - protectedSeconds
    // OR currentTime == protectedSeconds
    if (Math.abs(currentTime - protectedSeconds) < 0.5 && lastRingRef.current !== currentTime) {
       // Trigger using global repetition settings
       triggerBell(bellSettings.repetitions);
       lastRingRef.current = currentTime;
    }

    // Reset ref if we move away from checkpoints to allow re-trigger if manually reset/seeked (though seeking isn't implemented)
    if (Math.abs(elapsed - protectedSeconds) > 2 && Math.abs(currentTime - protectedSeconds) > 2) {
       lastRingRef.current = null;
    }

  }, [currentTime, totalDuration, protectedSeconds, timerState, triggerBell, bellSettings.repetitions]);


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
          onOpenOptions={() => setScreen('options')} 
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
          onBack={() => setScreen('format')} // Simple navigation back to home
          onLoadCustomAudio={(buf, name) => setCustomAudio({ buffer: buf, fileName: name })}
          customAudioName={customAudio.fileName}
          customAudioBuffer={customAudio.buffer}
          yerkoBuffer={yerkoBuffer}
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
          onExit={() => {
            setTimerState('stopped');
            setScreen('format');
          }}
          isLastSpeech={currentSpeechIndex >= speechQueue.length - 1}
        />
      )}
    </div>
  );
};

export default App;