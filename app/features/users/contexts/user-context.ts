import { createContext } from 'react-router'
import type { UserWithRoles } from '~/features/users/types'

export interface UserContextValue {
  user: UserWithRoles | null
}

export const userContext = createContext<UserContextValue>({
  user: null,
})
