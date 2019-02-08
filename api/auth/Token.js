const jwt = require('jsonwebtoken');

module.exports = {
	sign: (id, email) => {
		return jwt.sign({ id: id, email: email }, process.env.JWT_SECRET, { expiresIn: 86400 });
	},

	verify: token => {
		return jwt.verify(token, process.env.JWT_SECRET);
	},
};
