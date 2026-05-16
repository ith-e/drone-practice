'use client';

interface Props {
  fifth: boolean;
  octave: boolean;
  onFifth: (v: boolean) => void;
  onOctave: (v: boolean) => void;
  stacked?: boolean;
}

function Toggle({ label, sub, checked, onChange }: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'flex-1 flex flex-col items-center justify-center gap-1 py-4 rounded-xl border transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[72px]',
        checked
          ? 'bg-accent border-accent text-white'
          : 'bg-panel border-border text-muted hover:border-accent/50 hover:text-white',
      ].join(' ')}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs opacity-70">{sub}</span>
    </button>
  );
}

export function VoicingToggles({ fifth, octave, onFifth, onOctave, stacked = false }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted tracking-widest uppercase text-center">Voicing</p>
      <div className={`flex gap-2 ${stacked ? 'flex-col' : 'flex-row'}`}>
        <Toggle label="Rich" sub="+7 st" checked={fifth} onChange={onFifth} />
        <Toggle label="Bright" sub="+12 st" checked={octave} onChange={onOctave} />
      </div>
    </div>
  );
}
