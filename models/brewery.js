const mongoose = require('mongoose')
const Review = require('./review')
// const User = require('./user')
const Schema = mongoose.Schema

// Allow virtuals to be stringified into JSON (apply these options to schemas)
const opts = { toJSON: { virtuals: true } }

const ImageSchema = new Schema({
    url: String,
    filename: String
}, opts)

// Calling this function will return a thumbnail version of the image from the Cloudinary API
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/c_thumb,h_200,w_200')
})

ImageSchema.virtual('popup').get(function() {
    return this.url.replace('/upload', '/upload/c_thumb,h_200,w_500')
})


ImageSchema.virtual('card').get(function() {
    return this.url.replace('/upload', '/upload/q_auto:eco/c_fill,g_auto,h_480,w_640')
})

ImageSchema.virtual('carousel').get(function() {
    return this.url.replace('/upload', '/upload/c_fill,g_auto,h_2400,w_1600/q_auto:eco')
})


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
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

BrewerySchema.virtual('properties.popUpMarkup').get(function() {
    return `<div class="popup d-flex flex-column">
                <h4>${this.name}</h4>
                <em>${this.description.substring(0,90)}...</em>
                <img src="${this.images[0].popup}">
                <a class="btn btn-outline-dark btn-sm mt-2" href="/breweries/${this._id}">View</a>
            </div>
            `
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