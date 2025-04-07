const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Количество должно быть не менее 1']
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Сумма заказа должна быть положительной']
  },
  status: {
    type: String,
    enum: ['Ожидает обработки', 'Подтвержден', 'Отправлен', 'Доставлен', 'Отменен'],
    default: 'Ожидает обработки'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Россия' }
  },
  paymentMethod: {
    type: String,
    enum: ['Наличные', 'Банковская карта', 'Онлайн-оплата'],
    default: 'Наличные'
  },
  paymentStatus: {
    type: String,
    enum: ['Ожидает оплаты', 'Оплачен', 'Отменен'],
    default: 'Ожидает оплаты'
  },
  deliveryMethod: {
    type: String,
    enum: ['Самовывоз', 'Курьер', 'Почта'],
    default: 'Самовывоз'
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Скидка не может быть отрицательной']
  }
}, {
  timestamps: true
});

// Генерация номера заказа перед сохранением
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Получить последний заказ для генерации последовательного номера
    const lastOrder = await this.constructor.findOne(
      {}, 
      {}, 
      { sort: { 'createdAt': -1 } }
    );
    
    let counter = 1;
    if (lastOrder && lastOrder.orderNumber) {
      // Если существует предыдущий заказ, извлечь и увеличить счетчик
      const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2] || '0');
      counter = lastNumber + 1;
    }
    
    // Формат: AP-YYMM-COUNTER (например, AP-2304-42)
    this.orderNumber = `AP-${year}${month}-${counter.toString().padStart(3, '0')}`;
  }
  next();
});

// Виртуальное поле для количества товаров
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 