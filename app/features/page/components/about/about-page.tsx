import { Code2, HeartHandshake, Rocket } from 'lucide-react'
import { PublicPageHero } from '../shared/public-page-hero'
import { AboutValueCard } from './about-value-card'

const VALUES = [
  {
    icon: Rocket,
    title: 'Move fast',
    description: 'Start from working, tested foundations instead of an empty scaffold.',
  },
  {
    icon: Code2,
    title: 'Stay flexible',
    description: 'A clear, layered architecture that is easy to extend and adapt.',
  },
  {
    icon: HeartHandshake,
    title: 'Batteries included',
    description: 'Auth, RBAC, caching, jobs, email, and testing are already wired up.',
  },
]

export function AboutPageContent() {
  return (
    <div className="bg-background">
      <PublicPageHero
        icon={Rocket}
        eyebrow="About"
        title="A starter built for real projects"
        description="This template ships the common foundations most web applications need, so you can focus on what makes your product unique."
      />

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-14 sm:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, description }) => (
          <AboutValueCard key={title} icon={Icon} title={title} description={description} />
        ))}
      </section>
    </div>
  )
}
