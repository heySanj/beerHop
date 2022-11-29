const Brewery = require('../models/brewery');
const Review = require('../models/review')
const { cloudinary } = require('../utils/cloudinary')

// MAPBOX
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_PUBLIC_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }) // Configure the access Token for mapbox

const replacer = (key, value) => {
    // Filtering out properties
    if (key === "reviews" || key === "images" || key === "author") {
      return undefined;
    }
    return value;    
}

module.exports.index = async (req, res, next) => {
    const breweries = await Brewery.find({})  
    res.render('breweries/allBreweries', { breweries, replacer })
}

module.exports.renderNewForm =  (req, res) => {
    res.render('breweries/new')
}

module.exports.createBrewery = async (req, res, next) => {     

    const newBrewery = new Brewery(req.body.brewery)
    newBrewery.author = req.user._id

    // pull the url and filename data from each file in req.files
    newBrewery.images = req.files.map(f => ({url: f.path, filename: f.filename }))

    // Get geometry data from geocoder and save to the new Brewery
    const geoData = await geocoder.forwardGeocode({
        query: req.body.brewery.location,
        limit: 1
    }).send()

    newBrewery.geometry = geoData.body.features[0].geometry

    await newBrewery.save()

    req.flash('success', `Successfully added ${newBrewery.name}!`)
    res.redirect(`/breweries/${newBrewery._id}`)
}

module.exports.showBrewery = async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id).populate({
        // Populate reveiws and then populate the author of each review
        path: 'reviews',        
        populate: {
            path: 'author'
        }
    }).populate('author') // And also populate the author of each Brewery

    if(!brewery){
        req.flash('error', 'Sorry, that brewery could not be found. 😞')
        return res.redirect('/breweries')
    }

    res.render('breweries/details', { brewery, replacer })
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)

    if(!brewery){
        req.flash('error', 'Sorry, that brewery could not be found. 😞')
        return res.redirect('/breweries')
    }
    
    res.render('breweries/edit', { brewery })
}

module.exports.updateBrewery = async (req, res, next) => {
    
    const { id } = req.params
    const updatedBrewery = await Brewery.findByIdAndUpdate(id, req.body.brewery, {runValidators: true, new: true})

    // ----- GEOMETRY ------
    const geoData = await geocoder.forwardGeocode({
        query: updatedBrewery.location,
        limit: 1
    }).send()
    updatedBrewery.geometry = geoData.body.features[0].geometry

    // ----- IMAGES ------
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename }))
    updatedBrewery.images.push(...imgs) // imgs is an array of objects, so will be spread and each object pushed individually
    
    await updatedBrewery.save()

    // If there are images to be deleted --> Pull the images from the Brewery.images list where the images 
    // match those in the deleteImages array in req.body
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename) // Delete the image off the cloudinary server as well
        }
        await updatedBrewery.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }    

    req.flash('success', `Successfully updated ${updatedBrewery.name}!`)
    res.redirect(`/breweries/${updatedBrewery._id}`)
}

module.exports.deleteBrewery = async (req, res, next) => {

    const { id } = req.params
    const brewery = await Brewery.findById(id)
    const { name } = brewery

    // Delete all review objects
    brewery.reviews.forEach(async(review) => {        
        await Review.findByIdAndDelete(review._id)
    })    

    const deletedBrewery = await Brewery.deleteOne(brewery)

    req.flash('success', `Successfully deleted ${name}!`)
    res.redirect(`/breweries`)
}