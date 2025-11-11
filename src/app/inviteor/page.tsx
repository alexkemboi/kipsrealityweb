import { redirect } from 'next/navigation'

export default function InviteOrRedirect({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  // Build query string from searchParams and forward to /invite/accept
  const params = new URLSearchParams()

  for (const key of Object.keys(searchParams || {})) {
    const val = searchParams[key]
    if (Array.isArray(val)) {
      val.forEach((v) => params.append(key, v))
    } else if (typeof val === 'string') {
      params.append(key, val)
    }
  }

  const query = params.toString()
  const target = query ? `/invite/accept?${query}` : '/invite/accept'

  redirect(target)
}
