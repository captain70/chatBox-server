const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema(
	{
		name: { type: 'String', required: [true, 'Please provide a valid name'] },
		email: {
			type: 'String',
			unique: true,
			required: [true, 'Please provide a valid email'],
		},
		password: {
			type: 'String',
			required: [true, 'Please provide a password'],
		},
		picture: {
			type: 'String',
			default:
				'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
		},
		isAdmin: {
			type: Boolean,
			required: true,
			default: false,
		},
		status: {
			type: String,
			default: 'online',
		},
	},
	{ timestaps: true }
);
UserSchema.pre('save', async function () {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
	return jwt.sign(
		{ userId: this._id, name: this.name },
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_LIFETIME,
		}
	);
};

UserSchema.methods.comparePassword = async function (canditatePassword) {
	const isMatch = await bcrypt.compare(canditatePassword, this.password);
	return isMatch;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
