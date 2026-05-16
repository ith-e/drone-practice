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
  const drone = useDroneEngine();
  const wakeLock = useWakeLock();

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
      drone.setRoot(midi); // smooth glide, no restart
    }
  }, [drone]);

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
    <main className="h-dvh flex flex-col px-3 py-4 gap-3 max-w-md mx-auto overflow-hidden">

      {/* Header */}
      <div className="text-center shrink-0">
        <h1 className="text-xl font-bold tracking-tight">Drone Practice</h1>
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 gap-3 min-h-0">

        {/* Left: note ladder — fills full height */}
        <div className="w-1/2 flex flex-col min-h-0">
          <NoteLadder value={rootMidi} onChange={handleRootChange} />
        </div>

        {/* Right: controls */}
        <div className="w-1/2 flex flex-col gap-3 min-h-0">

          {/* Active voices */}
          <div className="rounded-xl border border-border bg-panel py-2 px-2 shrink-0">
            <VoiceDisplay notes={drone.activeNotes} isPlaying={drone.isPlaying} />
          </div>

          {/* Play / stop */}
          <div className="shrink-0">
            <PlayButton
              isPlaying={drone.isPlaying}
              wakeLockSupported={wakeLock.supported}
              wakeLockActive={wakeLock.active}
              onToggle={handleToggle}
            />
          </div>

          {/* Voicing toggles — stacked vertically */}
          <div className="shrink-0">
            <VoicingToggles
              fifth={fifth}
              octave={octave}
              onFifth={handleFifth}
              onOctave={handleOctave}
              stacked
            />
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-panel px-3 py-3 shrink-0">
            <VolumeSlider value={volume} onChange={handleVolume} />
            <DetuneSlider value={detune} onChange={handleDetune} />
          </div>

        </div>
      </div>

    </main>
  );
}
