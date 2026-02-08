import { expect, test, describe, mock, beforeEach } from "bun:test";

// Track all calls to state setters
const mockSetState = mock((_val: any) => {});

const mockUseState = mock((initial: any) => {
  return [initial, mockSetState];
});

const mockUseRef = mock((initial: any) => ({ current: initial }));
const mockUseEffect = mock(() => {});
const mockUseCallback = mock((fn: any) => fn);

// Mock react BEFORE importing anything that might use it
mock.module("react", () => ({
  useState: mockUseState,
  useRef: mockUseRef,
  useEffect: mockUseEffect,
  useCallback: mockUseCallback,
}));

// Mock audio infra
mock.module("../../shared/infrastructure/audio", () => ({
  initAudioContext: mock(() => ({})),
  playAudioBuffer: mock(() => {}),
  playSynthesizedSound: mock(() => {}),
  unlockAudioContext: mock(() => {}),
}));

import { useDebateTimer } from "./useDebateTimer";

describe("useDebateTimer", () => {
  beforeEach(() => {
    mockSetState.mockClear();
    mockUseState.mockClear();
    mockUseRef.mockClear();
    mockUseEffect.mockClear();
    mockUseCallback.mockClear();
  });

  test("stopTimer sets state to stopped and resets time when initialSpeech is provided", () => {
    const initialSpeech = { duration: 420 } as any;
    const bellSettings = { sound: 'digital', repetitions: 1, interval: 1000 } as any;
    const customAudio = {} as any;

    const result = useDebateTimer(initialSpeech, bellSettings, customAudio);

    result.stopTimer();

    // Verify setTimerState('stopped')
    const stoppedCall = mockSetState.mock.calls.find(call => call[0] === 'stopped');
    expect(stoppedCall).toBeDefined();

    // Verify setCurrentTime(initialSpeech.duration)
    const timeCall = mockSetState.mock.calls.find(call => call[0] === 420);
    expect(timeCall).toBeDefined();
  });

  test("stopTimer only sets state to stopped when initialSpeech is undefined", () => {
    const bellSettings = { sound: 'digital', repetitions: 1, interval: 1000 } as any;
    const customAudio = {} as any;

    const result = useDebateTimer(undefined, bellSettings, customAudio);

    result.stopTimer();

    // Verify setTimerState('stopped')
    const stoppedCall = mockSetState.mock.calls.find(call => call[0] === 'stopped');
    expect(stoppedCall).toBeDefined();

    // Verify no other state was changed to a number (currentTime)
    const timeCall = mockSetState.mock.calls.find(call => typeof call[0] === 'number');
    expect(timeCall).toBeUndefined();
  });
});
