// Controlled component: it holds no state of its own.
// The parent passes the current `value` and an `onChange` function to call with the new value.
export function TravelerStepper({ value, onChange, min = 1, max = 10 }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Remove a traveler"
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-line disabled:opacity-30"
      >
        −
      </button>
      <span className="w-8 text-center text-sm" aria-live="polite" aria-label={`Travelers: ${value}`}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Add a traveler"
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-line disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}
