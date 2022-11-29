if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const path = require('path');
const methodOverride = require('method-override')
const express = require('express');
const ejsMate = require('ejs-mate')

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')

// Hashing function
const md5 = require('md5')

const app = express();

//To parse form data in POST request body:
app.use(express.urlencoded({ extended: true }))
// To parse incoming JSON in POST request body:
app.use(express.json())
// To 'fake' put/patch/delete requests:
app.use(methodOverride('_method'))

// Protecting from injection attacks to the database
app.use(mongoSanitize())

// ====================== HELMET ==============================

const helmet = require('helmet')
const { helmetSettings } = require('./utils/helmetSetup')
app.use(helmet(helmetSettings))


// ====================== FILES & FOLDERS =========================

// Views folder and EJS setup:
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Serve static files such as JS scripts and CSS styles
app.use(express.static(path.join(__dirname, '/public')))


// ====================== MONGOOSE SETUP =============================

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

// ================== SESSIONS & FLASH ===========================

const session = require('express-session')
const flash = require('connect-flash')
const MongoStore = require('connect-mongo')

const store = MongoStore.create({
    mongoUrl: `${process.env.DB_URI}/${dbName}`,
    touchAfter: 24 * 60 * 60, // Only update every 24 hours unless a change has been detected     
    secret: process.env.SECRET
})

store.on('error', function(e){
    console.log("SESSION STORE ERROR!")
})

const sessionConfig = {
    store: store,
    name: 'sundaySesh',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // Extra security for your cookies!
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Current time in milliseconds + 1 week in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }  
}
app.use(session(sessionConfig))
app.use(flash())

// ================== PASSPORT & AUTH ===========================

const User = require('./models/user')

app.use(passport.initialize())
app.use(passport.session()) // Make sure the app is using session() BEFORE passport uses it
passport.use(new LocalStrategy(User.authenticate())) // authenticate() is a method added to the User

// Tell passport how to store and unstore user data in a session
// (Using the methods added to User schema by passport-local-mongoose)
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// ==================== PASSING VARIABLES TO EVERY ROUTE ========================

// On each request, if there is a flash: pass it on to the local params.
app.use((req, res, next) => {

    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user // Also pass through the currently logged in user
    res.locals.md5 = md5

    next()
})

// ======================= ROUTE SETUP ============================

const breweryRoutes = require('./routes/breweries')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

app.use('/breweries', breweryRoutes)
app.use('/breweries/:id/reviews', reviewRoutes)
app.use('/user', userRoutes)

app.get('/', async (req, res) => {
    res.render('home')
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

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`=========== Listening on port: ${port} ===========`)
})