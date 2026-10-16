const router = require('express').Router();
const c = require('../controllers/mappingController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { mappingSchema } = require('../validators/schemas');

router.use(authenticate);
router.post('/', validate(mappingSchema), c.createMapping);
router.get('/', c.listMappings);
router.get('/:patient_id', c.getPatientDoctors);
router.get('/patient/:patient_id', c.getPatientDoctors); // readable alias
router.delete('/:id', c.deleteMapping);
module.exports = router;
