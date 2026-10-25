type Role = {
  key: string
}

export function getPostLoginPath(role: Role | null): '/admin' | '/track-app' {
  return role?.key === 'admin' ? '/admin' : '/track-app'
}
