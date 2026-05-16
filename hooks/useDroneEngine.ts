'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DroneEngine } from '@/lib/DroneEngine';
import type { ActiveNote, DroneOptions } from '@/types/drone';

export function useDroneEngine() {
  const engineRef = useRef<DroneEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);

  function engine(): DroneEngine {
    if (!engineRef.current) engineRef.current = new DroneEngine();
    return engineRef.current;
  }

  useEffect(() => {
    return () => { engineRef.current?.dispose(); };
  }, []);

  const start = useCallback(async (rootMidi: number, options: DroneOptions) => {
    await engine().start(rootMidi, options);
    setIsPlaying(true);
    setActiveNotes(engine().activeNotes);
  }, []);

  const stop = useCallback(async () => {
    await engine().stop();
    setIsPlaying(false);
    setActiveNotes([]);
  }, []);

  const setVolume = useCallback((v: number) => {
    engine().setVolume(v);
  }, []);

  const setFifth = useCallback((enabled: boolean) => {
    engine().setFifth(enabled);
    setActiveNotes(engine().activeNotes);
  }, []);

  const setOctaveDouble = useCallback((enabled: boolean) => {
    engine().setOctaveDouble(enabled);
    setActiveNotes(engine().activeNotes);
  }, []);

  const setDetune = useCallback((cents: number) => {
    engine().setDetune(cents);
  }, []);

  const setRoot = useCallback((midi: number) => {
    engine().setRoot(midi);
    setActiveNotes(engine().activeNotes);
  }, []);

  return { isPlaying, activeNotes, start, stop, setVolume, setFifth, setOctaveDouble, setDetune, setRoot };
}
