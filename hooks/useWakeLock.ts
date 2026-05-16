'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null);
  const [supported] = useState(() => typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  const [active, setActive] = useState(false);

  const acquire = useCallback(async () => {
    if (!supported) return;
    try {
      lockRef.current = await navigator.wakeLock.request('screen');
      setActive(true);
      lockRef.current.addEventListener('release', () => setActive(false));
    } catch {
      // permission denied or page not visible — silent fallback
    }
  }, [supported]);

  const release = useCallback(async () => {
    if (!lockRef.current) return;
    try {
      await lockRef.current.release();
    } catch { /* already released */ }
    lockRef.current = null;
    setActive(false);
  }, []);

  // Re-acquire after tab becomes visible again (lock is auto-released on hide)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && active) acquire();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [active, acquire]);

  return { supported, active, acquire, release };
}
