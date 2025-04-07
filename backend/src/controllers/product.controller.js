const Product = require('../models/product.model');
const { validationResult } = require('express-validator');

/**
 * @desc    Получение всех товаров с фильтрацией, сортировкой и пагинацией
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Формируем объект для фильтрации
    let filter = {};
    
    // Фильтрация по активности товара
    if (req.query.active) {
      filter.active = req.query.active === 'true';
    }
    
    // Фильтрация по категории
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Фильтрация по бренду
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }
    
    // Фильтрация по цене
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Фильтрация по избранным товарам
    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }
    
    // Фильтрация по наличию
    if (req.query.inStock) {
      filter.stock = { $gt: 0 };
    }
    
    // Поиск по ключевому слову (в названии, описании, бренду и категории)
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Формируем объект для сортировки
    let sort = {};
    
    // Сортировка по указанному полю и направлению
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      // По умолчанию сортировка по дате создания (новые в начале)
      sort.createdAt = -1;
    }
    
    // Получаем общее количество товаров, соответствующих фильтру
    const total = await Product.countDocuments(filter);
    
    // Получаем товары с учетом фильтрации, сортировки и пагинации
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: products
    });
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении товаров',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Получение товара по ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    
    // Проверяем, является ли ошибка ошибкой невалидного ID
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Невалидный ID товара'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении товара',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Создание нового товара
 * @route   POST /api/products
 * @access  Private (admin, manager)
 */
exports.createProduct = async (req, res) => {
  try {
    // Проверяем ошибки валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Создаем новый товар
    const product = new Product(req.body);
    
    // Сохраняем товар в базе данных
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Товар успешно создан',
      data: product
    });
  } catch (error) {
    console.error('Ошибка создания товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании товара',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Обновление товара
 * @route   PUT /api/products/:id
 * @access  Private (admin, manager)
 */
exports.updateProduct = async (req, res) => {
  try {
    // Проверяем ошибки валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Находим и обновляем товар
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Товар успешно обновлен',
      data: product
    });
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    
    // Проверяем, является ли ошибка ошибкой невалидного ID
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Невалидный ID товара'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении товара',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Удаление товара
 * @route   DELETE /api/products/:id
 * @access  Private (admin)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }
    
    await product.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Товар успешно удален',
      data: {}
    });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    
    // Проверяем, является ли ошибка ошибкой невалидного ID
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Невалидный ID товара'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении товара',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Загрузка изображения товара
 * @route   POST /api/products/:id/upload
 * @access  Private (admin, manager)
 */
exports.uploadProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Пожалуйста, загрузите файл'
      });
    }
    
    // Получаем путь к файлу относительно сервера
    const filePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
    const imageUrl = `uploads/${filePath}`;
    
    // Обновляем массив изображений товара
    product.images.push(imageUrl);
    
    // Если это первое изображение или не задано главное, делаем его главным
    if (!product.mainImage || product.mainImage === 'default-product.jpg') {
      product.mainImage = imageUrl;
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Изображение успешно загружено',
      data: {
        imageUrl,
        product
      }
    });
  } catch (error) {
    console.error('Ошибка загрузки изображения товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при загрузке изображения',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Установка главного изображения товара
 * @route   PUT /api/products/:id/main-image
 * @access  Private (admin, manager)
 */
exports.setMainImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL изображения обязателен'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }
    
    // Проверяем, есть ли такое изображение у товара
    if (!product.images.includes(imageUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Указанное изображение не найдено у данного товара'
      });
    }
    
    // Устанавливаем главное изображение
    product.mainImage = imageUrl;
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Главное изображение успешно обновлено',
      data: product
    });
  } catch (error) {
    console.error('Ошибка установки главного изображения:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при установке главного изображения',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Получение уникальных брендов товаров
 * @route   GET /api/products/brands
 * @access  Public
 */
exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    
    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    console.error('Ошибка получения брендов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении брендов',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 