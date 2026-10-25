import { redirect } from 'react-router'

export async function loader() {
  return redirect('/account/settings')
}

export default function AccountIndex() {
  return null
}
