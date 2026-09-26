import {
  CtaSection,
  FaqSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  TestimonialsSection,
} from '~/components/landing'

export function meta() {
  return [
    { title: 'Learning Group Tracker - Track Goals Together' },
    {
      name: 'description',
      content:
        'Create learning groups, set daily goals, and track progress with your family, classroom, or club. Free for individuals and small groups.',
    },
  ]
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </div>
  )
}
