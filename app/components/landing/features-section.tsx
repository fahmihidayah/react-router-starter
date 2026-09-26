import {
  BabyIcon,
  GoalIcon,
  Share2Icon,
  TrophyIcon,
  UserPlusIcon,
  UsersIcon,
} from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

const features = [
  {
    icon: UsersIcon,
    title: 'Learning Groups',
    description:
      'Create groups for your family, classroom, club, or any circle. Each group has its own members, goals, and progress feed.',
  },
  {
    icon: GoalIcon,
    title: 'Custom Goals',
    description:
      'Define any goal with a target, unit of measure, active days, and date range. From reading pages to piano practice — track it all.',
  },
  {
    icon: BabyIcon,
    title: 'Managed Members',
    description:
      'Add kids or anyone without a login as a managed member. You create their goals and log their progress on their behalf.',
  },
  {
    icon: UserPlusIcon,
    title: 'Goal Sharing',
    description:
      'Share individual goals with teachers, coaches, or family outside your group. They get read-only access without joining.',
  },
  {
    icon: TrophyIcon,
    title: 'Progress & Streaks',
    description:
      'Daily logging builds streaks, shows completion rates, and celebrates milestones. Visual progress keeps everyone motivated.',
  },
  {
    icon: Share2Icon,
    title: 'Opt-in Feed',
    description:
      'Choose which achievements to share to the group feed. Privacy-first — nothing is shared unless you explicitly choose to.',
  },
]

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-20 border-t">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to track progress together
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for groups that learn together. Simple enough for kids, powerful enough for
            teachers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-muted/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
