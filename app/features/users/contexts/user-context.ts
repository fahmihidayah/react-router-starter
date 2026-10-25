import { createContext } from 'react-router'
import type { UserWithRole } from '~/features/users/types'

export interface UserContextValue {
  user: UserWithRole | null
}

export const userContext = createContext<UserContextValue>({
  user: null,
})
