import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  slug: String,
  url: String,
  clicks: Number
})

export default mongoose.model('Item', itemSchema)
