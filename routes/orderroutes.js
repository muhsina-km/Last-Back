const express = require('express');
const OrderModel = require('../model/order');
const app = express.Router();
const petmodel = require('../model/Pet');
const UserModel = require('../model/Signup')


app.use(express.json());

// Route to create a new order
app.post('/createorder', async (req, res) => {
  try {
    const { userId, petcode } = req.body;

    // Validate userId and petcode before proceeding
    // You might want to add additional validation logic here

    const newOrder = new OrderModel({
      user: userId,
      petcode,
    });

    await newOrder.save();

    res.status(201).json({ message: 'Order created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get orders by userId
app.get('/fetchorders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    

    // Find all orders by userId
    const orders = await OrderModel.find({ user: userId });

    // Extract all petcodes from the orders
    const petcodes = orders.map((order) => order.petcode);

    // Find all pets with the extracted petcodes
    const petsInOrders = await petmodel.find({ Petcode: { $in: petcodes } });

    // Modify petsInOrders to include orderId, status, and deliveryStatus within each pet object
    const petsWithOrderId = petsInOrders.map((pet) => {
      const order = orders.find((order) => order.petcode === pet.Petcode);
      return { 
        ...pet.toObject(),
        orderId: order._id,
        address: order.address,
        status: order.status,
        deliveryStatus: order.deliveryStatus
      };
    });

    res.status(200).json({ petsInOrders: petsWithOrderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// // Route to get all orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await OrderModel.find().populate('user', 'username'); // Populate user details

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to update address, status, and deliveryStatus by order ID
app.post('/placeorder/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { address } = req.body;

    // Input Validation
    if (!orderId || !address) {
      return res.status(400).json({ message: 'orderId and address are required' });
    }

    // Find the order by ID and update its fields
    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, {
      address: address,
      status: 'placed',
      deliveryStatus: 'Processing',
    }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to update delivery status by order ID
app.post('/updatedeliverystatus/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { deliveryStatus } = req.body;

    // Input Validation
    if (!orderId || !deliveryStatus) {
      return res.status(400).json({ message: 'orderId and deliveryStatus are required' });
    }

    // Find the order by ID and update its deliveryStatus field
    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, {
      deliveryStatus: deliveryStatus
    }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Delivery status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get all orders with associated pets
// Route to get all orders with associated pets
// Route to get all orders with associated pets and user data
app.get('/allorders', async (req, res) => {
  try {
    // Find all orders
    const orders = await OrderModel.find();

    // Map each order to fetch associated pet data and user data
    const ordersWithPetsAndUsers = await Promise.all(orders.map(async (order) => {
      // Find the pet data corresponding to the petcode in the order
      const pet = await petmodel.findOne({ Petcode: order.petcode });

      // Find the user data corresponding to the user in the order
      const user = await UserModel.findById(order.user);

      // Construct the response object
      return {
        orderId: order._id,
        address: order.address,
        user: user ? { _id: user._id, username: user.username } : null,
        pet: pet ? { ...pet.toObject(), orderId: order._id, status: order.status, deliveryStatus: order.deliveryStatus } : null
      };
    }));

    res.status(200).json({ ordersWithPetsAndUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to delete an order by order ID
app.delete('/deleteorder/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Input Validation
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    // Find the order by ID and delete it
    const deletedOrder = await OrderModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully', deletedOrder });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Additional routes or modifications based on your requirements

module.exports = app;
