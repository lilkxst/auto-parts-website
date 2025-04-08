const Order = require('../models/order.model');
const { sendOrderConfirmation } = require('../utils/emailSender');

// Создать новый заказ
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Если мы в демо-режиме, то просто генерируем ответ
    if (global.useDemoMode) {
      console.log('[DEMO] Creating order:', orderData);
      
      // Отправка уведомления на email (в демо-режиме просто логируется)
      await sendOrderConfirmation(orderData);
      
      // Создаем демо-ответ
      const demoResponse = {
        success: true,
        message: 'Order created successfully (demo mode)',
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        orderDate: new Date().toISOString()
      };
      
      return res.status(201).json(demoResponse);
    }
    
    // В реальном режиме создаем заказ в базе данных
    const order = new Order(orderData);
    await order.save();
    
    // Отправляем уведомление на email
    const emailResult = await sendOrderConfirmation(orderData);
    console.log('Email sending result:', emailResult);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: order._id,
      orderDate: order.createdAt,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Получить все заказы
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Получить заказ по ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Обновить статус заказа
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Удалить заказ
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
}; 