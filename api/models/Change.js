const mongoose = require('mongoose');

// Rota change model
const ChangeSchema = new mongoose.Schema({
	date: String,
	person: String,
	before: String,
	after: String,
	pending: Boolean,
	changedBy: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},
});

try {
	mongoose.model('Change');
} catch {
	mongoose.model('Change', ChangeSchema);
}

module.exports = mongoose.model('Change');
