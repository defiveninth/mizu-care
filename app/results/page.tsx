"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { readStoredScans, type StoredScan } from "@/lib/scan-storage"
import { ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function ResultsHistoryPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [scans, setScans] = useState<StoredScan[]>([])

  useEffect(() => {
    const allScans = readStoredScans()
    setScans([...allScans].reverse())
  }, [])

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t('history.title')}</h1>
          <Button variant="outline" onClick={() => router.push("/")}>
            {t('nav.home')}
          </Button>
        </div>

        {scans.length === 0 ? (
          <Card className="rounded-2xl p-6">
            <p className="text-foreground">{t('history.emptyTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('history.emptySubtitle')}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {scans.map((scan, index) => (
              <Link key={scan.id} href={`/results/${scan.id}`}>
                <Card className="rounded-2xl p-4 transition-colors hover:bg-accent/30">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        #{scans.length - index} - {new Date(scan.savedAt).toLocaleString()}
                      </p>
                      <h2 className="text-lg font-semibold text-foreground">{scan.skinData.skinType}</h2>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {scan.skinData.concerns.join(", ")}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-right text-xs text-primary">{t('history.open')}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
