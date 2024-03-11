const express = require('express');
const CartModel = require('../model/Cart');
const petmodel = require('../model/Pet');
const app = express.Router();

app.use(express.json());

// Route to get all items in the cart by userId
app.get('/fetchcart/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    // Find all documents in CartModel by userId
    const cartItems = await CartModel.find({ user: userId });

    // Extract all Petcode values from the cartItems
    const petcodes = cartItems.map((cartItem) => cartItem.Petcode);

    // Find all pets with the extracted Petcode values
    const petsInCart = await petmodel.find({ Petcode: { $in: petcodes } });

    res.status(200).json({ cartItems, petsInCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to add an item to the cart
app.post('/addcart', async (req, res) => {
  try {
    const { Petcode, userId } = req.body;

    // Save the item to the MongoDB database with user reference
    const newItem = new CartModel({ Petcode, user: userId });
    await newItem.save();

    res.status(201).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to delete an item from the cart
app.delete('/removecart/:petcode', async (req, res) => {
  try {
    const Petcode = req.params.petcode;
    console.log(Petcode);

    // Delete the item from the MongoDB database
    const deletedItem = await CartModel.findOneAndDelete({ Petcode });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted from the cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/count', async (req, res) => {
  try {
    // Get the count of items in the cart
    const itemCount = await CartModel.countDocuments();

    res.status(200).json({ itemCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = app;
