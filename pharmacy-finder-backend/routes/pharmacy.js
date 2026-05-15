const express = require('express');
const pharmacyController = require('../controllers/pharmacyController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/nearby', pharmacyController.getNearbyPharmacies);
router.get('/', pharmacyController.getAllPharmacies);
router.get('/:pharmacyId/stats', auth, pharmacyController.getPharmacyStats);
router.get('/:pharmacyId/details', auth, pharmacyController.getPharmacyDetails);
router.put('/:pharmacyId', auth, pharmacyController.updatePharmacy);
router.get('/:pharmacyId', pharmacyController.getPharmacyById);

module.exports = router;
