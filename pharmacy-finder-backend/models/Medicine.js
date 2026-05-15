const mongoose = require('mongoose');

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
    imageUrl: String,
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

module.exports = mongoose.model('Medicine', medicineSchema);
