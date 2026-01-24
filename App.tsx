import React, { useState, useEffect } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { ScreenType, FormatType, Speech, BellSettings, CustomAudioState } from './modules/shared/domain/types';

import { AuthProvider, useAuth } from './modules/auth/context/AuthContext';
import { AuthScreen } from './modules/auth/ui/AuthScreen';
import { FormatSelectionScreen } from './modules/format/ui/FormatSelectionScreen';
import { ConfigScreen } from './modules/config/ui/ConfigScreen';
import { TimerScreen } from './modules/timer/ui/TimerScreen';
import { OptionsScreen } from './modules/options/ui/OptionsScreen';
import { MotionGeneratorScreen } from './modules/generator/ui/MotionGeneratorScreen';
import { EncyclopediaScreen } from './modules/encyclopedia/ui/EncyclopediaScreen';
import { TournamentsScreen } from './modules/tournaments/ui/TournamentsScreen';
import { useDebateTimer } from './modules/timer/domain/useDebateTimer';

// Helper to safely get env vars without crashing
const getEnvVar = (key: string, viteKey: string, fallback: string) => {
  try {
    // Try Vite (import.meta.env)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
      // @ts-ignore
      return import.meta.env[viteKey];
    }
  } catch (e) {}

  try {
    // Try Node/Webpack (process.env)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      const val = process.env[viteKey] || process.env[key];
      if (val) return val;
    }
  } catch (e) {}

  return fallback;
};

// Configuración de la clave con fallback directo para evitar bloqueos en entornos de preview
const PUBLISHABLE_KEY = getEnvVar(
  'CLERK_PUBLISHABLE_KEY', 
  'VITE_CLERK_PUBLISHABLE_KEY', 
  'pk_test_Y2hhcm1lZC1zcXVpcnJlbC05LmNsZXJrLmFjY291bnRzLmRldiQ'
);

const AppContent: React.FC = () => {
  const { user, isPro, isLoading, signOut } = useAuth();

  // Navigation State
  const [screen, setScreen] = useState<ScreenType>('auth');
  const [format, setFormat] = useState<FormatType>(null);

  // Timer Data State
  const [speechQueue, setSpeechQueue] = useState<Speech[]>([]);
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(0);

  // Audio State
  const [bellSettings, setBellSettings] = useState<BellSettings>({
    sound: 'real-bell',
    repetitions: 1,
    interval: 600,
  });
  const [customAudio, setCustomAudio] = useState<CustomAudioState>({ buffer: null, fileName: null });

  // Use Domain Hook for Timer Logic
  const {
    timerState,
    currentTime,
    bellRung,
    toggleTimer,
    stopTimer,
    loadSpeech,
    ensureAudioContext
  } = useDebateTimer(
    speechQueue[currentSpeechIndex], 
    bellSettings, 
    customAudio
  );

  // Routing Effect
  useEffect(() => {
    if (!isLoading) {
        if (!user) {
            setScreen('auth');
        } else if (screen === 'auth') {
            setScreen('format');
        }
    }
  }, [user, isLoading, screen]);

  // Navigation Handlers
  const handleSelectFormat = (fmt: FormatType) => {
    ensureAudioContext();
    setFormat(fmt);
    setScreen('config');
  };

  const handleOpenOptions = () => {
    ensureAudioContext();
    setScreen('options');
  };

  const handleStartDebate = (queue: Speech[]) => {
    setSpeechQueue(queue);
    setCurrentSpeechIndex(0);
    loadSpeech(queue[0]);
    setScreen('timer');
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
  
  const handleLogout = () => {
      stopTimer();
      signOut();
  }

  if (isLoading) {
      return (
          <div className="h-[100dvh] w-full bg-slate-900 flex items-center justify-center text-slate-400">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
                <p>Cargando sesión...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="h-[100dvh] w-full bg-slate-900 text-slate-100 overflow-hidden font-sans selection:bg-sky-500/30">
      
      {screen === 'auth' && (
          <AuthScreen />
      )}

      {screen === 'format' && user && (
        <FormatSelectionScreen 
          onSelectFormat={handleSelectFormat} 
          onOpenOptions={handleOpenOptions}
          onOpenGenerator={() => setScreen('motion-generator')}
          onOpenEncyclopedia={() => setScreen('encyclopedia')}
          onOpenTournaments={() => setScreen('tournaments')}
          isPro={isPro}
          onLogout={handleLogout}
        />
      )}

      {screen === 'config' && format && user && (
        <ConfigScreen 
          format={format} 
          onBack={() => setScreen('format')} 
          onStart={handleStartDebate}
        />
      )}

      {screen === 'options' && user && (
        <OptionsScreen 
          settings={bellSettings}
          onUpdateSettings={setBellSettings}
          onBack={() => setScreen('format')} 
          onLoadCustomAudio={(buf, name) => setCustomAudio({ buffer: buf, fileName: name })}
          customAudioName={customAudio.fileName}
          customAudioBuffer={customAudio.buffer}
        />
      )}

      {screen === 'motion-generator' && user && (
        <MotionGeneratorScreen 
          onBack={() => setScreen('format')}
        />
      )}

      {screen === 'encyclopedia' && user && (
        <EncyclopediaScreen 
          onBack={() => setScreen('format')}
        />
      )}

      {screen === 'tournaments' && user && (
        <TournamentsScreen 
          onBack={() => setScreen('format')}
        />
      )}

      {screen === 'timer' && speechQueue[currentSpeechIndex] && user && (
        <TimerScreen 
          speech={speechQueue[currentSpeechIndex]}
          timerState={timerState}
          currentTime={currentTime}
          totalDuration={speechQueue[currentSpeechIndex].duration}
          protectedSeconds={speechQueue[currentSpeechIndex].protectedSeconds}
          bellRungCount={bellRung}
          onToggleTimer={toggleTimer}
          onStopTimer={stopTimer}
          onNextSpeech={nextSpeech}
          onPrevSpeech={prevSpeech}
          onExit={() => {
            stopTimer();
            setScreen('format');
          }}
          isLastSpeech={currentSpeechIndex >= speechQueue.length - 1}
          isFirstSpeech={currentSpeechIndex === 0}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
    if (!PUBLISHABLE_KEY) {
        return (
            <div className="h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Error de Configuración</h1>
                <p className="text-slate-300">Falta la <code>VITE_CLERK_PUBLISHABLE_KEY</code> en las variables de entorno.</p>
                <p className="text-slate-400 text-sm mt-2">Por favor, verifica tu archivo .env</p>
            </div>
        )
    }

    return (
        <ClerkProvider 
            publishableKey={PUBLISHABLE_KEY}
            appearance={{
                baseTheme: dark,
                variables: { 
                    colorPrimary: '#0ea5e9', // Sky-500
                    colorBackground: '#1e293b', // Slate-800
                    colorText: '#f1f5f9',
                }
            }}
        >
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ClerkProvider>
    );
};

export default App;