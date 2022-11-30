const express = require('express');
const router = express.Router();
const { createChat, fetchChats } = require('../controllers/chatControllers');
const auth = require('../middleware/AuthMiddleware');

router.post('/', auth, createChat);
router.get('/', auth, fetchChats);

module.exports = router;
