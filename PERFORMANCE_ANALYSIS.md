# Performance Analysis: Inefficient Timer Interval Recreation

## Identified Inefficiency
In `modules/timer/domain/useDebateTimer.ts`, the "Timer Loop" `useEffect` hook includes `currentTime` in its dependency array.

```typescript
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
```

Since `setCurrentTime((prev) => prev - 1)` is called every second, `currentTime` changes every second. This causes the effect to re-run, clearing the old interval and creating a new one every second.

## Optimization Strategy
1. **Remove `currentTime` from dependencies**: By using functional state updates (`setCurrentTime(prev => ...)`), we can avoid needing the current value of `currentTime` in the effect's dependencies.
2. **Relocate finishing logic**: The logic that checks if the timer has reached zero (`currentTime <= 0`) needs to be moved out of the interval setup effect to ensure it still triggers correctly when `currentTime` reaches zero, without forcing the interval to be re-created every second.
3. **Consolidate triggers**: Moving the finishing logic to the existing "Alarm Monitoring" effect (which already depends on `currentTime`) ensures that we still react to the timer reaching zero efficiently.

## Impact
- **Reduced Overhead**: Avoids unnecessary `clearInterval` and `setInterval` calls every second.
- **Improved Accuracy**: Reduces potential drift caused by the constant teardown and setup of the interval.
- **Cleaner Component Lifecycle**: The interval effect now only reacts to major state changes (started/paused/stopped) rather than every tick.

## Benchmarking Note
Direct benchmarking in this environment is impractical due to:
1. Lack of an automated test suite (Jest/Vitest).
2. Build environment limitations (missing binaries/network access for `npm install`).
3. The overhead of interval recreation is relatively small in terms of CPU but represents a significant "React anti-pattern" that causes unnecessary churn.
