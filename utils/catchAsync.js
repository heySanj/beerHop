// Error wrapper function
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}

// ---------- Old version ------------
// function asyncErrorWrapper(fn){
//     return function(req, res, next){
//         fn(req, res, next).catch(error => next(error))
//     }
// }