const Order = require('../models/Order');
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
};