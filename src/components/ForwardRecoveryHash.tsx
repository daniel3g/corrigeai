'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ForwardRecoveryHash() {
  const router = useRouter()
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash || ''
    if (hash.includes('access_token') && hash.includes('type=recovery')) {
      router.replace(`/auth/callback${hash}`)
    }
  }, [router])
  return null
}
