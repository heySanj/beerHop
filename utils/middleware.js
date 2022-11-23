// Middleware that ensures a user is logged in before accessing route
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl // Store the page URL the user was trying to access before being redirected to the login page
        req.flash('error', 'You must be signed in to do that!')
        return res.redirect('../../../user/login')
    }
    next()
}