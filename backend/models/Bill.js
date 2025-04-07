const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'Pending',
      enum: ['Pending', 'Paid', 'Overdue', 'Cancelled']
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    receiptNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill; 