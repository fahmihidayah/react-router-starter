import { Shield } from 'lucide-react'
import * as m from '~/paraglide/messages.js'
import { PublicPageHero } from '../shared/public-page-hero'
import { PrivacySection } from './privacy-section'

export function PrivacyPageContent() {
  const sections = [
    { title: m.privacy_information_title(), content: m.privacy_information_content() },
    { title: m.privacy_use_title(), content: m.privacy_use_content() },
    { title: m.privacy_cookies_title(), content: m.privacy_cookies_content() },
    { title: m.privacy_third_party_title(), content: m.privacy_third_party_content() },
    { title: m.privacy_data_security_title(), content: m.privacy_data_security_content() },
    { title: m.privacy_data_retention_title(), content: m.privacy_data_retention_content() },
    { title: m.privacy_your_rights_title(), content: m.privacy_your_rights_content() },
    { title: m.privacy_children_title(), content: m.privacy_children_content() },
    { title: m.privacy_changes_title(), content: m.privacy_changes_content() },
  ]

  return (
    <div className="bg-background">
      <PublicPageHero
        icon={Shield}
        eyebrow={m.privacy_eyebrow()}
        title={m.privacy_title()}
        description={m.privacy_description()}
      />

      <div className="mx-auto max-w-[900px] px-5 py-12 lg:px-8 lg:py-20">
        <div className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{m.privacy_last_updated_label()}</span>{' '}
          {m.privacy_last_updated_date()} •{' '}
          <span className="font-bold text-foreground">{m.privacy_version_label()}</span>{' '}
          {m.privacy_version()}
        </div>

        <div className="mt-7">
          {sections.map((section, index) => (
            <PrivacySection
              key={section.title}
              number={String(index + 1).padStart(2, '0')}
              {...section}
            />
          ))}
        </div>

        <p className="mt-8 rounded-2xl bg-primary-soft px-6 py-5 text-sm leading-7 text-muted-foreground">
          {m.privacy_contact_note()}
        </p>
      </div>
    </div>
  )
}
