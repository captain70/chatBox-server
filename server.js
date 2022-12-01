require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// database configuration
const connectDB = require('./db_connection/connect');
const User = require('./models/userModel');
const Message = require('./models/messageModel');
const Chat = require('./models/chatModel');

// routes
const chatRouter = require('./routes/chatRoute');
const messageRouter = require('./routes/messageRoute');
const userRouter = require('./routes/userRoute');

// middleware
const authMiddleware = require('./middleware/AuthMiddleware');
const errorMiddleware = require('./middleware/ErrorMiddleware');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);
app.use('/api/user', userRouter);

const server = require('http').createServer(app);
const port = process.env.PORT || 5001;
const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI, console.log('Database Connected'));
		server.listen(port, () =>
			console.log(`Server is listening on port ${port}...`)
		);
	} catch (error) {
		console.log(error);
	}
};

start();
// socket connection
const io = require('socket.io')(server, {
	// pingTimeout: 60000, helps saves bandwidth by going off when not in use
	cors: {
		origin: process.env.ORIGIN,
		// credentials: true,
	},
});
let activeUsers = [];

// socket start
io.on('connection', (socket) => {
	// new user added
	console.log('Connected to socket.io');
	socket.on('start', (userData) => {
		socket.join(userData._id);
		if (!activeUsers.some((user) => user.userId === userData._id)) {
			activeUsers.push({ userId: userData._id, socketId: socket.id });
			console.log('New User Connected', activeUsers);
		}
		socket.emit('connected', activeUsers);
	});

	socket.on('join-chat', (room) => {
		socket.join(room);
		console.log('User Joined Room: ' + room);
	});

	// sending new message to other users in room
	socket.on('new-message', (newMessageRecieved) => {
		var chat = newMessageRecieved.chat;

		if (!chat.users) return console.log('chat users not defined');

		chat.users.forEach((user) => {
			if (user._id == newMessageRecieved.sender._id) return;

			socket.in(user._id).emit('message-recieved', newMessageRecieved);
		});
	});

	socket.on('disconnect', () => {
		// remove user from active users
		activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
		console.log('User Disconnected', activeUsers);
		// socket.leave(userData._id);
		socket.emit('connected', activeUsers);
	});
});
