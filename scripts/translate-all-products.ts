import { neon } from '@neondatabase/serverless'
import { productDb, translationDb } from '../lib/db'

const sql = neon(process.env.DATABASE_URL!)

async function translateAll() {
  console.log('Starting full database translation with BATCHING (10 at a time)...')
  
  try {
    const products = await productDb.getAll('en')
    const existingTranslations = await sql`SELECT product_id, locale FROM product_translations` as { product_id: number, locale: string }[]
    
    const productsToTranslate = products.filter(p => {
      const localesForProduct = existingTranslations
        .filter(t => t.product_id === p.id)
        .map(t => t.locale)
      return !localesForProduct.includes('ru') || !localesForProduct.includes('kz')
    })

    console.log(`${productsToTranslate.length} products actually need translation.`)

    const BATCH_SIZE = 3
    for (let i = 0; i < productsToTranslate.length; i += BATCH_SIZE) {
      const chunk = productsToTranslate.slice(i, i + BATCH_SIZE)
      const locales = ['ru', 'kz']

      for (const locale of locales) {
        // Skip if this chunk is already translated for this locale (rare but possible if re-running)
        const chunkIds = chunk.map(c => c.id)
        const existingInChunk = existingTranslations.filter(t => t.locale === locale && chunkIds.includes(t.product_id))
        if (existingInChunk.length === chunk.length) continue

        let retryCount = 0
        let success = false
        
        while (!success && retryCount < 5) {
          try {
            console.log(`Translating batch of ${chunk.length} to ${locale} (Attempt ${retryCount + 1})...`)
            
            const payload = chunk.map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              usage_tip: p.usage_tip,
              type: p.type
            }))

            const systemPrompt = `You are a professional translator for a skincare e-commerce platform called MizuCaire. 
            Translate the following product information from English to ${locale}.
            Maintain a premium, helpful, and professional tone. 
            The input is an ARRAY of objects. Return an ARRAY of objects with the same structure and keys but translated values.
            Do not translate brand names if they are proper nouns (e.g., "SKIN1004", "Dr.Ceuracle").
            Return ONLY the translated content, no explanations.`

            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      role: "user",
                      parts: [
                        {
                          text: `SYSTEM: ${systemPrompt}\n\nCONTENT TO TRANSLATE:\n${JSON.stringify(payload, null, 2)}`,
                        },
                      ],
                    },
                  ],
                }),
              }
            )

            const data = await geminiRes.json()
            
            if (geminiRes.ok) {
              let translatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
              
              if (translatedContent.includes('```')) {
                translatedContent = translatedContent.replace(/```(json)?/g, '').replace(/```/g, '').trim()
              }

              const results = JSON.parse(translatedContent)
              
              for (let j = 0; j < chunk.length; j++) {
                await translationDb.upsert({
                  product_id: chunk[j].id,
                  locale,
                  ...results[j]
                })
              }

              success = true
              console.log(`Batch success: ${chunk.length} products -> ${locale}`)
              console.log('Waiting 60 seconds before next request to respect rate limits...')
              await new Promise(r => setTimeout(r, 60000))
            } else if (geminiRes.status === 429) {
              retryCount++
              const wait = Math.pow(2, retryCount) * 5000 + 10000
              console.warn(`Rate limited by Gemini. Waiting ${Math.round(wait/1000)}s...`)
              await new Promise(r => setTimeout(r, wait))
            } else {
              console.error('Gemini error body:', data)
              throw new Error(`Gemini API Error: ${geminiRes.statusText}`)
            }
          } catch (e) {
            console.error(`Error on batch starting with ${chunk[0].id} (${locale}):`, e)
            retryCount++
            await new Promise(r => setTimeout(r, 15000))
          }
        }
      }
    }
    
    console.log('Full database translation complete!')
  } catch (error) {
    console.error('Translation process failed:', error)
  }
}

translateAll()
