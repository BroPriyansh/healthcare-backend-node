const router = require('express').Router();
const c = require('../controllers/doctorController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { doctorSchema } = require('../validators/schemas');

router.use(authenticate);
router.route('/').post(validate(doctorSchema), c.createDoctor).get(c.listDoctors);
router.route('/:id').get(c.getDoctor).put(validate(doctorSchema), c.updateDoctor).delete(c.deleteDoctor);
module.exports = router;
