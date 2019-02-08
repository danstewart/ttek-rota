let common = require('../common/Response');

module.exports = Object.assign(common, {
	// 200
	createdAccount: () => ({
		statusCode: 200,
		body: JSON.stringify({
			message: 'Successfully created account',
		}),
	}),

	token: auth => ({
		statusCode: 200,
		body: JSON.stringify(auth),
	}),

	// 401
	noAccount: () => ({
		statusCode: 401,
		body: JSON.stringify({
			message: 'User does not have an account',
		}),
	}),

	incorrectPassword: () => ({
		statusCode: 401,
		body: JSON.stringify({
			message: 'Incorrect password',
		}),
	}),

	// 403
	nonTraveltek: () => ({
		statusCode: 403,
		body: JSON.stringify({
			message: 'You must register with your Traveltek email address',
		}),
	}),

	notVerified: () => ({
		statusCode: 403,
		body: JSON.stringify({
			message: 'You must verify your email address before logging in',
		}),
	}),

	// 422
	accountExists: () => ({
		statusCode: 422,
		body: JSON.stringify({
			message: 'A user with that email already exists',
		}),
	}),
});
