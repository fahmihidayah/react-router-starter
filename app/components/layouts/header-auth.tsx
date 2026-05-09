import { Link } from 'react-router'
import { Button } from '~/components/ui/button'

export function HeaderAuth() {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" asChild>
        <Link to="/login">Sign in</Link>
      </Button>
      <Button asChild>
        <Link to="/register">Get Started</Link>
      </Button>
    </div>
  )
}
