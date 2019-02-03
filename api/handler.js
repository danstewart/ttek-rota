'use strict';

const db = require('./db');

module.exports.hello = async (event, context) => {
	const data = await db.getToken();
	return { statusCode: 200, body: JSON.stringify(data) };
};
