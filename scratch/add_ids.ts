import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'products_v3.json')
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

const updatedData = data.map((item, index) => ({
  id: index + 1,
  ...item
}))

fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2))
console.log('Successfully added IDs to products_v3.json')
