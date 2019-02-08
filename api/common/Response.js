module.exports = {
	// 204
	noContent: () => ({
		statusCode: 204,
	}),

	// 500
	genericError: err => ({
		statusCode: err.statusCode || 500,
		headers: { 'Content-Type': 'text/plain' },
		body: JSON.stringify({
			message: err.message,
		}),
	}),
};
