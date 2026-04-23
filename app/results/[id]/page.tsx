"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ResultsScreen from "@/components/skin-analysis/results-screen"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { SkinData } from "@/app/page"
import { getStoredScanById } from "@/lib/scan-storage"
import { useI18n } from "@/lib/i18n"

export default function ScanResultPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { t } = useI18n()
  const [skinData, setSkinData] = useState<SkinData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const scanId = params?.id
    if (!scanId) {
      setIsLoaded(true)
      return
    }

    const scan = getStoredScanById(scanId)
    setSkinData(scan?.skinData ?? null)
    setIsLoaded(true)
  }, [params?.id])

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />
  }

  if (!skinData) {
    return (
      <main className="min-h-screen bg-background px-6 py-20">
        <Card className="mx-auto max-w-md rounded-2xl p-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">{t('history.notFoundTitle')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('history.notFoundSubtitle')}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.push("/results")}>
              {t('history.viewHistory')}
            </Button>
            <Button onClick={() => router.push("/")}>{t('nav.home')}</Button>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <ResultsScreen
      skinData={skinData}
      onGoHome={() => router.push("/")}
      onViewHistory={() => router.push("/results")}
      onRestart={() => router.push("/")}
    />
  )
}
