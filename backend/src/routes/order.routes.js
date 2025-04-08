const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

const router = express.Router();

// Используем контроллер для обработки маршрутов заказов
router.get('/', authenticate, orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.post('/', orderController.createOrder); // Убираем аутентификацию, чтобы гости могли размещать заказы
router.put('/:id/status', authenticate, orderController.updateOrderStatus);
router.delete('/:id', authenticate, authorize(['admin']), orderController.deleteOrder);

module.exports = router; 