import { StarIcon } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/card'

const testimonials = [
  {
    quote:
      'My kids actually ask to log their reading now. The streak tracking and visual progress bars make it feel like a game rather than a chore.',
    name: 'Sarah Chen',
    role: 'Parent of three',
  },
  {
    quote:
      'As a piano teacher, I use the sharing feature to see my students practice logs between lessons. The read-only access is exactly what I needed.',
    name: 'Marcus Williams',
    role: 'Music Teacher',
  },
  {
    quote:
      'Our homeschool co-op uses this for everything — reading, math facts, even PE minutes. Having all the kids in one group keeps everyone accountable.',
    name: 'The Rivera Family',
    role: 'Homeschool Co-op',
  },
  {
    quote:
      'I track my language learning goals and share them with my tutor. The daily logging keeps me honest, and the streaks are incredibly motivating.',
    name: 'James Park',
    role: 'Language Learner',
  },
]

export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 py-20 border-t">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Loved by families and educators
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how groups use the tracker to stay motivated and reach their goals together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-0.5" role="img" aria-label="5 out of 5 stars">
                  <StarIcon className="size-4 fill-primary text-primary" />
                  <StarIcon className="size-4 fill-primary text-primary" />
                  <StarIcon className="size-4 fill-primary text-primary" />
                  <StarIcon className="size-4 fill-primary text-primary" />
                  <StarIcon className="size-4 fill-primary text-primary" />
                </div>
                <blockquote className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="pt-2 border-t">
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
