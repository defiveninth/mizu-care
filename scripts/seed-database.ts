import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function seed() {
  console.log('Seeding database...')

  // Initialize stats with realistic starting values
  await sql`
    INSERT INTO scan_stats (id, total_scans, total_ratings, ratings_sum)
    VALUES (1, 52847, 12453, 59774)
    ON CONFLICT (id) DO NOTHING
  `
  console.log('Initialized scan stats')

  // Add some initial reviews
  const initialReviews = [
    { author_name: 'Анна М.', rating: 5, comment: 'Отличное приложение! Помогло подобрать уход для моей кожи.' },
    { author_name: 'Елена К.', rating: 5, comment: 'Очень точный анализ, рекомендую всем!' },
    { author_name: 'Мария С.', rating: 4, comment: 'Хорошее приложение, удобный интерфейс.' },
    { author_name: 'Ольга П.', rating: 5, comment: 'Наконец-то нашла подходящие средства благодаря этому сканеру!' },
    { author_name: 'Светлана Д.', rating: 5, comment: 'Превосходный анализ кожи, очень довольна результатом.' },
    { author_name: 'Наталья В.', rating: 5, comment: 'Пользуюсь уже месяц, кожа стала заметно лучше!' },
  ]

  for (const review of initialReviews) {
    await sql`
      INSERT INTO reviews (author_name, rating, comment)
      VALUES (${review.author_name}, ${review.rating}, ${review.comment})
    `
  }
  console.log(`Seeded ${initialReviews.length} initial reviews`)

  console.log('Database seeded successfully!')
}

seed().catch(console.error)
