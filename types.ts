export type ScreenType = 'format' | 'config' | 'timer' | 'options';
export type FormatType = 'WSDC' | 'BP' | 'Custom' | null;
export type TimerState = 'stopped' | 'running' | 'paused' | 'finished';
export type SoundType = 'real-bell' | 'digital' | 'grave' | 'custom' | 'yerko';

export interface Speech {
  id: string;
  title: string;
  duration: number; // in seconds
  protectedSeconds: number; // in seconds (for start and end)
  isPrep?: boolean; // Is this a preparation time block?
  alarmTimes?: number[]; // Specific elapsed seconds to ring the bell (for prep time)
}

export interface BellSettings {
  sound: SoundType;
  repetitions: number;
  interval: number; // ms between repetitions
}

export interface CustomAudioState {
  buffer: AudioBuffer | null;
  fileName: string | null;
}

export interface DebateConfigFormData {
  speeches: {
    title: string;
    durationMinutes: number;
    protectedMinutes: number;
  }[];
}