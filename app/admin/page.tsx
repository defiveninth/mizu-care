"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Package, ArrowLeft, LayoutGrid, List, Sparkles, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  link: string | null
  sostav: string[]
}

interface Review {
  id: number
  author_name: string
  rating: number
  comment: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminPage() {
  const { t, locale } = useI18n()
  const [viewMode, setViewMode] = useState<"list" | "cards">("list")
  const [activeTab, setActiveTab] = useState<"products" | "reviews">("products")
  
  const { data: products, isLoading: productsLoading } = useSWR<Product[]>('/api/products', fetcher)
  const { data: reviews, isLoading: reviewsLoading } = useSWR<Review[]>('/api/reviews', fetcher)
  const { data: stats } = useSWR('/api/stats', fetcher)

  const [isAnalyzeDialogOpen, setIsAnalyzeDialogOpen] = useState(false)
  const [analysisPeriod, setAnalysisPeriod] = useState<"1d" | "1w" | "1m" | "3m" | "6m">("1m")
  const [analysisSummary, setAnalysisSummary] = useState("")
  const [isAnalyzingReviews, setIsAnalyzingReviews] = useState(false)

  const handleDeleteReview = async (id: number) => {
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" })
      mutate('/api/reviews')
      mutate('/api/stats')
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-display">Admin Panel</h1>
              <p className="text-muted-foreground">Manage your skincare platform (Static Catalog)</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="select" showNativeName />
            
            {activeTab === "products" && (
              <div className="hidden sm:flex items-center rounded-full border border-border/60 bg-background p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  className="rounded-full"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  className="rounded-full"
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Cards
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_scans || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.average_rating || "0.0"} / 5.0</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-background p-1">
            <Button
              type="button"
              size="sm"
              variant={activeTab === "products" ? "secondary" : "ghost"}
              className="rounded-full"
              onClick={() => setActiveTab("products")}
            >
              Products
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "reviews" ? "secondary" : "ghost"}
              className="rounded-full"
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </Button>
          </div>
        </div>

        {/* Content */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {activeTab === "products" ? <Package className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              {activeTab === "products" ? "Product Catalog" : "User Reviews"}
            </CardTitle>
            
            {activeTab === "reviews" && (
              <Dialog open={isAnalyzeDialogOpen} onOpenChange={setIsAnalyzeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Analyze
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>AI Review Analysis</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Analysis Period</Label>
                      <Select value={analysisPeriod} onValueChange={(v: any) => setAnalysisPeriod(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">Last 24 Hours</SelectItem>
                          <SelectItem value="1w">Last Week</SelectItem>
                          <SelectItem value="1m">Last Month</SelectItem>
                          <SelectItem value="3m">Last 3 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      disabled={isAnalyzingReviews}
                      onClick={async () => {
                        setIsAnalyzingReviews(true)
                        try {
                          const res = await fetch('/api/reviews/analyze', {
                            method: 'POST',
                            body: JSON.stringify({ period: analysisPeriod, locale })
                          })
                          const data = await res.json()
                          setAnalysisSummary(data.summary)
                        } catch (e) {
                          console.error(e)
                        } finally {
                          setIsAnalyzingReviews(false)
                        }
                      }}
                    >
                      {isAnalyzingReviews ? "Analyzing..." : "Generate Summary"}
                    </Button>

                    {analysisSummary && (
                      <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
                        {analysisSummary}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {activeTab === "products" ? (
              productsLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading products...</div>
              ) : viewMode === "list" ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Ingredients</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                                {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover" />}
                              </div>
                              <span className="line-clamp-1">{p.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{p.price.toLocaleString()} ₸</TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {p.sostav?.join(", ") || "None"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products?.map((p) => (
                    <Card key={p.id} className="overflow-hidden border-border/40">
                      <div className="relative h-40 bg-muted">
                        {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover" />}
                      </div>
                      <CardContent className="p-4">
                        <p className="font-bold text-sm line-clamp-1 mb-1">{p.name}</p>
                        <p className="text-primary font-bold">{p.price.toLocaleString()} ₸</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              reviewsLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading reviews...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews?.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.author_name}</TableCell>
                        <TableCell>{r.rating} / 5</TableCell>
                        <TableCell className="max-w-md truncate">{r.comment}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteReview(r.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
