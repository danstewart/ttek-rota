const mongoose = require('mongoose');
let isConnected;

module.exports = connectToDatabase = async () => {
	if (isConnected) {
		return Promise.resolve();
	}

	let db = await mongoose.connect(process.env.DB);
	isConnected = db.connections[0].readyState;
};
