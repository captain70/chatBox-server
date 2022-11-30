const User = require('../models/userModel');

//@description     Get or Search all users
//@route           GET /api/user?search=
const allUsers = async (req, res) => {
	const keyword = req.query.search
		? {
				$or: [
					{ name: { $regex: req.query.search, $options: 'i' } },
					{ email: { $regex: req.query.search, $options: 'i' } },
				],
		  }
		: {};

	const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
	res.send({ users });

	// return res.status(200).json({ users });
};

//@description     Register new user
//@route           POST /api/user/register
const register = async (req, res) => {
	const { name, email, password, picture } = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({ message: 'Please Enter all the Feilds' });
	}
	// check for existing user
	try {
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: 'User already created' });
		}
		// create a new user
		const user = await User.create({ ...req.body });

		const token = user.createJWT();
		return res.status(200).json({
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				picture: user.picture,
				isAdmin: user.isAdmin,
				status: user.status,
				token,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

//@description     Auth the user
//@route           POST /api/users/login
const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(400)
			.json({ message: 'Please provide email and password' });
	}
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'Invalid email and password' });
		}
		const isPasswordCorrect = await user.comparePassword(password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ message: 'Invalid email and password' });
		}
		// compare password
		const token = user.createJWT();
		return res.status(200).json({
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				picture: user.picture,
				isAdmin: user.isAdmin,
				status: user.status,
				token,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	register,
	login,
	allUsers,
};
