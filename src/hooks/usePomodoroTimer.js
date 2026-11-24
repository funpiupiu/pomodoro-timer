import { useState, useEffect, useRef, useCallback } from 'react';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

export function usePomodoroTimer(settings, onFocusComplete) {
  // mode: 'focus' | 'shortBreak' | 'longBreak'
  const [mode, setMode] = useState('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);

  // Get duration for current mode in seconds
  const getModeDuration = useCallback((m) => {
    switch (m) {
      case 'focus':
        return (settings.focusDuration || 25) * 60;
      case 'shortBreak':
        return (settings.shortBreakDuration || 5) * 60;
      case 'longBreak':
        return (settings.longBreakDuration || 15) * 60;
      default:
        return 25 * 60;
    }
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration]);

  const [timeLeft, setTimeLeft] = useState(() => getModeDuration('focus'));
  const targetEndTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const overtimeStartRef = useRef(null);

  // Sync timeLeft when duration settings change if timer is not running
  useEffect(() => {
    if (!isRunning && !isOvertime) {
      setTimeLeft(getModeDuration(mode));
    }
  }, [mode, settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, getModeDuration, isRunning, isOvertime]);

  // Request browser notification permission if enabled
  useEffect(() => {
    if (settings.notifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.notifications]);

  // Notify user via browser Notification
  const triggerNotification = useCallback((title, body) => {
    if (settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          silent: true,
        });
      } catch (_) {}
    }
  }, [settings.notifications]);

  // Handle normal or flow completion transition
  const finalizeFocusSession = useCallback((extraSeconds = 0) => {
    setIsOvertime(false);
    setOvertimeSeconds(0);
    setIsRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const minutesCompleted = Math.max(1, (settings.focusDuration || 25) + Math.floor(extraSeconds / 60));
    storageService.recordCompletedSession(minutesCompleted);
    if (onFocusComplete) {
      onFocusComplete(minutesCompleted);
    }

    triggerNotification('Focus Session Complete', 'Well done! Time for a peaceful restorative break.');

    // Transition to break
    if (cycleCount >= (settings.longBreakInterval || 4)) {
      setCycleCount(1);
      setMode('longBreak');
      const nextDuration = (settings.longBreakDuration || 15) * 60;
      setTimeLeft(nextDuration);
      if (settings.autoStartBreaks) {
        startTimerWithDuration(nextDuration);
      }
    } else {
      setCycleCount(prev => prev + 1);
      setMode('shortBreak');
      const nextDuration = (settings.shortBreakDuration || 5) * 60;
      setTimeLeft(nextDuration);
      if (settings.autoStartBreaks) {
        startTimerWithDuration(nextDuration);
      }
    }
  }, [settings, cycleCount, onFocusComplete, triggerNotification]);

  // Handle timer completion
  const handleSessionComplete = useCallback(() => {
    // Play serene Tibetan bowl chime
    if (settings.soundEffects) {
      audioService.playZenBell();
    }

    if (mode === 'focus') {
      if (settings.flowMode) {
        // Enter Flow Overtime mode
        setIsOvertime(true);
        overtimeStartRef.current = Date.now();
        triggerNotification('Session Reached', 'Flow Mode active: Take your time to wrap up.');
        return;
      }
      finalizeFocusSession(0);
    } else {
      // Break session finished
      setIsRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      triggerNotification('Break Ended', 'Ready to begin your next mindful focus session?');
      setMode('focus');
      const nextDuration = (settings.focusDuration || 25) * 60;
      setTimeLeft(nextDuration);
      if (settings.autoStartPomodoros) {
        startTimerWithDuration(nextDuration);
      }
    }
  }, [mode, settings, triggerNotification, finalizeFocusSession]);

  const startTimerWithDuration = (duration) => {
    targetEndTimeRef.current = Date.now() + duration * 1000;
    setIsRunning(true);
  };

  // Start / Pause
  const toggleTimer = useCallback(() => {
    if (settings.soundEffects) {
      audioService.playClick();
    }

    if (isOvertime) {
      // Clicking pause/complete in overtime ends the flow session
      finalizeFocusSession(overtimeSeconds);
      return;
    }

    if (isRunning) {
      // Pause
      setIsRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else {
      // Start
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
      audioService.initContext();
    }
  }, [isRunning, timeLeft, isOvertime, overtimeSeconds, finalizeFocusSession, settings.soundEffects]);

  // Reset timer
  const resetTimer = useCallback(() => {
    if (settings.soundEffects) {
      audioService.playClick();
    }
    setIsOvertime(false);
    setOvertimeSeconds(0);
    setIsRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimeLeft(getModeDuration(mode));
  }, [mode, getModeDuration, settings.soundEffects]);

  // Switch mode manually
  const switchMode = useCallback((newMode) => {
    if (settings.soundEffects) {
      audioService.playClick();
    }
    setIsOvertime(false);
    setOvertimeSeconds(0);
    setIsRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setMode(newMode);
    setTimeLeft(getModeDuration(newMode));
  }, [getModeDuration, settings.soundEffects]);

  // Skip to next phase
  const skipToNext = useCallback(() => {
    if (isOvertime) {
      finalizeFocusSession(overtimeSeconds);
    } else {
      handleSessionComplete();
    }
  }, [isOvertime, overtimeSeconds, finalizeFocusSession, handleSessionComplete]);

  // Drift-free interval loop using Date.now()
  useEffect(() => {
    if (!isRunning && !isOvertime) return;

    timerIntervalRef.current = setInterval(() => {
      if (isOvertime) {
        const extra = Math.floor((Date.now() - overtimeStartRef.current) / 1000);
        setOvertimeSeconds(extra);
        return;
      }

      const remainingMs = targetEndTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      if (remainingSec <= 0) {
        setTimeLeft(0);
        handleSessionComplete();
      } else {
        setTimeLeft(remainingSec);
      }
    }, 250);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRunning, isOvertime, handleSessionComplete]);

  // Total duration of active mode
  const totalDuration = getModeDuration(mode);
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  // Format time as mm:ss or +mm:ss if overtime
  let formattedTime;
  if (isOvertime) {
    const oM = Math.floor(overtimeSeconds / 60);
    const oS = overtimeSeconds % 60;
    formattedTime = `+${String(oM).padStart(2, '0')}:${String(oS).padStart(2, '0')}`;
  } else {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Update document title dynamically
  useEffect(() => {
    const modeLabel = isOvertime ? 'Flow' : (mode === 'focus' ? 'Focus' : 'Break');
    document.title = `${formattedTime} — ${modeLabel} | ZenFocus`;
  }, [formattedTime, mode, isOvertime]);

  return {
    mode,
    timeLeft,
    totalDuration,
    progressPercent,
    formattedTime,
    isRunning,
    isOvertime,
    overtimeSeconds,
    cycleCount,
    toggleTimer,
    resetTimer,
    switchMode,
    skipToNext,
    finalizeFlow: () => finalizeFocusSession(overtimeSeconds),
  };
}
