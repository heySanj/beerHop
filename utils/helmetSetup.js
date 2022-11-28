const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dx5amze3b/",
    "https://fonts.googleapis.com/",
    "https://unpkg.com/scrollreveal",
    "https://kit.fontawesome.com/",
    "https://ka-f.fontawesome.com/"
]
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://kit.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dx5amze3b/",
    "https://ka-f.fontawesome.com/"
]
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dx5amze3b/",
    "https://fonts.googleapis.com/",
    "https://ka-f.fontawesome.com/"
]
const fontSrcUrls = [ 
    "https://res.cloudinary.com/dx5amze3b/",
    "https://fonts.googleapis.com/",
    "https://fonts.gstatic.com/",
    "https://kit.fontawesome.com/",
    "https://ka-f.fontawesome.com/"
]

module.exports.helmetSettings = {
    contentSecurityPolicy: {
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dx5amze3b/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
                "https://s.gravatar.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dx5amze3b/" ],
            childSrc   : [ "blob:" ],
        }
    },
    crossOriginEmbedderPolicy: false
}