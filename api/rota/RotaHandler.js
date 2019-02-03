const connectToDatabase = require('../db');
const User = require('../models/User');
const Change = require('../models/Change');
const res = require('./Response');

module.exports.submitChange = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false;

	await connectToDatabase();

	let body = JSON.parse(event.body);

	try {
		let user = await User.findOne({ email: body.email });

		// TODO: Validate params and insert record

		// await Change.collection.insert({
		// 	changedBy: user._id,
		// 	before: 'Day',
		// 	after: 'Back',
		// 	person: 'Dan',
		// 	date: '21 Jan 19'
		// })

		return res.noContent();
	} catch (err) {
		return res.genericError(err);
	}
};

module.exports.getChanges = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false;

	await connectToDatabase();

	// TODO: Validate params
	let params = event.queryStringParameters;

	try {
		let changes = await Change.find(params).populate('changedBy');

		return {
			statusCode: 200,
			body: JSON.stringify(changes),
		};
	} catch (err) {}
};
