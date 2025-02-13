// src/controllers/order.controller.js
const Order = require('../models/Order');

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ seller: req.user.id })
            .populate('buyer', 'name phoneNumber')
            .populate('products', 'name price');

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            seller: req.user.id
        })
        .populate('buyer', 'name phoneNumber')
        .populate('products', 'name price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, seller: req.user.id },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};