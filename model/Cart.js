const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  Petcode: {
    type: String,
    unique: true, // Set the unique option to true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  }
});

const CartModel = mongoose.model("Carts", CartItemSchema);
module.exports = CartModel;
