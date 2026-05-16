export interface DroneOptions {
  fifth: boolean;
  octave: boolean;
  detune: number; // cents, applied ±½ per oscillator pair
}

export interface ActiveNote {
  midi: number;
  name: string;
  role: 'root' | 'fifth' | 'octave';
}

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const DRONE_MIN_MIDI = 36; // C2
export const DRONE_MAX_MIDI = 60; // C4

export function midiToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return NOTE_NAMES[midi % 12] + octave;
}

export function isSharp(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}
