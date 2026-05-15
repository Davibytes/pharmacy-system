const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PharmacySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    pharmacyName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      default: 'admin',
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    openingDays: {
      Monday: { type: Boolean, default: true },
      Tuesday: { type: Boolean, default: true },
      Wednesday: { type: Boolean, default: true },
      Thursday: { type: Boolean, default: true },
      Friday: { type: Boolean, default: true },
      Saturday: { type: Boolean, default: true },
      Sunday: { type: Boolean, default: false },
    },
    openingHours: {
      open: { type: String, default: '08:00' }, // HH:MM format
      close: { type: String, default: '20:00' }, // HH:MM format
    },
    resetPasswordTokenHash: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Create geospatial index
PharmacySchema.index({ location: '2dsphere' });

// Hash password before saving
PharmacySchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
PharmacySchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Pharmacy', PharmacySchema);
