const connectToDatabase = require('../db');
const User = require('../models/User');
const token = require('./Token');
const bcrypt = require('bcryptjs-then');
const res = require('./Response');
const sendgrid = require('@sendgrid/mail');

module.exports.getToken = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false;

	await connectToDatabase();

	let body = JSON.parse(event.body);

	try {
		let user = await User.findOne({ email: body.email });
		if (!user || !user.password) {
			return res.noAccount();
		}

		if (user && !user.verified) {
			return res.notVerified();
		}

		let match = await checkPassword(body.password, user.password);
		if (!match) {
			return res.incorrectPassword();
		}

		let auth = await getToken(JSON.parse(event.body));
		return res.token(auth);
	} catch (err) {
		return res.genericError(err);
	}
};

module.exports.register = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false;

	await connectToDatabase();

	let body = JSON.parse(event.body);

	// Since support users are loaded before creating accounts we need to
	// allow them to add passwords to their existing accounts
	try {
		if (body.email.indexOf('@traveltek') == -1) {
			return res.nonTraveltek();
		}

		let user = await User.findOne({ email: body.email });
		if (user && user.password) {
			return res.accountExists();
		}

		let password = await bcrypt.hash(body.password, 10);

		// TODO: should be an upsert
		if (user && user.id) {
			await User.update({ _id: user.id }, { password: password });
		} else {
			await User.collection.insert({ email: body.email, password: password });
		}

		// Send email with login token
		const auth = await getToken(JSON.parse(event.body));
		const link = `${process.env.URL}/auth?token=${auth.token}&verify=1`;

		const msg = {
			to: body.email,
			from: 'Ttek Rota <rota@traveltek.net>',
			subject: 'Welcome to the Ttek Rota',
			text: `Click the below link to log in:\n${link}`,
			html: `Click <a href="${link}">here</a> to log in.`,
		};

		sendgrid.setApiKey(process.env.SENDGRID_KEY);
		sendgrid.send(msg);

		return res.createdAccount();
	} catch (err) {
		res.genericError(err);
	}
};

module.exports.verify = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false;

	await connectToDatabase();

	let body = JSON.parse(event.body);

	try {
		let payload = token.verify(body.token);
		let user = await User.findOne({ email: payload.email });

		if (user) {
			await User.update({ _id: user.id }, { verified: true });
		} else {
			return res.noAccount();
		}

		console.log(res.noContent());
		return res.noContent();
	} catch (err) {
		res.genericError(err);
	}
};

// Helper Methods
async function getToken(eventBody) {
	let user = await User.findOne({ email: eventBody.email });
	return { auth: true, token: token.sign(user._id, eventBody.email) };
}

async function checkPassword(reqPass, dbPass) {
	let match = await bcrypt.compare(reqPass, dbPass);
	return match;
}
