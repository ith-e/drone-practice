'use client';

import { useCallback, useState } from 'react';
import { useDroneEngine } from '@/hooks/useDroneEngine';
import { useWakeLock } from '@/hooks/useWakeLock';
import { NoteLadder } from '@/components/NoteLadder';
import { VoicingToggles } from '@/components/VoicingToggles';
import { VolumeSlider } from '@/components/VolumeSlider';
import { DetuneSlider } from '@/components/DetuneSlider';
import { PlayButton } from '@/components/PlayButton';
import { VoiceDisplay } from '@/components/VoiceDisplay';

const DEFAULT_ROOT = 48; // C3

export default function Page() {
  // Drone engine state
  const drone = useDroneEngine();
  const wakeLock = useWakeLock();

  // UI-local controls (source of truth for the next start() call)
  const [rootMidi, setRootMidi] = useState(DEFAULT_ROOT);
  const [fifth, setFifthState] = useState(true);
  const [octave, setOctaveState] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [detune, setDetuneState] = useState(0);

  const handleToggle = useCallback(async () => {
    if (drone.isPlaying) {
      await drone.stop();
      await wakeLock.release();
    } else {
      await drone.start(rootMidi, { fifth, octave, detune });
      await wakeLock.acquire();
    }
  }, [drone, wakeLock, rootMidi, fifth, octave, detune]);

  const handleRootChange = useCallback((midi: number) => {
    setRootMidi(midi);
    if (drone.isPlaying) {
      // Restart with new root — seamless re-attack
      drone.start(midi, { fifth, octave, detune });
    }
  }, [drone, fifth, octave, detune]);

  const handleFifth = useCallback((v: boolean) => {
    setFifthState(v);
    drone.setFifth(v);
  }, [drone]);

  const handleOctave = useCallback((v: boolean) => {
    setOctaveState(v);
    drone.setOctaveDouble(v);
  }, [drone]);

  const handleVolume = useCallback((v: number) => {
    setVolumeState(v);
    drone.setVolume(v);
  }, [drone]);

  const handleDetune = useCallback((v: number) => {
    setDetuneState(v);
    drone.setDetune(v);
  }, [drone]);

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-6 gap-6">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Drone Practice</h1>
        <p className="text-sm text-muted mt-1">Sustain a key while you sing</p>
      </div>

      {/* Active voices display */}
      <div className="rounded-xl border border-border bg-panel py-3 px-4">
        <VoiceDisplay notes={drone.activeNotes} isPlaying={drone.isPlaying} />
      </div>

      {/* Play / stop */}
      <PlayButton
        isPlaying={drone.isPlaying}
        wakeLockSupported={wakeLock.supported}
        wakeLockActive={wakeLock.active}
        onToggle={handleToggle}
      />

      {/* Note ladder */}
      <NoteLadder value={rootMidi} onChange={handleRootChange} />

      {/* Voicing toggles */}
      <VoicingToggles
        fifth={fifth}
        octave={octave}
        onFifth={handleFifth}
        onOctave={handleOctave}
      />

      {/* Sliders */}
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-panel px-5 py-4">
        <VolumeSlider value={volume} onChange={handleVolume} />
        <DetuneSlider value={detune} onChange={handleDetune} />
      </div>

      <footer className="text-center text-xs text-muted pb-2">
        Use headphones for best results
      </footer>

    </main>
  );
}
