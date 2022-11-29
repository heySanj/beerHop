const express = require('express')
const router = express.Router();

const { storage } = require('../utils/cloudinary')
const multer  = require('multer')
const upload = multer({ storage })

const breweryController = require('../controllers/breweries')
const { isLoggedIn, isCreator, isAuthor, validateBrewery, catchAsync } = require('../utils/middleware')


// ======================= ROUTE SETUP ============================

router.route('/')
    .get(catchAsync(breweryController.index)) // Show all breweries
    .post(isLoggedIn, isCreator, upload.array('image'), validateBrewery, catchAsync(breweryController.createBrewery)) // Posting a new brewery


// Add a brewery to the database
router.get('/new', isLoggedIn, isCreator, breweryController.renderNewForm)

router.route('/:id')
    .get(catchAsync(breweryController.showBrewery)) // Get brewery by ID and show details
    .put(isLoggedIn, isAuthor, upload.array('image'), validateBrewery, catchAsync(breweryController.updateBrewery)) // Updating a brewery
    .delete(isLoggedIn, isAuthor, catchAsync(breweryController.deleteBrewery)) // Deleting a brewery

// Edit a brewery
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(breweryController.renderEditForm))


module.exports = router