'use client';

interface Props {
  value: number; // 0–1
  onChange: (v: number) => void;
}

export function VolumeSlider({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <p className="text-xs text-muted tracking-widest uppercase">Volume</p>
        <span className="text-xs text-muted font-mono">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="slider w-full h-2 rounded-full appearance-none cursor-pointer"
        aria-label="Master volume"
      />
    </div>
  );
}
