const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String },
    apartment: { type: String }
  },
  orderDetails: {
    items: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, default: 1 },
      image: { type: String },
      category: { type: String }
    }],
    delivery: { type: String, required: true, enum: ['pickup', 'delivery'] },
    payment: { type: String, required: true, enum: ['cash', 'card'] },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    comment: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderDate: { type: Date, default: Date.now },
  emailSent: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema); 