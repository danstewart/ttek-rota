const connectToDatabase = require('../db')
const User = require('../models/User')

module.exports.getUsers = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false

	await connectToDatabase()

	try {
		let users = await getUsers()

		return { 
			statusCode: 200,
			body: JSON.stringify(users)
		}
	} catch(err) {
		return {
			statusCode: err.statusCode || 500,
			headers: { 'Content-Type': 'text/plain' },
			body: JSON.stringify({ message: err.message })
		}
	}
}

// Helpers
function getUsers() {
	try {
		return User.find({ })
	} catch(err) {
		return Promise.reject(new Error(err))
	}
}
