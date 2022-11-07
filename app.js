const path = require('path');
const methodOverride = require('method-override')
const express = require('express');
const app = express();

//To parse form data in POST request body:
app.use(express.urlencoded({ extended: true }))
// To parse incoming JSON in POST request body:
app.use(express.json())
// To 'fake' put/patch/delete requests:
app.use(methodOverride('_method'))
// Views folder and EJS setup:
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

app.get('/', (req, res) => {
    res.render('home')
})

// Add a brewery to the database
app.get('/brewery/new', (req, res) => {
    res.render('brewery/new')
})

// Posting a new brewery
app.post('/brewery', async (req, res) => {

    const newBrewery = new Brewery(req.body)
    await newBrewery.save()

    res.redirect(`/`)
})


// ===================================================================

app.listen(8080, () => {
    console.log("=========== Listening on port: 8080 ===========")
})