const router = require('express').Router();
const { register, login, refresh } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { registerSchema } = require('../validators/schemas');

router.post('/register', validate(registerSchema), register);
router.post('/login', login);
router.post('/refresh', refresh);
module.exports = router;
