const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  petcode: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: 'not specified', // Default value
  },
  status: {
    type: String,
    default: 'pending', // Default status set to 'pending'
  },
  deliveryStatus: {
    type: String,
    default: 'pending', // Default deliveryStatus set to 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

const OrderModel = mongoose.model('Order', orderSchema);

module.exports = OrderModel;
