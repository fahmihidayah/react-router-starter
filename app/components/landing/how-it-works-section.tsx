import { BarChart3Icon, GoalIcon, UserPlusIcon, UsersIcon } from 'lucide-react'

const steps = [
  {
    icon: UsersIcon,
    step: '01',
    title: 'Create or Join a Group',
    description:
      'Start a new learning group for your family, classroom, or club. Or join an existing one with an invite link.',
  },
  {
    icon: UserPlusIcon,
    step: '02',
    title: 'Add Members',
    description:
      'Invite people with accounts, or create managed members for anyone without a login — like kids or students.',
  },
  {
    icon: GoalIcon,
    step: '03',
    title: 'Set Goals & Daily Plans',
    description:
      'Define what to track, set a target quantity, pick active days, and choose a date range. Customize goals for each member.',
  },
  {
    icon: BarChart3Icon,
    step: '04',
    title: 'Log & Celebrate Progress',
    description:
      'Log daily progress, watch streaks grow, and share achievements to the feed. Visual charts show everyone how far they have come.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="container mx-auto px-4 py-20 border-t bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in under two minutes. No complicated setup required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.step} className="relative flex flex-col items-center text-center">
              <div className="size-16 rounded-2xl bg-background border flex items-center justify-center mb-5 shadow-sm">
                <step.icon className="size-7 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary/60 tracking-widest mb-2">
                {step.step}
              </span>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
