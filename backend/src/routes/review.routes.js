const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Временная заглушка для роутов отзывов
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Маршрут для получения отзывов',
    data: []
  });
});

router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Маршрут для получения отзыва с ID: ${req.params.id}`,
    data: {}
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Маршрут для создания отзыва',
    data: { ...req.body, id: 'temp-id', status: 'На модерации' }
  });
});

router.put('/:id', authenticate, authorize(['admin', 'manager']), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Маршрут для обновления отзыва с ID: ${req.params.id}`,
    data: { ...req.body, id: req.params.id }
  });
});

router.put('/:id/status', authenticate, authorize(['admin', 'manager']), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Маршрут для обновления статуса отзыва с ID: ${req.params.id}`,
    data: { id: req.params.id, status: req.body.status }
  });
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Маршрут для удаления отзыва с ID: ${req.params.id}`,
    data: {}
  });
});

module.exports = router;