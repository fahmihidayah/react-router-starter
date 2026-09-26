import { AlertCircle } from 'lucide-react'
import type { ErrorType, ValidationErrors } from '~/lib/types'

interface ErrorDisplayProps {
  errors: ErrorType
}

export function ErrorDisplay({ errors }: ErrorDisplayProps) {
  const errorMessages = errors

  if (errorMessages.length === 0) {
    return null
  }

  return (
    <div className="rounded-md bg-destructive/10 p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-destructive/60" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-destructive">Validation errors</h3>
          {Array.isArray(errorMessages) && (
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-destructive/80">
              {errorMessages?.map((msg, _idx) => (
                <li key={`${msg}`}>{msg}</li>
              ))}
            </ul>
          )}
          {typeof errorMessages === 'string' && (
            <p className="text-sm text-destructive/80">{errorMessages}</p>
          )}
        </div>
      </div>
    </div>
  )
}
