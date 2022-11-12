const path = require('path');
const methodOverride = require('method-override')
const express = require('express');
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
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
const Brewery = require('./models/brewery')

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
app.post('/breweries', catchAsync(async (req, res, next) => {
    console.log(req.body.brewery);
    if(!req.body.brewery){
        next(new ExpressError(404, 'Page not Found!'))
    }
    const newBrewery = new Brewery(req.body.brewery)
    await newBrewery.save()

    res.redirect(`/`)
}))

// Get brewery by ID and show details
app.get('/breweries/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)
    res.render('breweries/details', { brewery })
}))

// Edit a brewery
app.get('/breweries/:id/edit', async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)
    res.render('breweries/edit', { brewery })
})

// Updating a brewery
app.put('/breweries/:id', catchAsync(async (req, res, next) => {

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


// ==========================  ERRORS  =============================

app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page not Found!'))
})

app.use((err, req, res, next) => {    
    // Pull the error code from the error, defaulting to 500 if none were found
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(status).send(`${status}: ${message}`)
    // res.send("Oh boy! Something went wrong 😞")
})

// ===================================================================

app.listen(8080, () => {
    console.log("=========== Listening on port: 8080 ===========")
})