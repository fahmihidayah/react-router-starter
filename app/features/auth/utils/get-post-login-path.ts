type Role = {
  key: string
}

export function getPostLoginPath(role: Role | null): '/admin' | '/account' {
  return role?.key === 'admin' ? '/admin' : '/account'
}
