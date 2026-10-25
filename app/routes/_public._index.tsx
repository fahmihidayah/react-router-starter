import { LandingPage } from '~/features/page/components/landing'

export function meta() {
  return [
    { title: 'Starter — Full-stack starter template' },
    { name: 'description', content: 'A production-ready starter for full-stack web applications.' },
  ]
}

export default function LandingIndexPage() {
  return <LandingPage />
}
