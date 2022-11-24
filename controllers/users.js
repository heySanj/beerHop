const User = require('../models/user');
const passport = require('passport')

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.addUser = async (req, res, next) => {   

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

}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = async (req, res, next) => {   
    req.flash('success', `Welcome back, ${req.user.username}!`)    
    const redirectUrl = req.session.returnTo || '../breweries'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logoutUser = (req, res, next) => {
    req.logout(function(err){
        if (err) { return next(err); }
        req.flash('success', 'Logged you out, Goodbye!')
        res.redirect(`../breweries`)
    })
}