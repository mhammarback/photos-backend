import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cloudinaryFramework from 'cloudinary'
import multer from 'multer'
import cloudinaryStorage from 'multer-storage-cloudinary'


const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/animal-photos'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Animal = mongoose.model('Animal', {
  name: {
    type: String, 
    required: true,
  },
  imageUrl: {
    type: String, 
    required: true,
  },
  date: {
    type: Date
  }
})

dotenv.config()

//Cloudinary setup
const cloudinary = cloudinaryFramework.v2
cloudinary.config({ 
  cloud_name: 'mhammarback', 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = cloudinaryStorage({
  cloudinary,
  params: {
    folder: 'imageupload-practice',
    allowedFormats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  }
})

const parser = multer({ storage })

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(bodyParser.json())


app.get('/', (req, res) => {
  res.send('Welcome')
})

app.post('/animals', parser.single('image'), async (req,res) => {
  try {
    const newAnimal = await new Animal({ name: req.body.name, imageUrl: req.file.path, date: req.body.date }).save()
    res.status(200).json({ message: 'Animal saved'})
  } catch (err) {
    res.status(400).json({ message: 'Could not save'})
  }
})

app.get('/animals', async (req,res) => {
  try {
    const allAnimals = await Animal.find()
    res.status(200).json(allAnimals)
  } catch (err) {
    res.status(400).json({ message: 'could not find animals'})
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
