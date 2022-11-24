const Brewery = require('../models/brewery');
const Review = require('../models/review')

module.exports.createReview = async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    brewery.reviews.push(review)
    await review.save()
    await brewery.save()

    req.flash('success', `Your review has been added!`)
    res.redirect(`/breweries/${brewery._id}`)
}

module.exports.deleteReview = async (req, res, next) => {

    const { id, reviewId } = req.params

    // Pull any reviews from the 'reviews' array, where the reviewId is the same as the one we are deleting
    await Brewery.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)

    req.flash('success', `Your review has been removed!`)
    res.redirect(`/breweries/${id}`)
}