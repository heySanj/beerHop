const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const User = require('../models/user');
const passport = require('passport')
// const { brewerySchema } = require('../schemas')

// ======================= ROUTE SETUP ============================

// Display registration page
router.get('/', (req, res) => {
    res.redirect(`./`)
})


// Display registration page
router.get('/register', (req, res) => {
    res.render('users/register')
})

// Add a new user to the database
router.post('/register', catchAsync(async (req, res, next) => {   

    try {
        const { email, username, password } = req.body.user // Pull data from registration form
        const user = new User({ email, username }) // Create new user with email and username    
        const registeredUser = await User.register(user, password) // Register the user with the submitted password

        // Log the user in (Must have a call back for some reason -> So just return the error if there is one)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', `Welcome to beerHop, ${username}!`)
            res.redirect(`../breweries`)
        })


    } catch(e) {
        req.flash('error', e.message)
        res.redirect(`register`)
    }

}))

// Display login page
router.get('/login', (req, res) => {
    res.render('users/login')
})

// Log a user in
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: 'login', keepSessionInfo: true }), catchAsync(async (req, res, next) => {   
    req.flash('success', `Welcome back, ${req.user.username}!`)    
    const redirectUrl = req.session.returnTo || '../breweries'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}))

router.get('/logout', (req, res, next) => {
    req.logout(function(err){
        if (err) { return next(err); }
        req.flash('success', 'Logged you out, Goodbye!')
        res.redirect(`../breweries`)
    })

})


module.exports = router