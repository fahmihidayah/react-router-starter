import {
  AudienceStrip,
  CtaSection,
  FaqSection,
  FeatureShowcaseSection,
  HeroSection,
  HowItWorksSection,
  ProgressStorySection,
} from '~/features/page/components/landing'
import * as m from '~/paraglide/messages.js'

export function meta() {
  return [
    { title: m.landing_meta_title() },
    {
      name: 'description',
      content: m.landing_meta_description(),
    },
  ]
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AudienceStrip />
      <FeatureShowcaseSection />
      <HowItWorksSection />
      <ProgressStorySection />
      <FaqSection />
      <CtaSection />
    </div>
  )
}
