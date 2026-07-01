import { ArrowRightIcon, CodeIcon, DatabaseIcon, LockIcon, ZapIcon } from 'lucide-react'
import { Link } from 'react-router'
import { LanguageSwitcher } from '~/components/language-switcher'
import { Button } from '~/components/ui/button'
import { m } from '../paraglide/messages'

export function meta() {
  return [
    { title: m.meta_title_home() },
    {
      name: 'description',
      content: m.meta_description_home(),
    },
  ]
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              {m.home_badge()}
            </div>
            <LanguageSwitcher />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {m.home_hero_title_line1()}
            <span className="block text-primary">{m.home_hero_title_line2()}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {m.home_hero_subtitle()}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/posts">
                {m.home_cta_view_posts()}
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/admin">{m.home_cta_go_dashboard()}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              {m.home_features_title()}
            </h2>
            <p className="text-muted-foreground text-lg">{m.home_features_subtitle()}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ZapIcon className="size-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{m.home_feature_fast_title()}</h3>
              <p className="text-sm text-muted-foreground">{m.home_feature_fast_desc()}</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <LockIcon className="size-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{m.home_feature_auth_title()}</h3>
              <p className="text-sm text-muted-foreground">{m.home_feature_auth_desc()}</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <DatabaseIcon className="size-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{m.home_feature_db_title()}</h3>
              <p className="text-sm text-muted-foreground">{m.home_feature_db_desc()}</p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CodeIcon className="size-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{m.home_feature_practices_title()}</h3>
              <p className="text-sm text-muted-foreground">{m.home_feature_practices_desc()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              {m.home_stack_title()}
            </h2>
            <p className="text-muted-foreground text-lg">{m.home_stack_subtitle()}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 space-y-2">
              <h3 className="font-semibold">{m.home_stack_frontend_title()}</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {m.home_stack_frontend_item1()}</li>
                <li>• {m.home_stack_frontend_item2()}</li>
                <li>• {m.home_stack_frontend_item3()}</li>
                <li>• {m.home_stack_frontend_item4()}</li>
                <li>• {m.home_stack_frontend_item5()}</li>
              </ul>
            </div>

            <div className="border rounded-lg p-6 space-y-2">
              <h3 className="font-semibold">{m.home_stack_backend_title()}</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {m.home_stack_backend_item1()}</li>
                <li>• {m.home_stack_backend_item2()}</li>
                <li>• {m.home_stack_backend_item3()}</li>
                <li>• {m.home_stack_backend_item4()}</li>
                <li>• {m.home_stack_backend_item5()}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{m.home_cta_title()}</h2>
          <p className="text-lg text-muted-foreground">{m.home_cta_subtitle()}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/posts">
                {m.home_cta_browse_posts()}
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/admin">{m.home_cta_view_dashboard()}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
