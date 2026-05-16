import { AlertCircle } from 'lucide-react'

interface ErrorDisplayProps {
  errors: Record<string, string[] | undefined>
}

export function ErrorDisplay({ errors }: ErrorDisplayProps) {
  const errorMessages = Object.entries(errors)
    .filter(([, messages]) => messages && messages.length > 0)
    .flatMap(([field, messages]) => messages?.map((msg) => `${field}: ${msg}`) || [])

  if (errorMessages.length === 0) {
    return null
  }

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Validation errors</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
            {errorMessages.map((msg, _idx) => (
              <li key={`${msg}`}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
