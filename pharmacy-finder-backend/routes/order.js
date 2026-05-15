const express = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/pharmacy/:pharmacyId', auth, orderController.getPharmacyOrders);
router.get('/:orderId', auth, orderController.getOrder);
router.post('/', auth, orderController.createOrder);
router.put('/:orderId/status', auth, orderController.updateOrderStatus);
router.delete('/:orderId', auth, orderController.cancelOrder);

module.exports = router;