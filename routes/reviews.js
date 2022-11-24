const express = require('express')
const router = express.Router({ mergeParams: true }); // mergeParams is true to allow parameters from parent route to be passed through (brewery ID)
const reviewController = require('../controllers/reviews')
const { isLoggedIn, isReviewAuthor, validateReview, catchAsync } = require('../utils/middleware')

// ======================= ROUTE SETUP ============================

// Post a review on a brewery
router.post('/', validateReview, isLoggedIn, catchAsync(reviewController.createReview))


// Deleting a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview))

module.exports = router



