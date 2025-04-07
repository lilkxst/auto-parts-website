const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Временная заглушка для роутов клиентов
router.get('/', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Маршрут для получения клиентов',
    data: []
  });
});

router.get('/:id', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Маршрут для получения клиента с ID: ${req.params.id}`,
    data: {}
  });
});

router.post('/', authenticate, (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Маршрут для создания клиента',
    data: { ...req.body, id: 'temp-id' }
  });
});

router.put('/:id', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Маршрут для обновления клиента с ID: ${req.params.id}`,
    data: { ...req.body, id: req.params.id }
  });
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Маршрут для удаления клиента с ID: ${req.params.id}`,
    data: {}
  });
});

module.exports = router; 