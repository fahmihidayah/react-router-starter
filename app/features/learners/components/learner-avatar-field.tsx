import { Camera, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import * as m from '~/paraglide/messages.js'

interface LearnerAvatarFieldProps {
  currentUrl?: string | null
  error?: string
}

export function LearnerAvatarField({ currentUrl, error }: LearnerAvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const displayedUrl = previewUrl || currentUrl

  const clearSelection = () => {
    if (inputRef.current) inputRef.current.value = ''
    setFile(null)
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <p className="text-sm font-medium">{m.learner_avatar()}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative flex size-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={m.learner_avatar_choose()}
          aria-describedby={error ? 'avatar-error' : 'avatar-description'}
        >
          {displayedUrl ? (
            <img src={displayedUrl} alt="" className="size-full object-cover" />
          ) : (
            <UserRound className="size-11" aria-hidden="true" />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Camera className="size-6" aria-hidden="true" />
          </span>
        </button>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              <Camera />{' '}
              {file || currentUrl ? m.learner_avatar_change() : m.learner_avatar_choose()}
            </Button>
            {file ? (
              <Button type="button" variant="ghost" onClick={clearSelection}>
                <X /> {m.learner_avatar_clear_selection()}
              </Button>
            ) : null}
          </div>
          <p id="avatar-description" className="text-sm text-muted-foreground">
            {m.learner_avatar_description()}
          </p>
          {file ? <p className="text-sm font-medium break-all">{file.name}</p> : null}
        </div>
      </div>

      <input
        ref={inputRef}
        id="avatar"
        name="avatar"
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'avatar-error' : 'avatar-description'}
        className="sr-only"
      />
      {error ? (
        <p id="avatar-error" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
