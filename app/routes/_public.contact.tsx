import { ContactPageContent } from '~/features/page/components/contact'
import * as m from '~/paraglide/messages.js'

export function meta() {
  return [
    { title: m.contact_meta_title() },
    { name: 'description', content: m.contact_meta_description() },
  ]
}

export default function ContactPage() {
  return <ContactPageContent />
}
