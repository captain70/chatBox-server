const Chat = require('../models/chatModel');
const User = require('../models/userModel');

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const createChat = async (req, res) => {
	const { userId } = req.body;

	if (!userId) {
		console.log('UserId param not sent with request');
		return res.sendStatus(400);
	}

	// find a chat with the provided userId and currently logged user's id.
	var isChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: req.user._id } } },
			{ users: { $elemMatch: { $eq: userId } } },
		],
	})
		.populate('users', '-password')
		.populate('latestMessage');

	isChat = await User.populate(isChat, {
		path: 'latestMessage.sender',
		select: 'name picture email',
	});
	// check if chat exists
	if (isChat.length > 0) {
		res.send(isChat[0]);
	}
	// otherwise create one with the two Ids
	else {
		var chatData = {
			chatName: 'sender',
			isGroupChat: false,
			users: [req.user._id, userId],
		};

		try {
			const createdChat = await Chat.create(chatData);
			const CompleteChat = await Chat.findOne({
				_id: createdChat._id,
			}).populate('users', '-password');
			res.status(200).json(CompleteChat);
		} catch (error) {
			res.status(400);
			throw new Error(error.message);
		}
	}
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = async (req, res) => {
	try {
		Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
			.populate('users', '-password')
			.populate('latestMessage')
			.sort({ updatedAt: -1 })
			.then(async (results) => {
				results = await User.populate(results, {
					path: 'latestMessage.sender',
					select: 'name picture email',
				});
				res.status(200).send(results);
			});
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
};

module.exports = {
	createChat,
	fetchChats,
};
