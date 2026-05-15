const mongoose = require('mongoose');

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

module.exports = mongoose.model('Order', orderSchema);