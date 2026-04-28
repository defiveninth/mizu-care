import { translationDb } from './db'

export async function translateAndStoreProduct(productId: number, data: { name: string, description: string | null, usage_tip: string | null, type: string }) {
  const locales = ['ru', 'kz']
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  for (const locale of locales) {
    try {
      const res = await fetch(`${baseUrl}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: {
            name: data.name,
            description: data.description,
            usage_tip: data.usage_tip,
            type: data.type
          },
          targetLanguage: locale,
          context: 'product'
        })
      })
      
      if (res.ok) {
        const { translatedText } = await res.json()
        await translationDb.upsert({
          product_id: productId,
          locale,
          ...translatedText
        })
        console.log(`Successfully translated product ${productId} to ${locale}`)
      } else {
        console.error(`Failed to translate product ${productId} to ${locale}: ${res.statusText}`)
      }
    } catch (e) {
      console.error(`Failed to translate product ${productId} to ${locale}:`, e)
    }
  }
}
