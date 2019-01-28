const connectToDatabase = require('../db')
const User = require('../user/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs-then')

module.exports.getToken = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false
	
	await connectToDatabase()

	try {
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

// Helper Methods
function signToken(id) {
	return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: 86400 })
}

async function getToken(eventBody) {
	let user = await User.findOne({ email: eventBody.email })
	return { auth: true, token: signToken(user._id) }
}
