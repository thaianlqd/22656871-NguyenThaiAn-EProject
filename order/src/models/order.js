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
  // SỬA LỖI: Thay đổi cấu trúc để lưu lại thông tin chi tiết của sản phẩm,
  // thay vì chỉ lưu ID. Điều này giúp service 'order' độc lập hơn.
  products: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
  }],
  
  // Trường 'user' này đã đúng, giữ nguyên
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



