if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const cities = require('./cities')
const { name, suffix, description } = require('./data')
const axios = require('axios')

const { storage, cloudinary } = require('../utils/cloudinary')

// ====================== MONGOOSE SETUP =============================
require('dotenv').config();
const mongoose = require('mongoose');
const dbName = 'beerHop'

mongoose.connect(`${process.env.DB_URI}/${dbName}?retryWrites=true&w=majority`)
    .then(() => {
        console.log("=========== MongoDB Connection Open! ==========")
    })
    .catch(err => {
        console.log("MONGODB - ERROR: ", err)
    })

const db = mongoose.connection
const Brewery = require('../models/brewery')


// ======================= UNSPLASH API =============================

  // call unsplash and return small image
  async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: process.env.UNSPLASH_KEY,
          collections: 9011780,
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }

// A Function that takes input 'array' and returns a random element from within
const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {

    await Brewery.deleteMany({}) // Delete all existing data before seeding with new data

    // Generate 50 breweries
    for (let i = 0; i < 6; i++){

        const randomCity = cities[Math.floor(Math.random()*cities.length)]
        const randomName = `${sample(name)} ${sample(suffix)}`
        const randomPrice = (Math.floor(Math.random() * 6)) + 8 // Random number between 8 and 13
        const randomDescription = sample(description)

        const brewery = new Brewery({
            name: randomName,
            price: randomPrice,
            description: randomDescription,
            location: `${randomCity.city}, ${randomCity.admin_name}`,
            author: '637d88e18682534143525143',
            // image: await seedImg()
            // image: 'https://source.unsplash.com/collection/9011780'
            images: []
        })

        const imgUrl = await seedImg()

        // Upload the image to Cloudinary and return an object with the url and filename
        await storage.cloudinary.uploader
          .upload(imgUrl, { folder: "beerHop" })
          .then(result => brewery.images.push({
            url: result.secure_url,
            filename: result.public_id
          }))

        await brewery.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})