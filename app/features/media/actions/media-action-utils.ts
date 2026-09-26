export type TMediaActionErrors = {
  file?: string[]
  alt?: string[]
  form?: string[]
}

export function getUploadedFile(formData: FormData): File | undefined {
  const value = formData.get('file')
  return value instanceof File && value.size > 0 ? value : undefined
}

export function actionError(error: unknown): { errors: TMediaActionErrors } {
  const message = error instanceof Error ? error.message : 'Unable to save media'
  return { errors: { form: [message] } }
}
