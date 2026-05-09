import { FooterLinks } from './footer-links'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-12 mt-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 mb-8">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-lg">Starter App</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Build your next amazing project with our modern starter app.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 mb-8">
          <FooterLinks />
        </div>

        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Starter App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
