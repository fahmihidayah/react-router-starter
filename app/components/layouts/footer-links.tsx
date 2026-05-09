import { Link } from 'react-router'
import { FooterNewsletter } from './footer-newsletter'

const footerLinks = [
  {
    category: 'Product',
    links: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Documentation', href: '#' },
    ],
  },
  {
    category: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    category: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
]

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
      {footerLinks.map((section) => (
        <div key={section.category}>
          <h3 className="font-semibold text-sm mb-4">{section.category}</h3>
          <ul className="space-y-2">
            {section.links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="col-span-2 md:col-span-1">
        <FooterNewsletter />
      </div>
    </div>
  )
}
