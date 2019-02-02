const connectToDatabase = require('../db')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs-then')
const res = require('./Response')

module.exports.getToken = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false
	
	await connectToDatabase()

	let body = JSON.parse(event.body)

	try {
		let user  = await User.findOne({ email: body.email })
		if (!user || !user.password) { 
			return res.noAccount()
		}

		let match = await checkPassword(body.password, user.password)
		if (!match) {
			return res.incorrectPassword()
		}

		let auth = await getToken(JSON.parse(event.body))
		return res.token(auth)

	} catch(err) {
		return res.genericError(err)
	}
}

module.exports.register = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false

	await connectToDatabase()

	let body = JSON.parse(event.body)

	// Since support users are loaded before creating accounts we need to 
	// allow them to add passwords to their existing accounts
	try {
		if (body.email.indexOf('@traveltek') == -1) { 
			return res.nonTraveltek()
		}

		let user = await User.findOne({ email: body.email })
		if (user && user.password) {
			return res.accountExists()
		}

		let password = await bcrypt.hash(body.password, 10)

		// TODO: should be an upsert
		if (user && user.id) {
			await User.update({ _id: user.id }, { password: password })
		} else {
			await User.collection.insert({ email: body.email, password: password })
		}

		return res.createdAccount()

	} catch(err) {
		res.genericError(err)
	}
}

// Helper Methods
function signToken(id) {
	return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: 86400 })
}

async function getToken(eventBody) {
	let user = await User.findOne({ email: eventBody.email })
	return { auth: true, token: signToken(user._id) }
}

async function checkPassword(reqPass, dbPass) {
	let match = await bcrypt.compare(reqPass, dbPass)
	return match
}
