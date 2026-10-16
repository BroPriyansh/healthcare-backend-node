const router = require('express').Router();
const c = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { patientSchema } = require('../validators/schemas');

router.use(authenticate);
router.route('/').post(validate(patientSchema), c.createPatient).get(c.listPatients);
router.route('/:id').get(c.getPatient).put(validate(patientSchema), c.updatePatient).delete(c.deletePatient);
module.exports = router;
