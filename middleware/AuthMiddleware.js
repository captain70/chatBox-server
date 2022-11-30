const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
	// check header
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer')) {
		res.status(401);
		throw new Error('Authentication invalid');
	}
	const token = authHeader.split(' ')[1];

	try {
		//decodes token id
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// attach the user to the job routes
		// req.user = { userId: decoded.userId, name: decoded.name };
		req.user = await User.findById(decoded.userId).select('-password');
		next();
	} catch (error) {
		res.status(401);
		throw new Error('Authentication invalid');
	}
};

module.exports = auth;
