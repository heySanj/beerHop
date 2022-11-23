const Brewery = require('../models/brewery');
const ExpressError = require('../utils/ExpressError')
const Review = require('../models/review')
const { brewerySchema, reviewSchema } = require('../schemas')


// Middleware that ensures a user is logged in before accessing route
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl // Store the page URL the user was trying to access before being redirected to the login page
        req.flash('error', 'You must be signed in to do that!')
        return res.redirect('../../../user/login')
    }
    next()
}

module.exports.isAuthor = async (req, res, next) => {

    const { id } = req.params

    // Find the brewery and check to see if the author is logged in
    const brewery = await Brewery.findById(id)
    if (!brewery.author.equals(req.user._id)) {
        req.flash('error', `You do not have permission to do that!`)
        return res.redirect(`../../../breweries/${brewery._id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {

    const { id, reviewId } = req.params // destructure brewery ID and review ID

    // Find the Review and check to see if the author is logged in
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', `You do not have permission to do that!`)
        return res.redirect(`../../../breweries/${id}`)
        
    }
    next()
}


// ====================== VALIDATION =============================

module.exports.validateBrewery = (req, res, next) => {

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

module.exports.validateReview = (req, res, next) => {
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

// ====================== ERROR WRAPPER =============================

module.exports.catchAsync = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}