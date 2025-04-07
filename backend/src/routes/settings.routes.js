const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Временная заглушка для роутов настроек
router.get('/', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Маршрут для получения всех настроек',
    data: []
  });
});

router.get('/public', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Маршрут для получения публичных настроек',
    data: []
  });
});

router.get('/:key', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Маршрут для получения настройки с ключом: ${req.params.key}`,
    data: {}
  });
});

router.put('/:key', authenticate, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Маршрут для обновления настройки с ключом: ${req.params.key}`,
    data: { key: req.params.key, value: req.body.value }
  });
});

module.exports = router; 