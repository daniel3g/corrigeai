'use client'

import { Suspense } from 'react'
import LoginContent from './login-content' // vamos extrair o conteúdo para um filho

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
