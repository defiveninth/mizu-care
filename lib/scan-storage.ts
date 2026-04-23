"use client"

export type ScanData = {
  image: string | null
  surveyAnswers: Record<string, string>
  skinType: string
  concerns: string[]
  recommendations: string[]
  analysis?: {
    hydration: number
    oiliness: number
    texture: number
    clarity: number
    elasticity: number
  }
  detailedNotes?: string
  recommendedProducts?: Array<{
    id: number
    name: string
    description: string | null
    price: string
    brand: string
    type: string
    image_url: string | null
  }>
}

export type StoredScan = {
  id: string
  skinData: ScanData
  savedAt: string
}

export const LOCAL_SCAN_STORAGE_KEY = "mizucaire.scanHistory"
export const MAX_LOCAL_SCANS = 5

export function hasCompletedResult(data: ScanData): boolean {
  return Boolean(data.skinType && data.concerns.length > 0 && data.recommendations.length > 0)
}

function createScanId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function readStoredScans(): StoredScan[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(LOCAL_SCAN_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as
      | StoredScan[]
      | {
          skinData?: ScanData
          savedAt?: string
        }

    // Backward compatible migration from older single-scan format.
    if (!Array.isArray(parsed)) {
      if (parsed.skinData && hasCompletedResult(parsed.skinData)) {
        return [
          {
            id: createScanId(),
            skinData: parsed.skinData,
            savedAt: parsed.savedAt ?? new Date().toISOString(),
          },
        ]
      }
      return []
    }

    return parsed.filter((entry) => entry?.skinData && hasCompletedResult(entry.skinData) && entry?.id)
  } catch (error) {
    console.error("Failed to read local scan history:", error)
    return []
  }
}

export function saveStoredScans(scans: StoredScan[]) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(LOCAL_SCAN_STORAGE_KEY, JSON.stringify(scans))
  } catch (error) {
    console.error("Failed to save local scan history:", error)
  }
}

export function addStoredScan(skinData: ScanData): StoredScan {
  const scans = readStoredScans()
  const nextScan: StoredScan = {
    id: createScanId(),
    skinData,
    savedAt: new Date().toISOString(),
  }
  const nextScans = [...scans, nextScan].slice(-MAX_LOCAL_SCANS)
  saveStoredScans(nextScans)
  return nextScan
}

export function getStoredScanById(id: string): StoredScan | undefined {
  return readStoredScans().find((scan) => scan.id === id)
}

export function clearStoredScans() {
  if (typeof window === "undefined") return
  localStorage.removeItem(LOCAL_SCAN_STORAGE_KEY)
}
