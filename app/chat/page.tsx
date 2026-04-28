'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, Sparkles, User, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from '@/lib/i18n'

interface Product {
  id: number
  name: string
  price: number
  description?: string
  image?: string
  category?: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  products?: Product[]
}

const SYSTEM_PROMPT = `You are a helpful skincare shopping assistant for MizuCaire. You have access to a product catalog.
When users ask about products, search queries, or want recommendations, you MUST respond with a JSON block in this exact format alongside your text:
<products>["product name 1", "product name 2"]</products>

Only include the <products> tag when the user is asking about specific products, wants to see items, or is browsing.
Be concise, friendly, and professional. 
If user asks general questions not related to products, just answer normally without the <products> tag.`;

function ChatProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} target="_blank" className="block group">
      <Card className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300 h-full">
        <div className="relative h-32 bg-muted/30 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
          )}
        </div>
        <CardContent className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-0.5">{product.category}</p>
          <h4 className="text-xs font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h4>
          <p className="text-sm font-bold text-foreground">
            {Number(product.price).toLocaleString('ru-KZ')} ₸
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 px-2 py-1">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.4s' }} />
    </div>
  );
}

function AiChatPage() {
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your MizuCaire skincare assistant. How can I help you find the perfect products for your routine today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function matchProducts(names: string[]): Product[] {
    if (!names.length || !products.length) return [];
    return names
      .flatMap((name) => {
        const lower = name.toLowerCase();
        return products.filter(
          (p) =>
            p.name?.toLowerCase().includes(lower) ||
            (p.category && p.category.toLowerCase().includes(lower)) ||
            (p.description && p.description.toLowerCase().includes(lower))
        );
      })
      .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
      .slice(0, 4);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const productContext =
      products.length > 0
        ? `\n\nAvailable products:\n${products
            .map((p) => `- ${p.name} (id:${p.id}, ₸${p.price}${p.category ? ", " + p.category : ""})`)
            .join("\n")}`
        : "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT + productContext,
          message: text,
        }),
      });

      const data = await res.json();
      const raw: string = data.content ?? "";

      const productMatch = raw.match(/<products>([\s\S]*?)<\/products>/);
      let matchedProducts: Product[] = [];
      let cleanContent = raw.replace(/<products>[\s\S]*?<\/products>/g, "").trim();

      if (productMatch) {
        try {
          const names: string[] = JSON.parse(productMatch[1]);
          matchedProducts = matchProducts(names);
        } catch {}
      }

      if (!matchedProducts.length) {
        const lower = text.toLowerCase();
        const keywordMatched = products.filter(
          (p) =>
            lower.includes(p.name?.toLowerCase()) ||
            (p.category && lower.includes(p.category.toLowerCase()))
        ).slice(0, 4);
        if (keywordMatched.length) matchedProducts = keywordMatched;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: cleanContent,
          products: matchedProducts.length ? matchedProducts : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the AI. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-2xl mx-auto border-x border-border/50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight font-display">Mizu Assistant</h1>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase border-primary/20 text-primary">
          Expert Mode
        </Badge>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
              msg.role === "user" 
                ? "bg-primary text-white border-primary shadow-md shadow-primary/10" 
                : "bg-background border-border/50 text-primary"
            }`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            
            <div className={`flex flex-col gap-3 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-tr-none shadow-elevated"
                  : "bg-white border border-border/50 text-foreground rounded-tl-none shadow-sm"
              }`}>
                {msg.content}
              </div>

              {msg.products && msg.products.length > 0 && (
                <div className="grid grid-cols-2 gap-3 w-full">
                  {msg.products.map((p) => (
                    <ChatProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-background border border-border/50 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="bg-white border border-border/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-border/50 bg-background/80 backdrop-blur-md">
        <div className="relative flex items-end gap-2 bg-white border border-border/60 rounded-2xl p-2 pl-4 shadow-sm focus-within:border-primary/50 focus-within:shadow-card transition-all duration-300">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Ask about routines, ingredients..."
            disabled={loading}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 max-h-[120px] resize-none outline-none"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || loading}
            size="icon"
            className="rounded-xl h-10 w-10 shrink-0 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-3 tracking-wide">
          Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

export default AiChatPage;
