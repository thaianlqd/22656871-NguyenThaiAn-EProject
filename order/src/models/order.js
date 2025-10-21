// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   products: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'products',
//     required: true,
//   }],
//   totalPrice: {
//     type: Number,
//     required: true,
//     min: 0,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// }, { collection : 'orders' });

// const Order = mongoose.model('Order', orderSchema);

// module.exports = Order;



const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [{
    // Giữ nguyên các trường của product để service order độc lập
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
  }],
  // SỬA LỖI: Thêm trường 'user' để lưu tên người mua
  user: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection : 'orders' });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

