const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')


const UserSchema = new Schema({
    // Only email is needed as username/passport will be dealt with passport
    email: {
        type: String,
        required: true,
        unique: true
    },
    userAuthority: {
        type: String,
        enum: ['admin', 'editor', 'user'],
        default: 'user',
        required: true
    }
})

// PassportLocalMongoose will add a username, password, hash and salt fields to the UserSchema
// Along with some methods
UserSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', UserSchema)

module.exports = User