const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Optional price per item at time of order; useful for audit/calculation.
    price: {
      type: Number,
      min: 0,
    },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one item is required in an order.',
      },
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Using Mixed lets us store either a plain slot label or an ObjectId ref to a Slot/TimeSlot doc.
    timeSlot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'PAID', 'PREPARING', 'READY', 'CANCELLED'],
      default: 'PENDING',
      required: true,
    },
    paymentTokenRef: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentToken',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);
