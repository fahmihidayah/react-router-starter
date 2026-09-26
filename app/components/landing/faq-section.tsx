import { cn } from '~/lib/utils'

const faqs = [
  {
    question: 'Is this free to use?',
    answer:
      'Yes. The core features — creating groups, setting goals, logging progress, and sharing — are free for individuals and small groups. We may offer premium features for larger organizations in the future.',
  },
  {
    question: 'What is a managed member?',
    answer:
      'A managed member is someone added to a group without their own login account. This is designed for kids, students, or anyone who cannot or should not manage their own account. A group member (the manager) creates goals and logs progress for them.',
  },
  {
    question: 'Can I share goals with people outside my group?',
    answer:
      'Yes. Goal sharing lets you invite someone — like a teacher, coach, or family member — to view a specific goal. They get read-only access and do not need to join your group.',
  },
  {
    question: 'What kind of goals can I track?',
    answer:
      'Anything with a measurable quantity. Define your own unit label (pages, minutes, reps, lessons, miles), set a target, pick active days, and choose a date range. The tracker is flexible enough for reading, practice, exercise, chores, study hours, and more.',
  },
  {
    question: 'Who can see my progress?',
    answer:
      'Privacy is built in. Progress is only visible to members of your group. You can optionally share specific achievements to the group feed, and invite external viewers to specific goals. Nothing is public by default.',
  },
  {
    question: 'Do I need an account to be a member?',
    answer:
      'You need an account to create and manage groups. But people you invite can be managed members without an account — their progress is logged by someone who does have an account.',
  },
]

export function FaqSection() {
  return (
    <section className="container mx-auto px-4 py-20 border-t bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know before getting started.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border rounded-xl bg-background">
              <summary
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-4 px-6 py-4',
                  'font-medium text-left',
                  'marker:content-none',
                )}
              >
                <span className="pr-8">{faq.question}</span>
                <svg
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
