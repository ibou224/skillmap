import { auth } from '@/lib/auth.js'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return <>{children}</>
}
