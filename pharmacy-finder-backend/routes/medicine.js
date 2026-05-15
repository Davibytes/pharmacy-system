const express = require('express');
const medicineController = require('../controllers/medicineController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/search', medicineController.searchMedicines);
router.get('/pharmacy/:pharmacyId', medicineController.getPharmacyMedicines);
router.post('/pharmacy/:pharmacyId', auth, medicineController.addMedicine);
router.put('/:medicineId', auth, medicineController.updateMedicine);
router.delete('/:medicineId', auth, medicineController.deleteMedicine);

module.exports = router;
