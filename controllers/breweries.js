const Brewery = require('../models/brewery');

module.exports.index = async (req, res, next) => {
    const breweries = await Brewery.find({})  
    res.render('home', { breweries })
}

module.exports.renderNewForm =  (req, res) => {
    res.render('breweries/new')
}

module.exports.createBrewery = async (req, res, next) => {   
    const newBrewery = new Brewery(req.body.brewery)
    newBrewery.author = req.user._id
    await newBrewery.save()

    req.flash('success', `Successfully added ${newBrewery.name}!`)
    res.redirect(`/breweries/${newBrewery._id}`)
}

module.exports.showBrewery = async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id).populate({
        // Populate reveiws and then populate the author of each review
        path: 'reviews',        
        populate: {
            path: 'author'
        }
    }).populate('author') // And also populate the author of each Brewery

    if(!brewery){
        req.flash('error', 'Sorry, that brewery could not be found. 😞')
        return res.redirect('/breweries')
    }

    res.render('breweries/details', { brewery })
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params
    const brewery = await Brewery.findById(id)

    if(!brewery){
        req.flash('error', 'Sorry, that brewery could not be found. 😞')
        return res.redirect('/breweries')
    }
    
    res.render('breweries/edit', { brewery })
}

module.exports.updateBrewery = async (req, res, next) => {
    
    const { id } = req.params
    const updatedBrewery = await Brewery.findByIdAndUpdate(id, req.body.brewery, {runValidators: true, new: true})
    req.flash('success', `Successfully updated ${updatedBrewery.name}!`)

    res.redirect(`/breweries/${updatedBrewery._id}`)
}

module.exports.deleteBrewery = async (req, res, next) => {

    const { id } = req.params
    const deletedBrewery = await Brewery.findByIdAndDelete(id)
    req.flash('success', `Successfully deleted ${deletedBrewery.name}!`)
    res.redirect(`/breweries`)
}