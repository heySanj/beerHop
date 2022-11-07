const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BrewerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String
    },
    location: {
        type: String
    }
})

const Brewery = mongoose.model('Brewery', BrewerySchema)

// Export the Product model to the main app
module.exports = Brewery