const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название товара обязательно'],
    trim: true,
    maxlength: [100, 'Название товара не должно превышать 100 символов']
  },
  sku: {
    type: String,
    unique: true,
    required: [true, 'Артикул товара обязателен'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Категория товара обязательна'],
    enum: ['Шины', 'Масла', 'Фильтры', 'Тормоза', 'Аккумуляторы', 'Аксессуары', 'Электроника', 'Прочее']
  },
  brand: {
    type: String,
    required: [true, 'Бренд товара обязателен'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Цена товара обязательна'],
    min: [0, 'Цена должна быть положительным числом']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Цена со скидкой должна быть положительным числом'],
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'Количество на складе обязательно'],
    min: [0, 'Количество не может быть отрицательным'],
    default: 0
  },
  images: [{
    type: String,
    default: 'default-product.jpg'
  }],
  mainImage: {
    type: String,
    default: 'default-product.jpg'
  },
  featured: {
    type: Boolean,
    default: false
  },
  specifications: {
    type: Map,
    of: String
  },
  averageRating: {
    type: Number,
    min: [0, 'Минимальный рейтинг 0'],
    max: [5, 'Максимальный рейтинг 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальное поле для отображения статуса наличия
productSchema.virtual('status').get(function() {
  if (this.stock <= 0) return 'Нет в наличии';
  if (this.stock < 5) return 'Осталось мало';
  return 'В наличии';
});

// Виртуальное поле для связи с отзывами
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

// Индексы для ускорения поиска
productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 