const express = require('express')
const router = express.Router();
const breweryController = require('../controllers/breweries')
const { isLoggedIn, isAuthor, validateBrewery, catchAsync } = require('../utils/middleware')


// ======================= ROUTE SETUP ============================

router.route('/')
    .get(catchAsync(breweryController.index)) // Show all breweries
    .post(isLoggedIn, validateBrewery, catchAsync(breweryController.createBrewery)) // Posting a new brewery

// Add a brewery to the database
router.get('/new', isLoggedIn, breweryController.renderNewForm)

router.route('/:id')
    .get(catchAsync(breweryController.showBrewery)) // Get brewery by ID and show details
    .put(isLoggedIn, isAuthor, validateBrewery, catchAsync(breweryController.updateBrewery)) // Updating a brewery
    .delete(isLoggedIn, isAuthor, catchAsync(breweryController.deleteBrewery)) // Deleting a brewery

// Edit a brewery
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(breweryController.renderEditForm))


module.exports = router