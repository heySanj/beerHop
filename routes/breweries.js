const express = require('express')
const router = express.Router();
// const catchAsync = require('../utils/catchAsync')
const Brewery = require('../models/brewery');
const { isLoggedIn, isAuthor, validateBrewery, catchAsync } = require('../utils/middleware')


// ======================= ROUTE SETUP ============================

router.get('/', catchAsync(async (req, res, next) => {
    const breweries = await Brewery.find({})  
    res.render('home', { breweries })
}))


// Add a brewery to the database
router.get('/new', isLoggedIn, (req, res) => {
    res.render('breweries/new')
})

// Posting a new brewery
router.post('/', isLoggedIn, validateBrewery, catchAsync(async (req, res, next) => {   
    const newBrewery = new Brewery(req.body.brewery)
    newBrewery.author = req.user._id
    await newBrewery.save()

    req.flash('success', `Successfully added ${newBrewery.name}!`)
    res.redirect(`/breweries/${newBrewery._id}`)
}))

// Get brewery by ID and show details
router.get('/:id', catchAsync(async (req, res, next) => {
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

    res.render('breweries/details', { brewery })
}))


// Edit a brewery
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)

    if(!brewery){
        req.flash('error', 'Sorry, that brewery could not be found. 😞')
        return res.redirect('/breweries')
    }
    
    res.render('breweries/edit', { brewery })
}))

// Updating a brewery
router.put('/:id', isLoggedIn, isAuthor, validateBrewery, catchAsync(async (req, res, next) => {
    
    const { id } = req.params
    const updatedBrewery = await Brewery.findByIdAndUpdate(id, req.body.brewery, {runValidators: true, new: true})
    req.flash('success', `Successfully updated ${updatedBrewery.name}!`)

    res.redirect(`/breweries/${updatedBrewery._id}`)
}))

// Deleting a brewery
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {

    const { id } = req.params
    const deletedBrewery = await Brewery.findByIdAndDelete(id)
    req.flash('success', `Successfully deleted ${deletedBrewery.name}!`)
    res.redirect(`/breweries`)
}))

module.exports = router