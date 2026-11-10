import { useI18n } from '../lib/i18n'

// Controlled component: it holds no state of its own.
// The parent passes the current `value` and an `onChange` function to call with the new value.
export function TravelerStepper({ value, onChange, min = 1, max = 10 }) {
  const { t } = useI18n()

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t('stepper.remove')}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-line disabled:cursor-default disabled:opacity-30"
      >
        −
      </button>
      <span className="w-8 text-center text-sm" aria-live="polite" aria-label={t('stepper.value', { count: value })}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={t('stepper.add')}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-line disabled:cursor-default disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}
