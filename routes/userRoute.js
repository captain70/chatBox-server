const express = require('express');
const router = express.Router();
const { register, login, allUsers } = require('../controllers/userControllers');
const auth = require('../middleware/AuthMiddleware');

router.get('/', auth, allUsers);
router.post('/register', register);
router.post('/login', login);

module.exports = router;
