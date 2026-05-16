'use client';

interface Props {
  value: number; // cents, 0–20
  onChange: (v: number) => void;
}

export function DetuneSlider({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <p className="text-xs text-muted tracking-widest uppercase">Shimmer</p>
        <span className="text-xs text-muted font-mono">±{(value / 2).toFixed(1)} ¢</span>
      </div>
      <input
        type="range"
        min={0}
        max={20}
        step={0.5}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="slider w-full h-2 rounded-full appearance-none cursor-pointer"
        aria-label="Detune shimmer in cents"
      />
    </div>
  );
}
