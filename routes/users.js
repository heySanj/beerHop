const express = require('express')
const router = express.Router();
const { catchAsync } = require('../utils/middleware')
const userController = require('../controllers/users')
const User = require('../models/user');
const passport = require('passport')
// const { brewerySchema } = require('../schemas')

// ======================= ROUTE SETUP ============================

// Display registration page
router.get('/', (req, res) => res.redirect(`/breweries`))

router.route('/register')
    .get(userController.renderRegisterForm) // Display registration page
    .post(catchAsync(userController.addUser)) // Add a new user to the database

router.route('/login')
    .get(userController.renderLoginForm) // Display login page
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: 'login', keepSessionInfo: true }), catchAsync(userController.loginUser)) // Log a user in

router.get('/logout', userController.logoutUser)

module.exports = router