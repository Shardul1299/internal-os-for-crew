// Compact checkbox group for multi-select profile fields (days, hook and format preferences).
// Justification (CLAUDE.md): the Toggle in the closed set is one-per-row; this lays several out in one form row.
export function Checks({ name, options, value }: { name: string; options: { value: string; label: string }[]; value: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2">
      {options.map((o) => (
        <label key={o.value} className="inline-flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" name={name} value={o.value} defaultChecked={value.includes(o.value)} className="accent-[var(--pink)] w-3.5 h-3.5" />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
