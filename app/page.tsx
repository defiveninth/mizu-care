"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import WelcomeScreen from "@/components/skin-analysis/welcome-screen"
import HomeScreen from '@/components/skin-analysis/home'
import CameraCapture from "@/components/skin-analysis/camera-capture"
import ScanningScreen from "@/components/skin-analysis/scanning-screen"
import SurveyFlow from "@/components/skin-analysis/survey-flow"
import { addStoredScan, type ScanData } from "@/lib/scan-storage"

export type RecommendedProduct = {
  id: number
  name: string
  description: string | null
  price: string
  brand: string
  type: string
  image_url: string | null
}

export type SkinData = ScanData

export type AppScreen =
  | "home"
  | "welcome"
  | "camera"
  | "scanning"
  | "survey"

interface AnalysisResult {
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
  recommendedProducts?: RecommendedProduct[]
}

const INITIAL_SKIN_DATA: SkinData = {
  image: null,
  surveyAnswers: {},
  skinType: "",
  concerns: [],
  recommendations: [],
}

export default function SkinAnalysisApp() {
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("home")
  const [skinData, setSkinData] = useState<SkinData>(INITIAL_SKIN_DATA)

  const handleStartAnalysis = () => {
    setCurrentScreen("camera")
  }

  const handlePhotoCapture = (imageData: string) => {
    setSkinData((prev) => ({ ...prev, image: imageData }))
    setCurrentScreen("survey")
  }

  const handleSurveyComplete = (answers: Record<string, string>) => {
    setSkinData((prev) => ({
      ...prev,
      surveyAnswers: answers,
    }))
    setCurrentScreen("scanning")
  }

  const handleScanningComplete = (analysisResult?: AnalysisResult) => {
    let completedData: SkinData

    if (analysisResult) {
      completedData = {
        ...skinData,
        skinType: analysisResult.skinType,
        concerns: analysisResult.concerns,
        recommendations: analysisResult.recommendations,
        analysis: analysisResult.analysis,
        detailedNotes: analysisResult.detailedNotes,
        recommendedProducts: analysisResult.recommendedProducts,
      }
    } else {
      const { skinType, concerns, recommendations } = analyzeSkinFromSurvey(skinData.surveyAnswers)
      completedData = {
        ...skinData,
        skinType,
        concerns,
        recommendations,
      }
    }

    setSkinData(completedData)
    const storedScan = addStoredScan(completedData)
    router.push(`/results/${storedScan.id}`)
  }

  return (
    <main className="min-h-screen bg-[#eef0f1]">
      {currentScreen === "home" && (
        <HomeScreen onStart={() => setCurrentScreen("welcome")} />
      )}
      {currentScreen === "welcome" && (
        <WelcomeScreen onStart={handleStartAnalysis} />
      )}
      {currentScreen === "camera" && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onBack={() => setCurrentScreen("welcome")}
        />
      )}
      {currentScreen === "survey" && (
        <SurveyFlow onComplete={handleSurveyComplete} />
      )}
      {currentScreen === "scanning" && (
        <ScanningScreen
          image={skinData.image}
          surveyAnswers={skinData.surveyAnswers}
          onComplete={handleScanningComplete}
        />
      )}
    </main>
  )
}

// Fallback analysis based on survey answers only
function analyzeSkinFromSurvey(answers: Record<string, string>): {
  skinType: string
  concerns: string[]
  recommendations: string[]
} {
  const oiliness = answers.oiliness || "balanced"
  const sensitivity = answers.sensitivity || "not_sensitive"
  const hydration = answers.hydration || "normal"
  const concerns = answers.concerns?.split(",") || []

  let skinType = "Normal"
  const skinConcerns: string[] = []
  const recommendations: string[] = []

  // Determine skin type
  if (oiliness === "very_oily" || oiliness === "oily") {
    if (hydration === "dry" || hydration === "very_dry") {
      skinType = "Combination"
      skinConcerns.push("Combination skin with oily T-zone")
    } else {
      skinType = "Oily"
      skinConcerns.push("Excess sebum production")
    }
  } else if (hydration === "dry" || hydration === "very_dry") {
    skinType = "Dry"
    skinConcerns.push("Lack of natural moisture")
  } else if (sensitivity === "very_sensitive" || sensitivity === "sensitive") {
    skinType = "Sensitive"
    skinConcerns.push("Reactive skin barrier")
  }

  // Add concerns based on survey
  if (concerns.includes("acne")) {
    skinConcerns.push("Acne-prone skin")
  }
  if (concerns.includes("aging")) {
    skinConcerns.push("Fine lines and aging signs")
  }
  if (concerns.includes("dark_spots")) {
    skinConcerns.push("Hyperpigmentation")
  }
  if (concerns.includes("redness")) {
    skinConcerns.push("Redness and irritation")
  }

  // Generate recommendations
  if (skinType === "Oily") {
    recommendations.push(
      "Use a gentle foaming cleanser twice daily",
      "Apply oil-free, non-comedogenic moisturizer",
      "Include niacinamide serum to control sebum",
      "Use clay masks weekly to deep clean pores"
    )
  } else if (skinType === "Dry") {
    recommendations.push(
      "Use a hydrating cream cleanser",
      "Layer hydrating serums with hyaluronic acid",
      "Apply rich moisturizer with ceramides",
      "Use facial oils at night for extra nourishment"
    )
  } else if (skinType === "Combination") {
    recommendations.push(
      "Use a balanced gel cleanser",
      "Apply lightweight moisturizer all over",
      "Use targeted treatments for different zones",
      "Balance with gentle exfoliation weekly"
    )
  } else if (skinType === "Sensitive") {
    recommendations.push(
      "Use fragrance-free gentle cleansers",
      "Apply soothing products with centella",
      "Avoid harsh active ingredients",
      "Always use mineral sunscreen SPF 50+"
    )
  } else {
    recommendations.push(
      "Maintain with gentle cleanser",
      "Use antioxidant serums for protection",
      "Apply broad-spectrum sunscreen daily",
      "Incorporate retinol for prevention"
    )
  }

  return {
    skinType,
    concerns: skinConcerns.length > 0 ? skinConcerns : ["Healthy skin balance"],
    recommendations,
  }
}
