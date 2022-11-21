const express = require('express')
const router = express.Router({ mergeParams: true }); // mergeParams is true to allow parameters from parent route to be passed through (brewery ID)
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Brewery = require('../models/brewery');
const Review = require('../models/review')
const { reviewSchema } = require('../schemas')

// ====================== VALIDATION =============================

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

// ======================= ROUTE SETUP ============================

// Post a review on a brewery
router.post('/', validateReview, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)
    const review = new Review(req.body.review)
    brewery.reviews.push(review)
    await review.save()
    await brewery.save()

    req.flash('success', `Your review has been added!`)
    res.redirect(`/breweries/${brewery._id}`)
}))


// Deleting a review
router.delete('/:reviewId', catchAsync(async (req, res, next) => {

    const { id, reviewId } = req.params

    // Pull any reviews from the 'reviews' array, where the reviewId is the same as the one we are deleting
    await Brewery.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)

    req.flash('success', `Your review has been removed!`)
    res.redirect(`/breweries/${id}`)
}))

module.exports = router



