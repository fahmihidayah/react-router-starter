import { FileCheck2 } from 'lucide-react'
import * as m from '~/paraglide/messages.js'
import { PublicPageHero } from '../shared/public-page-hero'
import { TermsSection } from './terms-section'

export function TermsPageContent() {
  const sections = [
    { title: m.terms_acceptance_title(), content: m.terms_acceptance_content() },
    { title: m.terms_accounts_title(), content: m.terms_accounts_content() },
    { title: m.terms_use_title(), content: m.terms_use_content() },
    { title: m.terms_content_title(), content: m.terms_content_content() },
    { title: m.terms_service_title(), content: m.terms_service_content() },
    { title: m.terms_termination_title(), content: m.terms_termination_content() },
    { title: m.terms_liability_title(), content: m.terms_liability_content() },
    { title: m.terms_changes_title(), content: m.terms_changes_content() },
  ]

  return (
    <div className="bg-background">
      <PublicPageHero
        icon={FileCheck2}
        eyebrow={m.terms_eyebrow()}
        title={m.terms_title()}
        description={m.terms_description()}
      />

      <div className="mx-auto max-w-[900px] px-5 py-12 lg:px-8 lg:py-20">
        <div className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{m.terms_last_updated_label()}</span>{' '}
          {m.terms_last_updated_date()}
        </div>

        <div className="mt-7">
          {sections.map((section, index) => (
            <TermsSection
              key={section.title}
              number={String(index + 1).padStart(2, '0')}
              {...section}
            />
          ))}
        </div>

        <p className="mt-8 rounded-2xl bg-primary-soft px-6 py-5 text-sm leading-7 text-muted-foreground">
          {m.terms_contact_note()}
        </p>
      </div>
    </div>
  )
}
