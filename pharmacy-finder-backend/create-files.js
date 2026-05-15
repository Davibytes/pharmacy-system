const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const dirs = ['models', 'controllers', 'routes'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

// Medicine Model
const medicineModel = `const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['tablet', 'capsule', 'liquid', 'injection', 'powder', 'other'],
      default: 'tablet',
    },
    expiryDate: Date,
    dosage: String,
    manufacturer: String,
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);`;

fs.writeFileSync('models/Medicine.js', medicineModel);
console.log('Created models/Medicine.js');

// Order Model
const orderModel = `const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    medicines: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
        },
        name: String,
        quantity: Number,
        price: Number,
        total: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    customerPhone: String,
    customerName: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);`;

fs.writeFileSync('models/Order.js', orderModel);
console.log('Created models/Order.js');

// Medicine Controller
const medicineController = `const Medicine = require('../models/Medicine');

exports.getPharmacyMedicines = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    console.log('Getting medicines for pharmacy:', pharmacyId);

    const medicines = await Medicine.find({ pharmacyId }).sort({ createdAt: -1 });

    res.json({
      message: 'Medicines retrieved successfully',
      medicines,
      count: medicines.length,
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { name, description, price, quantity, unit, expiryDate, dosage, manufacturer } = req.body;

    console.log('Adding medicine:', { name, price, quantity });

    if (!name || !price || quantity === undefined) {
      return res.status(400).json({ message: 'Name, price, and quantity are required' });
    }

    const medicine = new Medicine({
      pharmacyId,
      name,
      description,
      price,
      quantity,
      unit,
      expiryDate,
      dosage,
      manufacturer,
      inStock: quantity > 0,
    });

    await medicine.save();

    res.status(201).json({
      message: 'Medicine added successfully',
      medicine,
    });
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { name, description, price, quantity, unit, expiryDate, dosage, manufacturer } = req.body;

    console.log('Updating medicine:', medicineId);

    const medicine = await Medicine.findByIdAndUpdate(
      medicineId,
      {
        name,
        description,
        price,
        quantity,
        unit,
        expiryDate,
        dosage,
        manufacturer,
        inStock: quantity > 0,
      },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({
      message: 'Medicine updated successfully',
      medicine,
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;

    console.log('Deleting medicine:', medicineId);

    const medicine = await Medicine.findByIdAndDelete(medicineId);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({
      message: 'Medicine deleted successfully',
      medicine,
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ message: error.message });
  }
};`;

fs.writeFileSync('controllers/medicineController.js', medicineController);
console.log('Created controllers/medicineController.js');

// Order Controller
const orderController = `const Order = require('../models/Order');
const Medicine = require('../models/Medicine');

exports.getPharmacyOrders = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    console.log('Getting orders for pharmacy:', pharmacyId);

    const orders = await Order.find({ pharmacyId })
      .populate('customerId', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Orders retrieved successfully',
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customerId', 'fullName email')
      .populate('medicines.medicineId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customerId, pharmacyId, medicines, totalAmount, customerPhone, customerName, notes } = req.body;

    console.log('Creating order:', { customerId, pharmacyId, medicines });

    if (!customerId || !pharmacyId || !medicines || medicines.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    for (const item of medicines) {
      const medicine = await Medicine.findById(item.medicineId);
      if (medicine) {
        medicine.quantity -= item.quantity;
        medicine.inStock = medicine.quantity > 0;
        await medicine.save();
      }
    }

    const order = new Order({
      customerId,
      pharmacyId,
      medicines,
      totalAmount,
      customerPhone,
      customerName,
      notes,
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log('Updating order status:', { orderId, status });

    if (!['pending', 'confirmed', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('Cancelling order:', orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    for (const item of order.medicines) {
      const medicine = await Medicine.findById(item.medicineId);
      if (medicine) {
        medicine.quantity += item.quantity;
        medicine.inStock = medicine.quantity > 0;
        await medicine.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: error.message });
  }
};`;

fs.writeFileSync('controllers/orderController.js', orderController);
console.log('Created controllers/orderController.js');

// Medicine Routes
const medicineRoutes = `const express = require('express');
const medicineController = require('../controllers/medicineController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/pharmacy/:pharmacyId', medicineController.getPharmacyMedicines);
router.post('/pharmacy/:pharmacyId', auth, medicineController.addMedicine);
router.put('/:medicineId', auth, medicineController.updateMedicine);
router.delete('/:medicineId', auth, medicineController.deleteMedicine);

module.exports = router;`;

fs.writeFileSync('routes/medicine.js', medicineRoutes);
console.log('Created routes/medicine.js');

// Order Routes
const orderRoutes = `const express = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/pharmacy/:pharmacyId', auth, orderController.getPharmacyOrders);
router.get('/:orderId', auth, orderController.getOrder);
router.post('/', auth, orderController.createOrder);
router.put('/:orderId/status', auth, orderController.updateOrderStatus);
router.delete('/:orderId', auth, orderController.cancelOrder);

module.exports = router;`;

fs.writeFileSync('routes/order.js', orderRoutes);
console.log('Created routes/order.js');

console.log('\nAll backend files created successfully!');
