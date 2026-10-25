export function FieldError({ value }: { value?: string }) {
  return value ? <p className="text-sm text-destructive">{value}</p> : null
}
