require('dotenv').config()
import mongoose from 'mongoose'
import express, { Application, Request, Response } from 'express'
import Item from './schemas/Item'
import ShortUniqueId from 'short-unique-id'
const app: Application = express()
const PORT = process.env.PORT ?? 3000

mongoose
  .connect(process.env.MONGO_URI ?? '')
  .then(() => {
    console.log('Successfull connetion MongoDB')
  })
  .catch(error => {
    console.error('Connection error: ', error)
  })

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!')
})

app.get('/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug
  if (!slug) {
    return res.status(400).json({ message: 'Missing slug' })
  }
  const result = await Item.findOne({ slug })
  if (!result || !result.url) {
    return res.status(404).json({ message: 'Item not found' })
  }
  if (!result.clicks) {
    result.clicks = 0
  }
  result.clicks++
  await result.save()
  res.redirect(result.url)
})

app.get('/:slug/stats', async (req: Request, res: Response) => {
  const slug = req.params.slug
  if (!slug) {
    return res.status(400).json({ message: 'Missing slug.' })
  }
  const result = await Item.findOne({ slug })
  if (!result || !result.url) {
    return res.status(404).json({ message: 'Item not found' })
  }
  res.status(200).json({ result })
})

app.post('/url', async (req: Request, res: Response) => {
  const { url } = req.body
  let { slug } = req.body
  if (!url) {
    return res.status(400).json({ message: 'Missing information' })
  }

  if (!slug) {
    const uid = new ShortUniqueId({ length: 10 })
    slug = uid()
  }

  const isSlugTaken = await Item.findOne({ slug })
  if (isSlugTaken) {
    return res.status(400).json({ message: `Slug {${slug}} already exist.` })
  }

  const newItem = new Item({
    clicks: 0,
    slug,
    url
  })
  const created = await newItem.save()
  res.status(201).json({ message: 'Item created successfully', created })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
