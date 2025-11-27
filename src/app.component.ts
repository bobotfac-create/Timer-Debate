import { Component, ChangeDetectionStrategy, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';

interface Speech {
  title: string;
  duration: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AppComponent implements OnDestroy {
  screen = signal<'format' | 'config' | 'timer' | 'options'>('format');
  format = signal<'WSDC' | 'BP' | 'Custom' | null>(null);
  
  wsdcForm: FormGroup;
  bpForm: FormGroup;
  customForm: FormGroup;

  timerState = signal<'stopped' | 'running' | 'paused' | 'finished'>('stopped');
  totalDuration = signal(0);
  currentTime = signal(0); 
  protectedSeconds = signal(0);
  
  speechQueue = signal<Speech[]>([]);
  currentSpeech = signal<Speech | null>(null);

  bellRung = signal(0); 

  // Alarm settings
  bellRepetitions = signal(4);
  bellInterval = signal(600); // ms

  customAudioBuffer = signal<AudioBuffer | null>(null);
  customAudioFileName = signal<string | null>(null);

  bellSounds = [
    { id: 'real-bell', name: 'Campana' },
    { id: 'classic', name: 'Clásico', pitch: 880 },
    { id: 'digital', name: 'Digital', pitch: 1200 },
    { id: 'deep', name: 'Grave', pitch: 440 },
  ];
  selectedBellSound = signal<string>('real-bell');
  private audioContext: AudioContext | null = null;
  private timerInterval: any;

  constructor(private fb: FormBuilder) {
    this.wsdcForm = this.fb.group({
      protectedSeconds: [60, [Validators.required, Validators.min(0)]],
      speech1: [8, [Validators.required, Validators.min(1)]],
      speech2: [8, [Validators.required, Validators.min(1)]],
      speech3: [8, [Validators.required, Validators.min(1)]],
      speech4: [4, [Validators.required, Validators.min(1)]],
    });

    this.bpForm = this.fb.group({
      protectedSeconds: [60, [Validators.required, Validators.min(0)]],
      speechDuration: [7, [Validators.required, Validators.min(1)]],
    });

    this.customForm = this.fb.group({
      protectedSeconds: [60, [Validators.required, Validators.min(0)]],
      speeches: this.fb.array([this.createSpeechFormGroup()], Validators.required)
    });
    
    this.initAudio();

    effect(() => {
      clearInterval(this.timerInterval);
      if (this.timerState() === 'running') {
        this.timerInterval = setInterval(() => this.tick(), 1000);
      }
    });
  }

  private async initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
    }
  }

  createSpeechFormGroup(): FormGroup {
    return this.fb.group({
      title: ['Discurso 1', Validators.required],
      duration: [7, [Validators.required, Validators.min(1)]]
    });
  }

  get speeches() {
    return this.customForm.get('speeches') as FormArray;
  }

  addSpeech() {
    this.speeches.push(this.createSpeechFormGroup());
    const lastSpeech = this.speeches.at(this.speeches.length - 1);
    lastSpeech.get('title')?.setValue(`Discurso ${this.speeches.length}`);
  }

  removeSpeech(index: number) {
    if (this.speeches.length > 1) {
      this.speeches.removeAt(index);
    }
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  selectFormat(f: 'WSDC' | 'BP' | 'Custom') {
    this.format.set(f);
    this.screen.set('config');
  }

  navigateToOptions() {
    this.screen.set('options');
  }

  goBack() {
    this.screen.set('format');
    this.format.set(null);
  }

  startDebate() {
    if (this.format() === 'WSDC') {
      if (this.wsdcForm.invalid) return;
      const values = this.wsdcForm.value;
      this.protectedSeconds.set(values.protectedSeconds);
      const durations = {
        s1: values.speech1 * 60,
        s2: values.speech2 * 60,
        s3: values.speech3 * 60,
        s4: values.speech4 * 60
      };
      this.speechQueue.set([
        { title: 'Primer Discurso Gobierno', duration: durations.s1 },
        { title: 'Primer Discurso Oposición', duration: durations.s1 },
        { title: 'Segundo Discurso Gobierno', duration: durations.s2 },
        { title: 'Segundo Discurso Oposición', duration: durations.s2 },
        { title: 'Tercer Discurso Gobierno', duration: durations.s3 },
        { title: 'Tercer Discurso Oposición', duration: durations.s3 },
        { title: 'Cuarto Discurso Oposición', duration: durations.s4 },
        { title: 'Cuarto Discurso Gobierno', duration: durations.s4 },
      ]);
    } else if (this.format() === 'BP') {
      if (this.bpForm.invalid) return;
      const values = this.bpForm.value;
      this.protectedSeconds.set(values.protectedSeconds);
      const speechDurationSec = values.speechDuration * 60;
      this.speechQueue.set([
        { title: 'Primer orador Alta de Gobierno', duration: speechDurationSec },
        { title: 'Primer orador Alta de Oposición', duration: speechDurationSec },
        { title: 'Segundo orador Alta de Gobierno', duration: speechDurationSec },
        { title: 'Segundo orador Alta de Oposición', duration: speechDurationSec },
        { title: 'Primer orador Baja de Gobierno', duration: speechDurationSec },
        { title: 'Primer orador Baja de Oposición', duration: speechDurationSec },
        { title: 'Segundo orador Baja de Gobierno', duration: speechDurationSec },
        { title: 'Segundo orador Baja de Oposición', duration: speechDurationSec }
      ]);
    } else if (this.format() === 'Custom') {
      if (this.customForm.invalid) return;
      const values = this.customForm.value;
      this.protectedSeconds.set(values.protectedSeconds);
      const customSpeeches = values.speeches.map((s: { title: string; duration: number; }) => ({
        title: s.title,
        duration: s.duration * 60
      }));
      this.speechQueue.set(customSpeeches);
    }
    
    this.screen.set('timer');
    this.nextSpeech();
  }

  nextSpeech() {
    if (this.speechQueue().length === 0) {
      this.resetApp();
      return;
    }
    
    const nextSpeech = this.speechQueue()[0];
    this.currentSpeech.set(nextSpeech);
    this.speechQueue.update(q => q.slice(1));

    this.totalDuration.set(nextSpeech.duration);
    this.currentTime.set(nextSpeech.duration);
    this.timerState.set('running');
  }

  togglePause() {
    if (this.timerState() === 'running') {
      this.timerState.set('paused');
    } else {
      this.timerState.set('running');
    }
  }
  
  tick() {
    const newTime = this.currentTime() - 1;
    this.currentTime.set(newTime);

    const protectedS = this.protectedSeconds();
    const total = this.totalDuration();

    if (newTime === total - protectedS) {
      this.triggerBell();
    } else if (newTime === protectedS) {
      this.triggerBell();
    } else if (newTime <= 0) {
      this.currentTime.set(0);
      this.timerState.set('finished');
      this.triggerBell();
    }
  }

  triggerBell() {
    const repetitions = this.bellRepetitions();
    this.bellRung.set(repetitions);
    this.playSound(this.selectedBellSound(), repetitions);
    setTimeout(() => this.bellRung.set(0), 2000);
  }

  selectBellSound(soundId: string) {
    this.selectedBellSound.set(soundId);
    if (soundId === 'custom' && !this.customAudioBuffer()) {
      return;
    }
    this.playSound(soundId, 1);
  }

  onRepetitionsChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.bellRepetitions.set(Math.max(1, value || 1));
  }

  onIntervalChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.bellInterval.set(Math.max(100, value || 100));
  }

  async handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.audioContext) return;

    this.customAudioFileName.set(file.name);
    this.selectedBellSound.set('custom');
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const arrayBuffer = await file.arrayBuffer();
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.customAudioBuffer.set(audioBuffer);
    } catch (e) {
      console.error("Error decoding audio file", e);
      this.customAudioFileName.set('Error al cargar');
      this.customAudioBuffer.set(null);
    }
  }

  playSound(soundId: string, count: number) {
    if (!this.audioContext) return;
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const intervalSeconds = this.bellInterval() / 1000;

    const playSoundRepeatedly = (playFn: (offset: number) => void) => {
      for (let i = 0; i < count; i++) {
        playFn(i * intervalSeconds);
      }
    };
    
    if (soundId === 'custom' && this.customAudioBuffer()) {
      playSoundRepeatedly(timeOffset => {
        if (!this.audioContext) return;
        const source = this.audioContext.createBufferSource();
        source.buffer = this.customAudioBuffer()!;
        source.connect(this.audioContext.destination);
        source.start(this.audioContext.currentTime + timeOffset);
      });
      return;
    }

    const sound = this.bellSounds.find(s => s.id === soundId);
    if (!sound) return;

    const playBell = (soundDef: any, timeOffset: number) => {
      if (!this.audioContext) return;
      if (soundDef.id === 'real-bell') {
          const now = this.audioContext.currentTime + timeOffset;
          const fundamental = 523.25; // C5
          [0.5, 1, 2.01, 3.0, 4.1].forEach((ratio, i) => {
              const osc = this.audioContext!.createOscillator();
              const gain = this.audioContext!.createGain();
              osc.connect(gain);
              gain.connect(this.audioContext!.destination);
              osc.type = 'sine';
              osc.frequency.value = fundamental * ratio;
              const attackTime = 0.01;
              const decayTime = 1.5 + (i * 0.5);
              gain.gain.setValueAtTime(0, now);
              gain.gain.linearRampToValueAtTime(0.4 / (i + 2), now + attackTime);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);
              osc.start(now);
              osc.stop(now + decayTime + 0.1);
          });
      } else if (soundDef.pitch) {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          osc.type = soundDef.id === 'digital' ? 'square' : 'sine';
          osc.frequency.setValueAtTime(soundDef.pitch, this.audioContext.currentTime);
          const now = this.audioContext.currentTime + timeOffset;
          gain.gain.setValueAtTime(1, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
      }
    };

    playSoundRepeatedly(timeOffset => playBell(sound, timeOffset));
  }

  resetApp() {
    this.timerState.set('stopped');
    this.screen.set('format');
    this.format.set(null);
    this.speechQueue.set([]);
    this.currentTime.set(0);
    this.totalDuration.set(0);
    this.currentSpeech.set(null);
  }
  
  displayTime = computed(() => {
    const time = this.currentTime();
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  progressPercentage = computed(() => {
    if (this.totalDuration() === 0) return 0;
    return ((this.totalDuration() - this.currentTime()) / this.totalDuration()) * 100;
  });

  currentSpeechTitle = computed(() => {
    return this.currentSpeech()?.title || 'Debate Timer';
  });

  timerColorClasses = computed(() => {
    const current = this.currentTime();
    const total = this.totalDuration();
    const protectedS = this.protectedSeconds();

    if (total === 0 || current <= 0) {
      return { text: 'text-green-400', bg: 'bg-green-500' };
    }
    if (current <= protectedS) {
      return { text: 'text-red-400', bg: 'bg-red-500' };
    }
    if (current > total - protectedS) {
      return { text: 'text-sky-400', bg: 'bg-sky-500' };
    }
    if (current <= total / 2) {
      return { text: 'text-yellow-400', bg: 'bg-yellow-500' };
    }
    return { text: 'text-green-400', bg: 'bg-green-500' };
  });
}
