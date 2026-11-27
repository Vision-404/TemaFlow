export const dynamic = 'force-dynamic'

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function HomePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user) {
      router.push("/channels")
    }
  }, [user, isLoading, router])

  return (
    <MainLayout>
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </MainLayout>
  )
}
