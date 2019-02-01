const mongoose = require('mongoose')

// User model
const UserSchema = new mongoose.Schema({
	name:     String,
	email:    [String],
	shifts:   Boolean,
	password: String,
})

try {
	mongoose.model('User')
} catch {
	mongoose.model('User', UserSchema)
}

module.exports = mongoose.model('User')
