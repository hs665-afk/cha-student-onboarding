const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  donorEmail: {
    type: String,
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'XAF', 'NGN', 'KES', 'GHS']
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'mtn-momo', 'orange-money'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  message: {
    type: String
  },
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ paymentStatus: 1 });
// transactionId auto-indexed via unique: true, no need for explicit index

module.exports = mongoose.model('Donation', donationSchema);
