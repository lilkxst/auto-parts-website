const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Рейтинг обязателен'],
    min: [1, 'Минимальный рейтинг 1'],
    max: [5, 'Максимальный рейтинг 5']
  },
  title: {
    type: String,
    trim: true
  },
  text: {
    type: String,
    required: [true, 'Текст отзыва обязателен'],
    trim: true
  },
  status: {
    type: String,
    enum: ['На модерации', 'Одобрен', 'Отклонен'],
    default: 'На модерации'
  },
  moderatorComment: {
    type: String,
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Индексы для ускорения поиска
reviewSchema.index({ product: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });

// Обновление рейтинга товара после добавления/изменения/удаления отзыва
reviewSchema.post('save', async function() {
  await updateProductRating(this.product);
});

reviewSchema.post('findOneAndUpdate', async function(doc) {
  await updateProductRating(doc.product);
});

reviewSchema.post('remove', async function() {
  await updateProductRating(this.product);
});

async function updateProductRating(productId) {
  const Product = mongoose.model('Product');
  
  // Получаем все одобренные отзывы для продукта
  const reviews = await mongoose.model('Review').find({
    product: productId,
    status: 'Одобрен'
  });
  
  // Рассчитываем средний рейтинг
  let averageRating = 0;
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    averageRating = totalRating / reviews.length;
  }
  
  // Обновляем продукт
  await Product.findByIdAndUpdate(productId, {
    averageRating: parseFloat(averageRating.toFixed(1)),
    reviewCount: reviews.length
  });
}

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 