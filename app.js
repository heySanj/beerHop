const path = require('path');
const methodOverride = require('method-override')
const express = require('express');
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
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

// ================== SESSIONS & FLASH ===========================

const sessionConfig = {
    secret: 'thissecretshouldbebetter!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // Extra security for your cookies!
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Current time in milliseconds + 1 week in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    // store: this will eventually be a different store!

}
app.use(session(sessionConfig))
app.use(flash())

// On each request, if there is a flash: pass it on to the local params.
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// ====================== ROUTES ================================

const breweryRoutes = require('./routes/breweries')
const reviewRoutes = require('./routes/reviews')

// ====================== VALIDATION =============================



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


app.use('/breweries', breweryRoutes)
app.use('/breweries/:id/reviews', reviewRoutes)

app.get('/', async (req, res) => {
    res.redirect(`/breweries`)
})



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