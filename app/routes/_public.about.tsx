import { AboutPageContent } from '~/features/page/components/about'
import * as m from '~/paraglide/messages.js'

export function meta() {
  return [
    { title: m.about_meta_title() },
    { name: 'description', content: m.about_meta_description() },
  ]
}

export default function AboutPage() {
  return <AboutPageContent />
}
