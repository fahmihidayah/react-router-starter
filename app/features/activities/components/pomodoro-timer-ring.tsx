import { cn } from '~/lib/utils'
import { formatPomodoroTime, pomodoroProgress } from './pomodoro-time'

const RADIUS = 112
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function PomodoroTimerRing({
  durationSeconds,
  remainingSeconds,
  label,
  className,
}: {
  durationSeconds: number
  remainingSeconds: number
  label: string
  className?: string
}) {
  const progress = pomodoroProgress(remainingSeconds, durationSeconds)

  return (
    <div
      role="timer"
      aria-label={`${label}: ${formatPomodoroTime(remainingSeconds)}`}
      className={cn('relative grid size-72 place-items-center sm:size-80', className)}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 256 256"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="128"
          cy="128"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted"
        />
        <circle
          cx="128"
          cy="128"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className="text-primary transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      <div className="relative text-center">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
          {formatPomodoroTime(remainingSeconds)}
        </p>
      </div>
    </div>
  )
}
