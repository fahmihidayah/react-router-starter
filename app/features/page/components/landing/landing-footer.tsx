import { Link } from 'react-router'
import { Brand } from './brand'

const FOOTER_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
] as const

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Brand compact />
          <p className="max-w-sm text-sm text-muted-foreground">
            A production-ready starter for full-stack web applications.
          </p>
        </div>
        <nav className="flex flex-wrap gap-6" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Starter. All rights reserved.
      </div>
    </footer>
  )
}
