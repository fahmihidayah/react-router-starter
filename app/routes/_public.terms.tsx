import { TermsPageContent } from '~/features/page/components/terms'
import * as m from '~/paraglide/messages.js'

export function meta() {
  return [
    { title: m.terms_meta_title() },
    { name: 'description', content: m.terms_meta_description() },
  ]
}

export default function TermsPage() {
  return <TermsPageContent />
}
