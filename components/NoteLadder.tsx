'use client';

import { useEffect, useRef } from 'react';
import { DRONE_MIN_MIDI, DRONE_MAX_MIDI, midiToName, isSharp } from '@/types/drone';

interface Props {
  value: number; // selected MIDI note
  onChange: (midi: number) => void;
}

// Build list from high (C4) to low (C2) so top of scroll = highest pitch
const NOTES = Array.from(
  { length: DRONE_MAX_MIDI - DRONE_MIN_MIDI + 1 },
  (_, i) => DRONE_MAX_MIDI - i,
);

export function NoteLadder({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll selected note into view on mount
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <p className="text-xs text-muted mb-2 text-center tracking-widest uppercase shrink-0">Root note</p>
      <div
        ref={containerRef}
        className="overflow-y-auto rounded-xl border border-border bg-panel flex-1 min-h-0"
      >
        {NOTES.map(midi => {
          const sharp = isSharp(midi);
          const selected = midi === value;
          const name = midiToName(midi);

          return (
            <button
              key={midi}
              ref={selected ? selectedRef : undefined}
              onClick={() => onChange(midi)}
              className={[
                'w-full flex items-center justify-between px-5 py-3 text-left transition-colors',
                'min-h-[52px] border-b border-border last:border-b-0',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                selected
                  ? 'bg-accent text-white font-semibold'
                  : sharp
                  ? 'bg-surface text-muted hover:bg-border hover:text-white'
                  : 'bg-panel text-white hover:bg-border',
              ].join(' ')}
            >
              <span className="text-lg font-mono">{name}</span>
              {sharp && !selected && (
                <span className="text-xs text-muted">♯</span>
              )}
              {selected && (
                <span className="text-xs opacity-75">selected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
