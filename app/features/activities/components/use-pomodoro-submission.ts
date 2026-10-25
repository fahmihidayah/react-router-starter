import { useEffect, useRef } from 'react'
import { useNavigation } from 'react-router'

type ActionErrors = Record<string, string[] | undefined>

export function usePomodoroSubmission({
  active,
  intent,
  errors,
  onSuccess,
}: {
  active: boolean
  intent: string
  errors?: ActionErrors
  onSuccess: () => void
}) {
  const navigation = useNavigation()
  const submittedRef = useRef(false)
  const isSubmitting =
    active &&
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === intent &&
    navigation.formData?.get('entryMode') === 'pomodoro'

  useEffect(() => {
    if (!active) {
      submittedRef.current = false
      return
    }

    if (isSubmitting) submittedRef.current = true

    if (navigation.state === 'idle' && submittedRef.current) {
      submittedRef.current = false
      if (!errors) onSuccess()
    }
  }, [active, errors, isSubmitting, navigation.state, onSuccess])

  return { isSubmitting }
}
