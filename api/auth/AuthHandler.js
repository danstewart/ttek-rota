const connectToDatabase = require('../db')
const User = require('../user/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs-then')

module.exports.getToken = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false
	
	await connectToDatabase()

	let body = JSON.parse(event.body)

	try {
		let user  = await User.findOne({ email: body.email })
		let match = await checkPassword(body.password, user.password)

		if (!match) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					message: 'Incorrect password'
				})
			}
		}

		let auth = await getToken(JSON.parse(event.body))
		return {
			statusCode: 200,
			body: JSON.stringify(auth)
		}
	} catch(err) {
		return {
			statusCode: err.statusCode || 500,
			headers: { 'Content-Type': 'text/plain' },
			body: err.message
		}
	}
}

module.exports.register = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false

	await connectToDatabase()

	let body = JSON.parse(event.body)

	// Since we preload the users we need to add passwords for existing users
	// and sign up new users
	try {
		let user = await User.findOne({ email: body.email })

		if (user.password) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: 'A user with that email already exists'
				})
			}
		}

		let password = await bcrypt.hash(body.password, 10)

		// TODO: should be an upsert
		if (user.id) {
			await User.update({ _id: user.id }, { password: password })
		} else {
			await User.insert({ email: body.email, password: password })
		}

		return {
			status: 200,
			body: JSON.stringify({
				success: true,
				message: 'Successfully created account'
			})
		}

	} catch(err) {
		return {
			statusCode: err.statusCode || 500,
			headers: { 'Content-Type': 'text/plain' },
			body: err.message
		}
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
	console.log("Match: " + match)
	return match
}
