import { Mail, MessageCircle, MapPin } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Separator } from '~/components/ui/separator'

export function meta() {
  return [
    { title: 'Contact Us - Learning Group Tracker' },
    { name: 'description', content: 'Get in touch with the Learning Group Tracker team.' },
  ]
}

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Reach out directly',
    value: 'hello@learningtracker.app',
    href: 'mailto:hello@learningtracker.app',
  },
  {
    icon: MessageCircle,
    title: 'Community',
    description: 'Join our Discord',
    value: 'discord.gg/learningtracker',
    href: 'https://discord.gg/learningtracker',
  },
  {
    icon: MapPin,
    title: 'Location',
    description: 'Fully remote team',
    value: 'Worldwide',
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto w-full container px-4 sm:px-6 md:px-10 py-8 md:py-12 lg:py-16">
      <div className="max-w-3xl mx-auto space-y-12">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact Us</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Have questions, suggestions, or need help getting started? We&apos;d love to hear from
            you.
          </p>
        </section>

        <Separator />

        <section className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Get in Touch</h2>
            <div className="space-y-3">
              {CONTACT_METHODS.map((method) => (
                <Card key={method.title}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <method.icon className="size-5 text-primary" />
                      <div>
                        <CardTitle className="text-sm">{method.title}</CardTitle>
                        <CardDescription>{method.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {method.href ? (
                      <a
                        href={method.href}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {method.value}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{method.value}</span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Send a Message</h2>
            <Card>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Tell us more..." rows={5} />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
