const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Brewery = require('../models/brewery');
const { brewerySchema } = require('../schemas')


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

// ======================= ROUTE SETUP ============================

router.get('/', catchAsync(async (req, res, next) => {
    const breweries = await Brewery.find({})  
    res.render('home', { breweries })
}))


// Add a brewery to the database
router.get('/new', (req, res) => {
    res.render('breweries/new')
})

// Posting a new brewery
router.post('/', validateBrewery, catchAsync(async (req, res, next) => {   
    const newBrewery = new Brewery(req.body.brewery)
    await newBrewery.save()

    req.flash('success', `Successfully added ${newBrewery.name}!`)
    res.redirect(`/breweries/${newBrewery._id}`)
}))

// Get brewery by ID and show details
router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id).populate('reviews')

    if(!brewery){
        req.flash('error', 'Sorry, that brewery could not be found. 😞')
        return res.redirect('/breweries')
    }

    res.render('breweries/details', { brewery })
}))


// Edit a brewery
router.get('/:id/edit', async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)

    if(!brewery){
        req.flash('error', 'Sorry, that brewery could not be found. 😞')
        return res.redirect('/breweries')
    }
    
    res.render('breweries/edit', { brewery })
})

// Updating a brewery
router.put('/:id', validateBrewery, catchAsync(async (req, res, next) => {

    const { id } = req.params
    const brewery = await Brewery.findByIdAndUpdate(id, req.body.brewery, {runValidators: true, new: true})
    req.flash('success', `Successfully updated ${brewery.name}!`)

    res.redirect(`/breweries/${brewery._id}`)
}))

// Deleting a brewery
router.delete('/:id', catchAsync(async (req, res, next) => {

    const { id } = req.params
    const deletedBrewery = await Brewery.findByIdAndDelete(id)
    req.flash('success', `Successfully deleted ${deletedBrewery.name}!`)
    res.redirect(`/breweries`)
}))

module.exports = router