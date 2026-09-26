import { Users, Target, Zap, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'

export function meta() {
  return [
    { title: 'About - Learning Group Tracker' },
    { name: 'description', content: 'Learn more about Learning Group Tracker and our mission.' },
  ]
}

const VALUES = [
  {
    icon: Users,
    title: 'Community First',
    description: 'We believe learning is better together. Our platform connects families, classrooms, and clubs.',
  },
  {
    icon: Target,
    title: 'Goal-Oriented',
    description: 'Track measurable progress with clear goals and daily targets that keep everyone accountable.',
  },
  {
    icon: Zap,
    title: 'Simple & Fast',
    description: 'No complexity. Set goals in seconds and log progress with a single click.',
  },
  {
    icon: Shield,
    title: 'Privacy Focused',
    description: 'You control what you share. Goals are private by default and shared only when you choose.',
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto w-full container px-4 sm:px-6 md:px-10 py-8 md:py-12 lg:py-16">
      <div className="max-w-3xl mx-auto space-y-12">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About Us</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Learning Group Tracker helps families, classrooms, and clubs track goals and progress
            together. Whether you are managing a child&apos;s reading practice, a classroom fitness
            challenge, or a club project milestone, our platform keeps everyone aligned and motivated.
          </p>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe that accountability transforms intention into achievement. By making it easy
            to set goals, log daily progress, and share wins with the people who matter, we help
            groups turn &quot;we should&quot; into &quot;we did.&quot;
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">What We Stand For</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((value) => (
              <Card key={value.title}>
                <CardHeader className="pb-2">
                  <value.icon className="size-6 text-primary mb-1" />
                  <CardTitle className="text-base">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
