import type { UserAdmin } from '../types'

export type AccessibilityProps = {
  user: UserAdmin
}

export type AccessibilityCollection = {
  access: {
    read?: ((props: AccessibilityProps) => boolean) | boolean
    create?: ((props: AccessibilityProps) => boolean) | boolean
    edit?: ((props: AccessibilityProps) => boolean) | boolean
    delete?: ((props: AccessibilityProps) => boolean) | boolean
  }
}
