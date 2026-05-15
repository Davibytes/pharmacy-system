const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    userType: { type: String, enum: ['customer'], default: 'customer' },
    resetPasswordCodeHash: { type: String, select: false },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordCode: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    resetPasswordAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
