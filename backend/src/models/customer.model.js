const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Фамилия обязательна'],
    trim: true
  },
  patronymic: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Пожалуйста, введите корректный email']
  },
  phone: {
    type: String,
    required: [true, 'Телефон обязателен'],
    trim: true
  },
  addresses: [{
    type: {
      type: String,
      enum: ['Доставка', 'Выставление счета'],
      default: 'Доставка'
    },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Россия' },
    default: { type: Boolean, default: false }
  }],
  company: {
    type: String,
    trim: true
  },
  isWholesale: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
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

// Виртуальное поле для полного имени
customerSchema.virtual('fullName').get(function() {
  let fullName = `${this.lastName} ${this.firstName}`;
  if (this.patronymic) fullName += ` ${this.patronymic}`;
  return fullName;
});

// Виртуальное поле для связи с заказами
customerSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'customer'
});

// Индексы для ускорения поиска
customerSchema.index({ firstName: 1, lastName: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ company: 1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 