import { useEffect, useRef, useState } from 'react'
import { useNavigation } from 'react-router'

type ActionErrors = Record<string, string[] | undefined>

export function useActionDialog({
  intent,
  errors,
  defaultOpen = false,
}: {
  intent: string
  errors?: ActionErrors
  defaultOpen?: boolean
}) {
  const navigation = useNavigation()
  const [open, setOpen] = useState(defaultOpen)
  const submittedRef = useRef(false)
  const isSubmitting =
    navigation.state === 'submitting' && navigation.formData?.get('intent') === intent

  useEffect(() => {
    if (defaultOpen || errors) setOpen(true)
  }, [defaultOpen, errors])

  useEffect(() => {
    if (isSubmitting) submittedRef.current = true

    if (navigation.state === 'idle' && submittedRef.current) {
      submittedRef.current = false
      if (!errors) setOpen(false)
    }
  }, [errors, isSubmitting, navigation.state])

  return { open, setOpen, isSubmitting }
}
