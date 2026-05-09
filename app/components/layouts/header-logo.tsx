import { Link } from 'react-router'

export function HeaderLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-lg">S</span>
      </div>
      <span className="font-bold text-lg hidden sm:inline">Starter App</span>
    </Link>
  )
}
