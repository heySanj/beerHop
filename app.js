const path = require('path');
const methodOverride = require('method-override')
const express = require('express');
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const { brewerySchema, reviewSchema } = require('./schemas')
const app = express();

//To parse form data in POST request body:
app.use(express.urlencoded({ extended: true }))
// To parse incoming JSON in POST request body:
app.use(express.json())
// To 'fake' put/patch/delete requests:
app.use(methodOverride('_method'))

// Views folder and EJS setup:
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


 // Serve static files such as JS scripts and CSS styles
app.use(express.static(path.join(__dirname, '/public')))

// ====================== VALIDATION =============================

const validateBrewery = (req, res, next) => {

    // Try to validate the Joi schema
    const { error } = brewerySchema.validate(req.body)
    if(error){
        // Error details are an array so need to mapped over to extract each message
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, message)
    } else {
        next()
    }

}

const validateReview = (req, res, next) => {
    console.log(req.body);
    // Try to validate the Joi schema
    const { error } = reviewSchema.validate(req.body)
    if(error){
        // Error details are an array so need to mapped over to extract each message
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, message)
    } else {
        next()
    }

}

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
const Brewery = require('./models/brewery');
const Review = require('./models/review')
const { join } = require('path');

// ======================= ROUTE SETUP ============================

app.get('/', async (req, res) => {
    res.redirect(`/breweries`)
})

app.get('/breweries', catchAsync(async (req, res, next) => {
    const breweries = await Brewery.find({})  
    res.render('home', { breweries })
}))


// Add a brewery to the database
app.get('/breweries/new', (req, res) => {
    res.render('breweries/new')
})

// Posting a new brewery
app.post('/breweries', validateBrewery, catchAsync(async (req, res, next) => {

    const newBrewery = new Brewery(req.body.brewery)
    await newBrewery.save()

    res.redirect(`/`)
}))

// Get brewery by ID and show details
app.get('/breweries/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id).populate('reviews')
    res.render('breweries/details', { brewery })
}))

// Post a review on a brewery
app.post('/breweries/:id/reviews', validateReview, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)
    const review = new Review(req.body.review)
    brewery.reviews.push(review)
    await review.save()
    await brewery.save()

    res.redirect(`/breweries/${brewery._id}`)
}))

// Edit a brewery
app.get('/breweries/:id/edit', async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)
    res.render('breweries/edit', { brewery })
})

// Updating a brewery
app.put('/breweries/:id', validateBrewery, catchAsync(async (req, res, next) => {

    const { id } = req.params
    const brewery = await Brewery.findByIdAndUpdate(id, req.body.brewery, {runValidators: true, new: true})

    res.redirect(`/breweries/${brewery._id}`)
}))

// Deleting a brewery
app.delete('/breweries/:id', catchAsync(async (req, res, next) => {

    const { id } = req.params
    const deletedBrewery = await Brewery.findByIdAndDelete(id)

    res.redirect(`/breweries`)
}))

// Deleting a review
app.delete('/breweries/:id/reviews/:reviewId', catchAsync(async (req, res, next) => {

    const { id, reviewId } = req.params

    // Pull any reviews from the 'reviews' array, where the reviewId is the same as the one we are deleting
    await Brewery.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)

    res.redirect(`/breweries/${id}`)
}))


// ==========================  ERRORS  =============================

app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page not Found!'))
})

app.use((err, req, res, next) => {    
    // Pull the error code from the error, defaulting to 500 if none were found
    const { status = 500 } = err;
    if(!err.message) err.message = "Oh no! Something went wrong! 😞"    
    res.status(status).render('error', { err })
})

// ===================================================================

app.listen(8080, () => {
    console.log("=========== Listening on port: 8080 ===========")
})