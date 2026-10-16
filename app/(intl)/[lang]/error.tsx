'use client'

import { useParams } from 'next/navigation'
import { ErrorView } from '@/components/error-view'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ lang: string }>()
  return <ErrorView lang={params?.lang ?? 'en'} reset={reset} />
}
