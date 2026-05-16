'use client';

interface Props {
  isPlaying: boolean;
  wakeLockSupported: boolean;
  wakeLockActive: boolean;
  onToggle: () => void;
}

export function PlayButton({ isPlaying, wakeLockSupported, wakeLockActive, onToggle }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onToggle}
        className={[
          'w-full rounded-2xl text-2xl font-bold tracking-wide transition-all duration-150',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50',
          'min-h-[80px] active:scale-95',
          isPlaying
            ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40'
            : 'bg-accent hover:bg-accent/80 text-white shadow-lg shadow-accent/30',
        ].join(' ')}
        aria-label={isPlaying ? 'Stop drone' : 'Start drone'}
      >
        {isPlaying ? '■  Stop' : '▶  Play'}
      </button>

      {!wakeLockSupported && (
        <p className="text-xs text-muted text-center">
          Screen wake lock not supported — screen may dim while playing.
        </p>
      )}
      {wakeLockSupported && isPlaying && !wakeLockActive && (
        <p className="text-xs text-muted text-center">
          Wake lock inactive — screen may dim.
        </p>
      )}
    </div>
  );
}
