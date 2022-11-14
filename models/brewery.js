const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema

const BrewerySchema = new Schema({
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
    },
    image: {
        type: String
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

// This middleware will run after a findByIdAndDelete() call
// brewery will be the object that was deleted
BrewerySchema.post('findOneAndDelete', async function (brewery) {

    // If a brewery was actually deleted
    if(brewery){
        // Search all Reviews and delete any that belonged to the deleted brewery
        await Review.deleteMany({ _id: { $in: brewery.reviews}})
    }
})

const Brewery = mongoose.model('Brewery', BrewerySchema)

// Export the Product model to the main app
module.exports = Brewery