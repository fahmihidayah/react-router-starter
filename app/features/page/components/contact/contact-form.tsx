import { Send } from 'lucide-react'
import type { FormEvent } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import * as m from '~/paraglide/messages.js'

const CONTACT_EMAIL = 'hello@learningtracker.app'

export function ContactForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const subject = `${m.contact_email_subject()} — ${String(data.get('name') ?? '')}`
    const body = [
      `${m.contact_name_label()}: ${String(data.get('name') ?? '')}`,
      `${m.contact_email_label()}: ${String(data.get('email') ?? '')}`,
      `${m.contact_phone_label()}: ${String(data.get('phone') ?? '')}`,
      '',
      `${m.contact_comment_label()}:`,
      String(data.get('comment') ?? ''),
    ].join('\n')

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className="text-[#2A3854]">
            {m.contact_name_label()}
          </Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder={m.contact_name_placeholder()}
            required
            className="h-11 border-[#D8DFEA] bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-[#2A3854]">
            {m.contact_email_label()}
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={m.contact_email_placeholder()}
            required
            className="h-11 border-[#D8DFEA] bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone" className="text-[#2A3854]">
          {m.contact_phone_label()}
        </Label>
        <Input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={m.contact_phone_placeholder()}
          className="h-11 border-[#D8DFEA] bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-comment" className="text-[#2A3854]">
          {m.contact_comment_label()}
        </Label>
        <Textarea
          id="contact-comment"
          name="comment"
          placeholder={m.contact_comment_placeholder()}
          rows={6}
          required
          className="resize-y border-[#D8DFEA] bg-white"
        />
      </div>

      <p className="text-xs leading-5 text-[#7A869B]">{m.contact_form_note()}</p>

      <Button
        type="submit"
        className="h-12 w-full bg-[#2F39A9] font-bold hover:bg-[#252E91] sm:w-auto sm:px-7"
      >
        {m.contact_submit()}
        <Send className="size-4" aria-hidden="true" />
      </Button>
    </form>
  )
}
