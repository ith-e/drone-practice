'use client';

import type { ActiveNote } from '@/types/drone';

const ROLE_LABEL: Record<ActiveNote['role'], string> = {
  root:   'Root',
  fifth:  'Rich',
  octave: 'Bright',
};

const ROLE_COLOR: Record<ActiveNote['role'], string> = {
  root:   'bg-accent text-white',
  fifth:  'bg-accent-dim text-white',
  octave: 'bg-border text-muted',
};

interface Props {
  notes: ActiveNote[];
  isPlaying: boolean;
}

export function VoiceDisplay({ notes, isPlaying }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 min-h-[48px]">
      {isPlaying && notes.length > 0 ? (
        notes.map(n => (
          <div
            key={n.role}
            className={`flex flex-col items-center px-4 py-2 rounded-lg ${ROLE_COLOR[n.role]}`}
          >
            <span className="text-lg font-mono font-bold leading-none">{n.name}</span>
            <span className="text-xs opacity-70 mt-0.5">{ROLE_LABEL[n.role]}</span>
          </div>
        ))
      ) : (
        <span className="text-sm text-muted">—</span>
      )}
    </div>
  );
}
