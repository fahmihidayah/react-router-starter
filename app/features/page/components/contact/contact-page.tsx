import { Clock3, Mail, MessageCircleMore } from 'lucide-react'
import * as m from '~/paraglide/messages.js'
import { PublicPageHero } from '../shared/public-page-hero'
import { ContactForm } from './contact-form'

export function ContactPageContent() {
  return (
    <div className="bg-background">
      <PublicPageHero
        icon={MessageCircleMore}
        eyebrow={m.contact_eyebrow()}
        title={m.contact_title()}
        description={m.contact_description()}
      />

      <section className="mx-auto grid max-w-[1120px] gap-8 px-5 py-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14 lg:px-8 lg:py-20">
        <aside className="rounded-2xl bg-foreground p-7 text-background sm:p-8">
          <h2 className="text-2xl font-extrabold">{m.contact_details_title()}</h2>
          <p className="mt-3 text-sm leading-7 text-background/70">
            {m.contact_details_description()}
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/10 text-brand-mint">
                <Mail className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-wide text-background/60">
                  {m.contact_email_label()}
                </p>
                <a
                  href="mailto:hello@example.com"
                  className="mt-1 block break-all text-sm font-semibold hover:underline"
                >
                  hello@example.com
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/10 text-brand-mint">
                <Clock3 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-wide text-background/60">
                  {m.contact_response_title()}
                </p>
                <p className="mt-1 text-sm font-semibold">{m.contact_response_value()}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold text-foreground">{m.contact_form_title()}</h2>
          <p className="mt-3 mb-7 text-sm leading-7 text-muted-foreground">
            {m.contact_form_description()}
          </p>
          <ContactForm />
        </div>
      </section>
    </div>
  )
}
