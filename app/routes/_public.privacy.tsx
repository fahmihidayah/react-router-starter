import { PrivacyPageContent } from '~/features/page/components/privacy'
import * as m from '~/paraglide/messages.js'

export function meta() {
  return [
    { title: m.privacy_meta_title() },
    { name: 'description', content: m.privacy_meta_description() },
  ]
}

export default function PrivacyPage() {
  return <PrivacyPageContent />
}
